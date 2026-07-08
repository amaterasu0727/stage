const prisma = require('../prisma/client');

async function telecharger(req, res) {
  const pieceJointe = await prisma.pieceJointe.findUnique({
    where: { id: Number(req.params.id) },
    include: { ticket: { include: { interventions: true } } },
  });

  if (!pieceJointe) {
    return res.status(404).json({ success: false, message: 'Pièce jointe introuvable.', errors: [] });
  }

  const role = req.utilisateur.role;
  const estAuteur = pieceJointe.ticket.auteurId === req.utilisateur.id;
  const estTechnicienAssigne = pieceJointe.ticket.interventions.some((i) => i.technicienId === req.utilisateur.id);
  const acces = role === 'ADMIN' || role === 'RESPONSABLE_TECHNIQUE' || estAuteur || estTechnicienAssigne;

  if (!acces) {
    return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
  }

  return res.download(pieceJointe.cheminFichier, pieceJointe.nomFichier);
}

async function supprimer(req, res) {
  const pieceJointe = await prisma.pieceJointe.findUnique({
    where: { id: Number(req.params.id) },
    include: { ticket: true },
  });

  if (!pieceJointe) {
    return res.status(404).json({ success: false, message: 'Pièce jointe introuvable.', errors: [] });
  }

  if (pieceJointe.ticket.auteurId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Seul l\'auteur du ticket peut supprimer cette pièce jointe.', errors: [] });
  }

  await prisma.pieceJointe.delete({ where: { id: pieceJointe.id } });

  return res.status(200).json({ success: true, message: 'Pièce jointe supprimée.' });
}

async function ajouter(req, res) {
  const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.auteurId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Seul l\'auteur du ticket peut ajouter une pièce jointe.', errors: [] });
  }

  if (ticket.statut === 'FERME') {
    return res.status(409).json({ success: false, message: 'Impossible d\'ajouter une pièce jointe à un ticket fermé.', errors: [] });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucun fichier fourni.', errors: [] });
  }

  const piecesJointes = await prisma.pieceJointe.createMany({
    data: req.files.map((fichier) => ({
      ticketId: ticket.id,
      nomFichier: fichier.filename,
      cheminFichier: fichier.path,
      typeFichier: fichier.mimetype,
      tailleFichier: fichier.size,
    })),
  });

  return res.status(201).json({ success: true, message: 'Pièce(s) jointe(s) ajoutée(s).', data: piecesJointes });
}

module.exports = { telecharger, supprimer, ajouter };