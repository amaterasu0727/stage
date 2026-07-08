const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/journalActivite.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);
routeur.use(autoriser('ADMIN'));

routeur.get('/', controleur.lister);
routeur.post('/declencher-fermeture-auto', controleur.declencherFermetureAuto);
module.exports = routeur;