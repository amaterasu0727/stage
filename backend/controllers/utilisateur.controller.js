const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const { genererMotDePasseAleatoire, ajouterCaractereSpecial } = require('../utils/motDePasse');
const { envoyerEmailCreationCompte, envoyerEmailReinitialisation } = require('../utils/email');

async function lister(req, res) {
  const { role, serviceId, actif } = req.query;

  const filtres = {};
  if (role) filtres.role = role;
  if (serviceId) filtres.serviceId = Number(serviceId);
  if (actif !== undefined) filtres.actif = actif === 'true';

  const utilisateurs = await prisma.utilisateur.findMany({
    where: filtres,
    include: { service: true },
    orderBy: { dateCreation: 'desc' },
  });

  const sansMotDePasse = utilisateurs.map(({ motDePasse, ...reste }) => reste);

  return res.status(200).json({ success: true, data: sansMotDePasse });
}

async function obtenir(req, res) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: Number(req.params.id) },
    include: { service: true },
  });

  if (!utilisateur) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.', errors: [] });
  }

  const { motDePasse, ...sansMotDePasse } = utilisateur;

  return res.status(200).json({ success: true, data: sansMotDePasse });
}

async function creer(req, res) {
  const { nom, prenom, email, telephone, role, serviceId, motDePasse } = req.body;

  if (!nom || !prenom || !email || !telephone || !role || !serviceId) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.', errors: [] });
  }

  if (motDePasse && motDePasse.length < 6) {
    return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.', errors: [] });
  }

  const emailExistant = await prisma.utilisateur.findUnique({ where: { email } });

  if (emailExistant) {
    return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.', errors: [] });
  }

  const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });

  if (!service) {
    return res.status(404).json({ success: false, message: 'Service introuvable.', errors: [] });
  }

  const baseMotDePasse = motDePasse || genererMotDePasseAleatoire();
  const motDePasseFinal = ajouterCaractereSpecial(baseMotDePasse);
  const motDePasseHache = await bcrypt.hash(motDePasseFinal, 10);

  const utilisateur = await prisma.utilisateur.create({
    data: { nom, prenom, email, telephone, role, serviceId: Number(serviceId), motDePasse: motDePasseHache },
  });

  await prisma.journalActivite.create({
    data: { utilisateurId: req.utilisateur.id, action: 'CREATION_UTILISATEUR', details: `Compte créé pour ${email}` },
  });

  await envoyerEmailCreationCompte(email, `${prenom} ${nom}`, motDePasseFinal);

  const { motDePasse: _, ...sansMotDePasse } = utilisateur;

  return res.status(201).json({
    success: true,
    message: 'Utilisateur créé.',
    data: { utilisateur: sansMotDePasse, motDePasseGenere: motDePasseFinal },
  });
}

async function modifier(req, res) {
  const { nom, prenom, telephone, serviceId } = req.body;

  const utilisateur = await prisma.utilisateur.update({
    where: { id: Number(req.params.id) },
    data: { nom, prenom, telephone, serviceId: serviceId ? Number(serviceId) : undefined },
  });

  const { motDePasse, ...sansMotDePasse } = utilisateur;

  return res.status(200).json({ success: true, message: 'Utilisateur modifié.', data: sansMotDePasse });
}

async function desactiver(req, res) {
  await prisma.utilisateur.update({
    where: { id: Number(req.params.id) },
    data: { actif: false },
  });

  await prisma.sessionToken.updateMany({
    where: { utilisateurId: Number(req.params.id) },
    data: { revoque: true },
  });

  await prisma.journalActivite.create({
    data: { utilisateurId: req.utilisateur.id, action: 'DESACTIVATION_UTILISATEUR', details: `Utilisateur #${req.params.id} désactivé` },
  });

  return res.status(200).json({ success: true, message: 'Utilisateur désactivé.' });
}

async function reactiver(req, res) {
  await prisma.utilisateur.update({
    where: { id: Number(req.params.id) },
    data: { actif: true },
  });

  await prisma.journalActivite.create({
    data: { utilisateurId: req.utilisateur.id, action: 'REACTIVATION_UTILISATEUR', details: `Utilisateur #${req.params.id} réactivé` },
  });

  return res.status(200).json({ success: true, message: 'Utilisateur réactivé.' });
}

async function reinitialiserMotDePasse(req, res) {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: Number(req.params.id) } });

  if (!utilisateur) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.', errors: [] });
  }

  const motDePasseFinal = ajouterCaractereSpecial(genererMotDePasseAleatoire());
  const motDePasseHache = await bcrypt.hash(motDePasseFinal, 10);

  await prisma.utilisateur.update({
    where: { id: utilisateur.id },
    data: { motDePasse: motDePasseHache },
  });

  await prisma.journalActivite.create({
    data: { utilisateurId: req.utilisateur.id, action: 'REINITIALISATION_MOT_DE_PASSE', details: `Mot de passe réinitialisé pour ${utilisateur.email}` },
  });

  await envoyerEmailReinitialisation(utilisateur.email, `${utilisateur.prenom} ${utilisateur.nom}`, motDePasseFinal);

  return res.status(200).json({ success: true, message: 'Mot de passe réinitialisé.', data: { motDePasseGenere: motDePasseFinal } });
}

async function listerTechniciens(req, res) {
  const { disponible } = req.query;

  const filtres = { role: 'TECHNICIEN', actif: true };
  if (disponible !== undefined) filtres.disponible = disponible === 'true';

  const techniciens = await prisma.utilisateur.findMany({
    where: filtres,
    select: { id: true, nom: true, prenom: true, email: true, disponible: true, serviceId: true },
  });

  return res.status(200).json({ success: true, data: techniciens });
}

module.exports = { lister, obtenir, creer, modifier, desactiver, reactiver, reinitialiserMotDePasse, listerTechniciens };