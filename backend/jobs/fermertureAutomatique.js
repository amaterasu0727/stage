const cron = require('node-cron');
const prisma = require('../prisma/client');
const { envoyerEmailFermetureAutomatique } = require('../utils/email');

async function fermerTicketsExpires() {
  const maintenant = new Date();

  const ticketsAFermer = await prisma.ticket.findMany({
    where: { statut: 'RESOLU', dateLimiteFermeture: { lte: maintenant } },
    include: { auteur: true },
  });

  for (const ticket of ticketsAFermer) {
    await prisma.ticket.update({ where: { id: ticket.id }, data: { statut: 'FERME' } });

    await prisma.historique.create({
      data: { ticketId: ticket.id, utilisateurId: null, action: 'FERMETURE_AUTOMATIQUE', ancienneValeur: 'RESOLU', nouvelleValeur: 'FERME' },
    });

    await prisma.notification.create({
      data: { destinataireId: ticket.auteurId, ticketId: ticket.id, titre: 'Ticket fermé automatiquement', message: `Le ticket ${ticket.numero} a été fermé automatiquement après 72h sans action de votre part.` },
    });

    await envoyerEmailFermetureAutomatique(ticket.auteur.email, `${ticket.auteur.prenom} ${ticket.auteur.nom}`, ticket.numero);
  }

  if (ticketsAFermer.length > 0) {
    console.log(`Fermeture automatique : ${ticketsAFermer.length} ticket(s) fermé(s).`);
  }

  return ticketsAFermer.length;
}

function demarrerTacheFermetureAutomatique() {
  cron.schedule('0 * * * *', fermerTicketsExpires);
  console.log('Tâche planifiée de fermeture automatique démarrée (vérification toutes les heures).');
}

module.exports = { demarrerTacheFermetureAutomatique, fermerTicketsExpires };