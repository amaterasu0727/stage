const nodemailer = require('nodemailer');

const transporteur = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function envoyerEmailCreationCompte(destinataire, nomComplet, motDePasse) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: 'Création de votre compte — Plateforme de ticketing',
      text: `Bonjour ${nomComplet},\n\nVotre compte a été créé.\nEmail : ${destinataire}\nMot de passe : ${motDePasse}\n\nVous pouvez le modifier à tout moment depuis votre profil.`,
    });
  } catch (erreur) {
    console.error('Erreur envoi email création compte :', erreur.message);
  }
}

async function envoyerEmailReinitialisation(destinataire, nomComplet, motDePasse) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour ${nomComplet},\n\nVotre mot de passe a été réinitialisé par un administrateur.\nNouveau mot de passe : ${motDePasse}\n\nVous pouvez le modifier à tout moment depuis votre profil.`,
    });
  } catch (erreur) {
    console.error('Erreur envoi email réinitialisation :', erreur.message);
  }
}
async function envoyerEmailAffectation(destinataire, nomComplet, numeroTicket) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: `Ticket ${numeroTicket} affecté`,
      text: `Bonjour ${nomComplet},\n\nLe ticket ${numeroTicket} vous a été affecté. Connectez-vous à la plateforme pour le consulter.`,
    });
  } catch (erreur) {
    console.error('Erreur envoi email affectation :', erreur.message);
  }
}

async function envoyerEmailCloture(destinataire, nomComplet, numeroTicket) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: `Ticket ${numeroTicket} résolu`,
      text: `Bonjour ${nomComplet},\n\nLe ticket ${numeroTicket} a été marqué comme résolu par le technicien. Vous pouvez le fermer depuis la plateforme, ou il se fermera automatiquement sous 72h sans action de votre part.`,
    });
  } catch (erreur) {
    console.error('Erreur envoi email clôture :', erreur.message);
  }
}
async function envoyerEmailFermetureAutomatique(destinataire, nomComplet, numeroTicket) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: `Ticket ${numeroTicket} fermé automatiquement`,
      text: `Bonjour ${nomComplet},\n\nLe ticket ${numeroTicket} a été fermé automatiquement après 72h sans action de votre part.`,
    });
  } catch (erreur) {
    console.error('Erreur envoi email fermeture automatique :', erreur.message);
  }
}
module.exports = { envoyerEmailCreationCompte, envoyerEmailReinitialisation, envoyerEmailAffectation, envoyerEmailCloture, envoyerEmailFermetureAutomatique };