const prisma = require('../prisma/client');

async function soumettre(req, res) {
  const { motif } = req.body;

  if (!motif) {
    return res.status(400).json({ success: false, message: 'Le motif est obligatoire.', errors: [] });
  }

  const intervention = await prisma.intervention.findUnique({ where: { id: Number(req.params.id) }, include: { ticket: true } });

  if (!intervention) {
    return res.status(404).json({ success: false, message: 'Intervention introuvable.', errors: [] });
  }

  if (intervention.technicienId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Cette intervention ne vous appartient pas.', errors: [] });
  }

  if (intervention.statut === 'TERMINEE') {
    return res.status(409).json({ success: false, message: 'Impossible de demander une réaffectation sur une intervention déjà terminée.', errors: [] });
  }

  const demandeExistante = await prisma.demandeReaffectation.findFirst({
    where: { interventionId: intervention.id, statut: 'EN_ATTENTE' },
  });

  if (demandeExistante) {
    return res.status(409).json({ success: false, message: 'Une demande est déjà en attente pour cette intervention.', errors: [] });
  }

  const demande = await prisma.demandeReaffectation.create({
    data: {
      interventionId: intervention.id,
      technicienId: req.utilisateur.id,
      motif,
      justificatifNomFichier: req.file ? req.file.filename : null,
      justificatifChemin: req.file ? req.file.path : null,
    },
  });

  const responsables = await prisma.utilisateur.findMany({ where: { role: 'RESPONSABLE_TECHNIQUE', actif: true } });

  await Promise.all(
    responsables.map((responsable) =>
      prisma.notification.create({
        data: { destinataireId: responsable.id, ticketId: intervention.ticketId, titre: 'Demande de réaffectation', message: `Une demande de réaffectation attend votre traitement sur le ticket ${intervention.ticket.numero}.` },
      })
    )
  );

  return res.status(201).json({ success: true, message: 'Demande soumise.', data: demande });
}

async function lister(req, res) {
  const { statut } = req.query;

  const filtres = {};
  if (statut) filtres.statut = statut;

  const demandes = await prisma.demandeReaffectation.findMany({
    where: filtres,
    include: {
      technicien: { select: { id: true, nom: true, prenom: true } },
      intervention: { include: { ticket: true } },
    },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: demandes });
}

async function mesDemandes(req, res) {
  const demandes = await prisma.demandeReaffectation.findMany({
    where: { technicienId: req.utilisateur.id },
    include: { intervention: { include: { ticket: true } } },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: demandes });
}

async function accepter(req, res) {
  const { commentaireTraitement } = req.body;

  const demande = await prisma.demandeReaffectation.findUnique({ where: { id: Number(req.params.id) }, include: { technicien: true, intervention: { include: { ticket: true } } } });

  if (!demande) {
    return res.status(404).json({ success: false, message: 'Demande introuvable.', errors: [] });
  }

  if (demande.statut !== 'EN_ATTENTE') {
    return res.status(409).json({ success: false, message: 'Cette demande a déjà été traitée.', errors: [] });
  }

  const demandeMiseAJour = await prisma.demandeReaffectation.update({
    where: { id: demande.id },
    data: { statut: 'ACCEPTEE', traitantId: req.utilisateur.id, dateTraitement: new Date(), commentaireTraitement: commentaireTraitement || null },
  });

  await prisma.notification.create({
    data: { destinataireId: demande.technicienId, ticketId: demande.intervention.ticketId, titre: 'Demande acceptée', message: `Votre demande de réaffectation sur le ticket ${demande.intervention.ticket.numero} a été acceptée.` },
  });

  return res.status(200).json({ success: true, message: 'Demande acceptée. Pensez à réaffecter le ticket à un autre technicien.', data: demandeMiseAJour });
}

async function refuser(req, res) {
  const { commentaireTraitement } = req.body;

  if (!commentaireTraitement) {
    return res.status(400).json({ success: false, message: 'Un commentaire est obligatoire pour refuser une demande.', errors: [] });
  }

  const demande = await prisma.demandeReaffectation.findUnique({ where: { id: Number(req.params.id) }, include: { intervention: { include: { ticket: true } } } });

  if (!demande) {
    return res.status(404).json({ success: false, message: 'Demande introuvable.', errors: [] });
  }

  if (demande.statut !== 'EN_ATTENTE') {
    return res.status(409).json({ success: false, message: 'Cette demande a déjà été traitée.', errors: [] });
  }

  const demandeMiseAJour = await prisma.demandeReaffectation.update({
    where: { id: demande.id },
    data: { statut: 'REFUSEE', traitantId: req.utilisateur.id, dateTraitement: new Date(), commentaireTraitement },
  });

  await prisma.notification.create({
    data: { destinataireId: demande.technicienId, ticketId: demande.intervention.ticketId, titre: 'Demande refusée', message: `Votre demande de réaffectation sur le ticket ${demande.intervention.ticket.numero} a été refusée : ${commentaireTraitement}` },
  });

  return res.status(200).json({ success: true, message: 'Demande refusée.', data: demandeMiseAJour });
}

async function telechargerJustificatif(req, res) {
  const demande = await prisma.demandeReaffectation.findUnique({ where: { id: Number(req.params.id) } });

  if (!demande || !demande.justificatifChemin) {
    return res.status(404).json({ success: false, message: 'Justificatif introuvable.', errors: [] });
  }

  const estDemandeur = demande.technicienId === req.utilisateur.id;
  const estResponsable = req.utilisateur.role === 'RESPONSABLE_TECHNIQUE';

  if (!estDemandeur && !estResponsable) {
    return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
  }

  return res.download(demande.justificatifChemin, demande.justificatifNomFichier);
}

module.exports = { soumettre, lister, mesDemandes, accepter, refuser, telechargerJustificatif };