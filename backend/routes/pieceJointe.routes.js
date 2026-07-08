const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/pieceJointe.controller');
const { authentifier } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/:id/telecharger', controleur.telecharger);
routeur.delete('/:id', controleur.supprimer);

module.exports = routeur;