const prisma = require('../prisma/client');

async function lister(req, res) {
  const { utilisateurId, action, dateDebut, dateFin } = req.query;

  const filtres = {};
  if (utilisateurId) filtres.utilisateurId = Number(utilisateurId);
  if (action) filtres.action = action;
  if (dateDebut || dateFin) {
    filtres.date = {};
    if (dateDebut) filtres.date.gte = new Date(dateDebut);
    if (dateFin) filtres.date.lte = new Date(dateFin);
  }

  const entrees = await prisma.journalActivite.findMany({
    where: filtres,
    include: { utilisateur: { select: { id: true, nom: true, prenom: true, role: true } } },
    orderBy: { date: 'desc' },
  });

  return res.status(200).json({ success: true, data: entrees });
}

const { fermerTicketsExpires } = require('../jobs/fermetureAutomatique');

async function declencherFermetureAuto(req, res) {
  const nombreFermes = await fermerTicketsExpires();
  return res.status(200).json({ success: true, message: `${nombreFermes} ticket(s) fermé(s).` });
}

module.exports = { lister, declencherFermetureAuto };