const prisma = require('../prisma/client');
const { genererNumeroTicket } = require('../utils/numeroTicket');

async function creer(req, res) {
  const { titre, description, categorieId } = req.body;

  if (!description) {
    return res.status(400).json({ success: false, message: 'La description est obligatoire.', errors: [] });
  }

  const agent = await prisma.utilisateur.findUnique({ where: { id: req.utilisateur.id } });
  const service = await prisma.service.findUnique({ where: { id: agent.serviceId } });

  const numero = await genererNumeroTicket(prisma, service);

  const ticket = await prisma.ticket.create({
    data: {
      numero,
      titre: titre || null,
      description,
      serviceId: service.id,
      categorieId: categorieId ? Number(categorieId) : null,
      auteurId: agent.id,
    },
  });

  if (req.files && req.files.length > 0) {
    await prisma.pieceJointe.createMany({
      data: req.files.map((fichier) => ({
        ticketId: ticket.id,
        nomFichier: fichier.filename,
        cheminFichier: fichier.path,
        typeFichier: fichier.mimetype,
        tailleFichier: fichier.size,
      })),
    });
  }

  await prisma.historique.create({
    data: { ticketId: ticket.id, utilisateurId: agent.id, action: 'CREATION', nouvelleValeur: 'NOUVEAU' },
  });

  await prisma.notification.create({
    data: { destinataireId: agent.id, ticketId: ticket.id, titre: 'Ticket créé', message: `Votre ticket ${numero} a été créé avec succès.` },
  });

  const responsables = await prisma.utilisateur.findMany({ where: { role: 'RESPONSABLE_TECHNIQUE', actif: true } });

  await Promise.all(
    responsables.map((responsable) =>
      prisma.notification.create({
        data: { destinataireId: responsable.id, ticketId: ticket.id, titre: 'Nouveau ticket', message: `Le ticket ${numero} attend une affectation.` },
      })
    )
  );

  return res.status(201).json({ success: true, message: 'Ticket créé.', data: ticket });
}

function construireFiltresVisibilite(req, filtres) {
  if (req.utilisateur.role === 'AGENT') {
    filtres.auteurId = req.utilisateur.id;
  }
  if (req.utilisateur.role === 'TECHNICIEN') {
    filtres.interventions = { some: { technicienId: req.utilisateur.id } };
  }
  return filtres;
}

async function lister(req, res) {
  const { statut, priorite, serviceId, categorieId, technicienId } = req.query;

  const filtres = {};
  if (statut) filtres.statut = statut;
  if (priorite) filtres.priorite = priorite;
  if (serviceId) filtres.serviceId = Number(serviceId);
  if (categorieId) filtres.categorieId = Number(categorieId);
  if (technicienId) filtres.interventions = { some: { technicienId: Number(technicienId) } };

  construireFiltresVisibilite(req, filtres);

  const tickets = await prisma.ticket.findMany({
    where: filtres,
    include: {
      service: true,
      categorie: true,
      auteur: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: tickets });
}

async function mesTickets(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: { auteurId: req.utilisateur.id },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: tickets });
}

async function nonAffectes(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: { statut: 'NOUVEAU' },
    include: { service: true, categorie: true, auteur: { select: { id: true, nom: true, prenom: true } } },
    orderBy: { dateCreation: 'asc' },
  });

  return res.status(200).json({ success: true, data: tickets });
}

async function obtenir(req, res) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      service: true,
      categorie: true,
      auteur: { select: { id: true, nom: true, prenom: true, telephone: true } },
      interventions: {
        include: {
          technicien: { select: { id: true, nom: true, prenom: true } },
          affectateur: { select: { id: true, nom: true, prenom: true } },
        },
      },
      commentaires: { include: { auteur: { select: { id: true, nom: true, prenom: true } } }, orderBy: { dateCreation: 'asc' } },
      piecesJointes: true,
    },
  });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  const role = req.utilisateur.role;
  const estAuteur = ticket.auteurId === req.utilisateur.id;
  const estTechnicienAssigne = ticket.interventions.some((i) => i.technicienId === req.utilisateur.id);

  if (role === 'AGENT' && !estAuteur) {
    return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
  }
  if (role === 'TECHNICIEN' && !estTechnicienAssigne) {
    return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
  }

  return res.status(200).json({ success: true, data: ticket });
}

async function changerPriorite(req, res) {
  const { priorite } = req.body;
  const prioritesValides = ['CRITIQUE', 'HAUTE', 'NORMALE', 'BASSE'];

  if (!prioritesValides.includes(priorite)) {
    return res.status(400).json({ success: false, message: 'Priorité invalide.', errors: [] });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  const ticketMisAJour = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { priorite },
  });

  await prisma.historique.create({
    data: {
      ticketId: ticket.id,
      utilisateurId: req.utilisateur.id,
      action: 'CHANGEMENT_PRIORITE',
      ancienneValeur: ticket.priorite || 'AUCUNE',
      nouvelleValeur: priorite,
    },
  });

  return res.status(200).json({ success: true, message: 'Priorité mise à jour.', data: ticketMisAJour });
}

async function fermer(req, res) {
  const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.auteurId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Seul l\'auteur du ticket peut le fermer.', errors: [] });
  }

  if (ticket.statut !== 'RESOLU') {
    return res.status(409).json({ success: false, message: 'Seul un ticket résolu peut être fermé.', errors: [] });
  }

  const ticketFerme = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { statut: 'FERME' },
  });

  await prisma.historique.create({
    data: { ticketId: ticket.id, utilisateurId: req.utilisateur.id, action: 'FERMETURE', ancienneValeur: 'RESOLU', nouvelleValeur: 'FERME' },
  });

  return res.status(200).json({ success: true, message: 'Ticket fermé.', data: ticketFerme });
}

async function historique(req, res) {
  const historiques = await prisma.historique.findMany({
    where: { ticketId: Number(req.params.id) },
    include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    orderBy: { date: 'desc' },
  });

  return res.status(200).json({ success: true, data: historiques });
}

async function commentaireValidation(req, res) {
  const { contenu } = req.body;

  if (!contenu) {
    return res.status(400).json({ success: false, message: 'Le contenu du commentaire est obligatoire.', errors: [] });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: { interventions: { orderBy: { dateCreation: 'desc' }, take: 1 } },
  });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.auteurId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Seul l\'auteur du ticket peut laisser ce commentaire.', errors: [] });
  }

  if (ticket.statut !== 'RESOLU') {
    return res.status(409).json({ success: false, message: 'Ce commentaire n\'est possible que sur un ticket résolu, en attente de fermeture.', errors: [] });
  }

  const commentaire = await prisma.commentaire.create({
    data: { ticketId: ticket.id, auteurId: req.utilisateur.id, contenu },
  });

  const nouvelleDateLimite = new Date();
  nouvelleDateLimite.setHours(nouvelleDateLimite.getHours() + 72);

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { dateLimiteFermeture: nouvelleDateLimite },
  });

  await prisma.historique.create({
    data: { ticketId: ticket.id, utilisateurId: req.utilisateur.id, action: 'COMMENTAIRE_VALIDATION' },
  });

  const derniereIntervention = ticket.interventions[0];

  if (derniereIntervention) {
    await prisma.notification.create({
      data: {
        destinataireId: derniereIntervention.technicienId,
        ticketId: ticket.id,
        titre: 'Commentaire sur ticket résolu',
        message: `L'agent a laissé un commentaire sur le ticket ${ticket.numero}.`,
      },
    });

    await prisma.notification.create({
      data: {
        destinataireId: derniereIntervention.affectateurId,
        ticketId: ticket.id,
        titre: 'Commentaire sur ticket résolu',
        message: `L'agent a laissé un commentaire sur le ticket ${ticket.numero}.`,
      },
    });
  }

  return res.status(201).json({ success: true, message: 'Commentaire ajouté. Délai de fermeture repoussé de 72h.', data: commentaire });
}

async function listerCommentaires(req, res) {
  const commentaires = await prisma.commentaire.findMany({
    where: { ticketId: Number(req.params.id) },
    include: { auteur: { select: { id: true, nom: true, prenom: true, role: true } } },
    orderBy: { dateCreation: 'asc' },
  });

  return res.status(200).json({ success: true, data: commentaires });
}

module.exports = { creer, lister, mesTickets, nonAffectes, obtenir, changerPriorite, fermer, historique, commentaireValidation, listerCommentaires };