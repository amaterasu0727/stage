const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

function genererAccessToken(utilisateur) {
  return jwt.sign(
    { id: utilisateur.id, role: utilisateur.role, serviceId: utilisateur.serviceId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function genererRefreshToken(utilisateur) {
  const jti = randomUUID();
  const token = jwt.sign(
    { id: utilisateur.id, jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { token, jti };
}

function verifierAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifierRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { genererAccessToken, genererRefreshToken, verifierAccessToken, verifierRefreshToken };