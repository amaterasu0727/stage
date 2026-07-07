const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const { genererAccessToken, genererRefreshToken, verifierRefreshToken } = require('../utils/jwt');

async function login(req, res) {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.', errors: [] });
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });

  if (!utilisateur) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects.', errors: [] });
  }

  if (!utilisateur.actif) {
    return res.status(403).json({ success: false, message: 'Compte désactivé.', errors: [] });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

  if (!motDePasseValide) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects.', errors: [] });
  }

  const accessToken = genererAccessToken(utilisateur);
  const { token: refreshToken, jti } = genererRefreshToken(utilisateur);

  const dateExpiration = new Date();
  dateExpiration.setDate(dateExpiration.getDate() + 7);

  await prisma.sessionToken.create({
    data: { jti, utilisateurId: utilisateur.id, dateExpiration },
  });

  if (utilisateur.role === 'TECHNICIEN') {
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { disponible: true },
    });
  }

  await prisma.journalActivite.create({
    data: { utilisateurId: utilisateur.id, action: 'CONNEXION' },
  });

  const { motDePasse: _, ...utilisateurSansMotDePasse } = utilisateur;

  return res.status(200).json({
    success: true,
    message: 'Connexion réussie.',
    data: { accessToken, refreshToken, utilisateur: utilisateurSansMotDePasse },
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token requis.', errors: [] });
  }

  let payload;
  try {
    payload = verifierRefreshToken(refreshToken);
  } catch (erreur) {
    return res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré.', errors: [] });
  }

  const session = await prisma.sessionToken.findUnique({ where: { jti: payload.jti } });

  if (!session || session.revoque || session.dateExpiration < new Date()) {
    return res.status(401).json({ success: false, message: 'Session invalide.', errors: [] });
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: payload.id } });

  if (!utilisateur || !utilisateur.actif) {
    return res.status(401).json({ success: false, message: 'Compte introuvable ou désactivé.', errors: [] });
  }

  const accessToken = genererAccessToken(utilisateur);

  return res.status(200).json({ success: true, message: 'Token renouvelé.', data: { accessToken } });
}

async function logout(req, res) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      const payload = verifierRefreshToken(refreshToken);
      await prisma.sessionToken.updateMany({
        where: { jti: payload.jti },
        data: { revoque: true },
      });
    } catch (erreur) {}
  }

  if (req.utilisateur.role === 'TECHNICIEN') {
    await prisma.utilisateur.update({
      where: { id: req.utilisateur.id },
      data: { disponible: false },
    });
  }

  await prisma.journalActivite.create({
    data: { utilisateurId: req.utilisateur.id, action: 'DECONNEXION' },
  });

  return res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
}

async function moi(req, res) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: req.utilisateur.id },
    include: { service: true },
  });

  const { motDePasse: _, ...utilisateurSansMotDePasse } = utilisateur;

  return res.status(200).json({ success: true, data: utilisateurSansMotDePasse });
}

async function changerMotDePasse(req, res) {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants.', errors: [] });
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: req.utilisateur.id } });

  const motDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);

  if (!motDePasseValide) {
    return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect.', errors: [] });
  }

  const nouveauMotDePasseHache = await bcrypt.hash(nouveauMotDePasse, 10);

  await prisma.utilisateur.update({
    where: { id: utilisateur.id },
    data: { motDePasse: nouveauMotDePasseHache },
  });

  return res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès.' });
}

module.exports = { login, refresh, logout, moi, changerMotDePasse };