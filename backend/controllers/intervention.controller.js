const prisma = require('../prisma/client');
const { envoyerEmailAffectation, envoyerEmailCloture } = require('../utils/email');

async function affecter(req, res) {
  const { technicienId } = req.body;

  if (!technicienId) {
    return res.status(400).json({ success: false, message: 'Le technicien est obligatoire.', errors: [] });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.statut !== 'NOUVEAU') {
    return res.status(409).json({ success: false, message: 'Ce ticket est déjà affecté, utilisez la réaffectation.', errors: [] });
  }

  const technicien = await prisma.utilisateur.findUnique({ where: { id: Number(technicienId) } });

  if (!technicien || technicien.role !== 'TECHNICIEN') {
    return res.status(404).json({ success: false, message: 'Technicien introuvable.', errors: [] });
  }

  const intervention = await prisma.intervention.create({
    data: { ticketId: ticket.id, technicienId: technicien.id, affectateurId: req.utilisateur.id },
  });

  await prisma.ticket.update({ where: { id: ticket.id }, data: { statut: 'AFFECTE' } });

  await prisma.historique.create({
    data: { ticketId: ticket.id, utilisateurId: req.utilisateur.id, action: 'AFFECTATION', nouvelleValeur: `${technicien.prenom} ${technicien.nom}` },
  });

  await prisma.notification.create({
    data: { destinataireId: technicien.id, ticketId: ticket.id, titre: 'Nouveau ticket affecté', message: `Le ticket ${ticket.numero} vous a été affecté.` },
  });

  await envoyerEmailAffectation(technicien.email, `${technicien.prenom} ${technicien.nom}`, ticket.numero);

  return res.status(201).json({ success: true, message: 'Ticket affecté.', data: intervention });
}

async function reaffecter(req, res) {
  const { technicienId } = req.body;

  if (!technicienId) {
    return res.status(400).json({ success: false, message: 'Le technicien est obligatoire.', errors: [] });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.statut === 'NOUVEAU' || ticket.statut === 'RESOLU' || ticket.statut === 'FERME') {
    return res.status(409).json({ success: false, message: 'Ce ticket ne peut pas être réaffecté dans son statut actuel.', errors: [] });
  }

  const technicien = await prisma.utilisateur.findUnique({ where: { id: Number(technicienId) } });

  if (!technicien || technicien.role !== 'TECHNICIEN') {
    return res.status(404).json({ success: false, message: 'Technicien introuvable.', errors: [] });
  }

  const intervention = await prisma.intervention.create({
    data: { ticketId: ticket.id, technicienId: technicien.id, affectateurId: req.utilisateur.id },
  });

  await prisma.ticket.update({ where: { id: ticket.id }, data: { statut: 'AFFECTE' } });

  await prisma.historique.create({
    data: { ticketId: ticket.id, utilisateurId: req.utilisateur.id, action: 'REAFFECTATION', nouvelleValeur: `${technicien.prenom} ${technicien.nom}` },
  });

  await prisma.notification.create({
    data: { destinataireId: technicien.id, ticketId: ticket.id, titre: 'Ticket réaffecté', message: `Le ticket ${ticket.numero} vous a été réaffecté.` },
  });

  await envoyerEmailAffectation(technicien.email, `${technicien.prenom} ${technicien.nom}`, ticket.numero);

  return res.status(201).json({ success: true, message: 'Ticket réaffecté.', data: intervention });
}

async function verifierPropriete(req, res, intervention) {
  if (intervention.technicienId !== req.utilisateur.id) {
    res.status(403).json({ success: false, message: 'Cette intervention ne vous appartient pas.', errors: [] });
    return false;
  }
  return true;
}

async function accepter(req, res) {
  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (!(await verifierPropriete(req, res, intervention))) return;

  const interventionMiseAJour = await prisma.intervention.update({
    where: { id: intervention.id },
    data: { accepte: true, dateAcceptation: new Date() },
  });

  return res.status(200).json({ success: true, message: 'Intervention acceptée.', data: interventionMiseAJour });
}

async function demarrer(req, res) {
  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (!(await verifierPropriete(req, res, intervention))) return;

  if (!intervention.accepte) {
    return res.status(409).json({ success: false, message: 'Vous devez accepter l\'intervention avant de la démarrer.', errors: [] });
  }

  const interventionMiseAJour = await prisma.intervention.update({
    where: { id: intervention.id },
    data: { statut: 'EN_COURS', dateDebut: new Date() },
  });

  await prisma.ticket.update({ where: { id: intervention.ticketId }, data: { statut: 'EN_COURS' } });

  await prisma.historique.create({
    data: { ticketId: intervention.ticketId, utilisateurId: req.utilisateur.id, action: 'CHANGEMENT_STATUT', ancienneValeur: 'AFFECTE', nouvelleValeur: 'EN_COURS' },
  });

  return res.status(200).json({ success: true, message: 'Intervention démarrée.', data: interventionMiseAJour });
}

async function mettreEnAttente(req, res) {
  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (!(await verifierPropriete(req, res, intervention))) return;

  const interventionMiseAJour = await prisma.intervention.update({
    where: { id: intervention.id },
    data: { statut: 'EN_ATTENTE' },
  });

  await prisma.ticket.update({ where: { id: intervention.ticketId }, data: { statut: 'EN_ATTENTE' } });

  return res.status(200).json({ success: true, message: 'Intervention mise en attente.', data: interventionMiseAJour });
}

async function reprendre(req, res) {
  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (!(await verifierPropriete(req, res, intervention))) return;

  const interventionMiseAJour = await prisma.intervention.update({
    where: { id: intervention.id },
    data: { statut: 'EN_COURS' },
  });

  await prisma.ticket.update({ where: { id: intervention.ticketId }, data: { statut: 'EN_COURS' } });

  return res.status(200).json({ success: true, message: 'Intervention reprise.', data: interventionMiseAJour });
}

async function cloturer(req, res) {
  const { compteRendu, commentaire } = req.body;

  if (!compteRendu) {
    return res.status(400).json({ success: false, message: 'Le compte-rendu est obligatoire.', errors: [] });
  }

  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) }, include: { ticket: true } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (!(await verifierPropriete(req, res, intervention))) return;

  const dateLimiteFermeture = new Date();
  dateLimiteFermeture.setHours(dateLimiteFermeture.getHours() + 72);

  const interventionMiseAJour = await prisma.intervention.update({
    where: { id: intervention.id },
    data: { statut: 'TERMINEE', dateFin: new Date(), compteRendu },
  });

  if (commentaire) {
    await prisma.commentaire.create({
      data: { ticketId: intervention.ticketId, interventionId: intervention.id, auteurId: req.utilisateur.id, contenu: commentaire },
    });
  }

  await prisma.ticket.update({
    where: { id: intervention.ticketId },
    data: { statut: 'RESOLU', dateLimiteFermeture },
  });

  await prisma.historique.create({
    data: { ticketId: intervention.ticketId, utilisateurId: req.utilisateur.id, action: 'CHANGEMENT_STATUT', ancienneValeur: 'EN_COURS', nouvelleValeur: 'RESOLU' },
  });

  const auteur = await prisma.utilisateur.findUnique({ where: { id: intervention.ticket.auteurId } });

  await prisma.notification.create({
    data: { destinataireId: auteur.id, ticketId: intervention.ticketId, titre: 'Ticket résolu', message: `Le ticket ${intervention.ticket.numero} a été résolu. Vous avez 72h pour le fermer ou commenter.` },
  });

  await envoyerEmailCloture(auteur.email, `${auteur.prenom} ${auteur.nom}`, intervention.ticket.numero);

  return res.status(200).json({ success: true, message: 'Intervention clôturée.', data: interventionMiseAJour });
}

async function mesInterventions(req, res) {
  const { statut } = req.query;

  const filtres = { technicienId: req.utilisateur.id };
  if (statut) filtres.statut = statut;

  const interventions = await prisma.intervention.findMany({
    where: filtres,
    include: { ticket: true },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: interventions });
}

async function obtenir(req, res) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      ticket: true,
      technicien: { select: { id: true, nom: true, prenom: true } },
      affectateur: { select: { id: true, nom: true, prenom: true } },
      demandesReaffectation: true,
    },
  });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  return res.status(200).json({ success: true, data: intervention });
}

module.exports = { affecter, reaffecter, accepter, demarrer, mettreEnAttente, reprendre, cloturer, mesInterventions, obtenir };