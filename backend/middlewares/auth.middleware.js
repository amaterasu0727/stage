const { verifierAccessToken } = require('../utils/jwt');

function authentifier(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant.', errors: [] });
  }
  const token = enTete.split(' ')[1];
  try {
    const payload = verifierAccessToken(token);
    req.utilisateur = payload;
    next();
  } catch (erreur) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.', errors: [] });
  }
}

function autoriser(...rolesAutorises) {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
    }
    next();
  };
}

module.exports = { authentifier, autoriser };