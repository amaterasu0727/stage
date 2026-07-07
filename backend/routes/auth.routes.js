const express = require('express');
const routeur = express.Router();
const { login, refresh, logout, moi, changerMotDePasse } = require('../controllers/auth.controller');
const { authentifier } = require('../middlewares/auth.middleware');

routeur.post('/login', login);
routeur.post('/refresh', refresh);
routeur.post('/logout', authentifier, logout);
routeur.get('/me', authentifier, moi);
routeur.put('/changer-mot-de-passe', authentifier, changerMotDePasse);

module.exports = routeur;