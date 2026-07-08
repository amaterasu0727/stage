const prisma = require('../prisma/client');

async function agent(req, res) {
  const auteurId = req.utilisateur.id;

  const [crees, ouverts, enAttente, resolus, fermes, notificationsRecentes] = await Promise.all([
    prisma.ticket.count({ where: { auteurId } }),
    prisma.ticket.count({ where: { auteurId, statut: { in: ['NOUVEAU', 'AFFECTE', 'EN_COURS'] } } }),
    prisma.ticket.count({ where: { auteurId, statut: 'EN_ATTENTE' } }),
    prisma.ticket.count({ where: { auteurId, statut: 'RESOLU' } }),
    prisma.ticket.count({ where: { auteurId, statut: 'FERME' } }),
    prisma.notification.findMany({ where: { destinataireId: auteurId }, orderBy: { dateEnvoi: 'desc' }, take: 5 }),
  ]);

  return res.status(200).json({ success: true, data: { crees, ouverts, enAttente, resolus, fermes, notificationsRecentes } });
}

async function technicien(req, res) {
  const technicienId = req.utilisateur.id;

  const [affectes, enCours, enAttente, terminees, dernieresAffectations] = await Promise.all([
    prisma.intervention.count({ where: { technicienId } }),
    prisma.intervention.count({ where: { technicienId, statut: 'EN_COURS' } }),
    prisma.intervention.count({ where: { technicienId, statut: 'EN_ATTENTE' } }),
    prisma.intervention.count({ where: { technicienId, statut: 'TERMINEE' } }),
    prisma.intervention.findMany({
      where: { technicienId },
      include: { ticket: true },
      orderBy: { dateCreation: 'desc' },
      take: 5,
    }),
  ]);

  return res.status(200).json({ success: true, data: { affectes, enCours, enAttente, terminees, dernieresAffectations } });
}

async function responsable(req, res) {
  const responsableId = req.utilisateur.id;

  const [nonAffectes, critiques, parPriorite, parTechnicien, parCategorie, ticketsAffectesParMoi, resolusPourDelai] = await Promise.all([
    prisma.ticket.count({ where: { statut: 'NOUVEAU' } }),
    prisma.ticket.count({ where: { priorite: 'CRITIQUE', statut: { notIn: ['RESOLU', 'FERME'] } } }),
    prisma.ticket.groupBy({ by: ['priorite'], _count: true }),
    prisma.intervention.groupBy({ by: ['technicienId'], _count: true }),
    prisma.ticket.groupBy({ by: ['categorieId'], _count: true }),
    prisma.intervention.findMany({
      where: { affectateurId: responsableId },
      include: { ticket: true, technicien: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { dateCreation: 'desc' },
    }),
    prisma.ticket.findMany({
      where: { statut: { in: ['RESOLU', 'FERME'] } },
      include: { interventions: { orderBy: { dateFin: 'desc' }, take: 1 } },
    }),
  ]);

  const delais = resolusPourDelai
    .filter((t) => t.interventions[0] && t.interventions[0].dateFin)
    .map((t) => (new Date(t.interventions[0].dateFin) - new Date(t.dateCreation)) / (1000 * 60 * 60 * 24));

  const tempsMoyenTraitement = delais.length > 0 ? (delais.reduce((a, b) => a + b, 0) / delais.length).toFixed(1) : null;

  return res.status(200).json({
    success: true,
    data: {
      nonAffectes,
      critiques,
      parPriorite,
      parTechnicien,
      parCategorie,
      tempsMoyenTraitementJours: tempsMoyenTraitement,
      totalAffectesParMoi: ticketsAffectesParMoi.length,
      mesAffectations: ticketsAffectesParMoi.map((i) => ({
        ticketId: i.ticketId,
        numero: i.ticket.numero,
        technicien: i.technicien,
      })),
    },
  });
}

async function admin(req, res) {
  const [utilisateurs, services, categories, desactives, activiteRecente] = await Promise.all([
    prisma.utilisateur.count(),
    prisma.service.count(),
    prisma.categorie.count(),
    prisma.utilisateur.count({ where: { actif: false } }),
    prisma.journalActivite.findMany({
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ]);

  return res.status(200).json({ success: true, data: { utilisateurs, services, categories, desactives, activiteRecente } });
}

module.exports = { agent, technicien, responsable, admin };