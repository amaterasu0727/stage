const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/demandeReaffectation.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');
const uploadJustificatif = require('../middlewares/uploadJustificatif.middleware');

routeur.use(authentifier);

routeur.get('/', autoriser('RESPONSABLE_TECHNIQUE'), controleur.lister);
routeur.get('/mes-demandes', autoriser('TECHNICIEN'), controleur.mesDemandes);
routeur.patch('/:id/accepter', autoriser('RESPONSABLE_TECHNIQUE'), controleur.accepter);
routeur.patch('/:id/refuser', autoriser('RESPONSABLE_TECHNIQUE'), controleur.refuser);
routeur.get('/:id/justificatif', controleur.telechargerJustificatif);

module.exports = routeur;