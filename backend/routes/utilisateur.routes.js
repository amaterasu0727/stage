const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/utilisateur.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/techniciens', autoriser('RESPONSABLE_TECHNIQUE', 'ADMIN'), controleur.listerTechniciens);
routeur.get('/', autoriser('ADMIN'), controleur.lister);
routeur.get('/:id', autoriser('ADMIN'), controleur.obtenir);
routeur.post('/', autoriser('ADMIN'), controleur.creer);
routeur.put('/:id', autoriser('ADMIN'), controleur.modifier);
routeur.patch('/:id/desactiver', autoriser('ADMIN'), controleur.desactiver);
routeur.patch('/:id/reactiver', autoriser('ADMIN'), controleur.reactiver);
routeur.post('/:id/reinitialiser-mot-de-passe', autoriser('ADMIN'), controleur.reinitialiserMotDePasse);

module.exports = routeur;