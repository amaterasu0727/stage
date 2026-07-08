const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/intervention.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');
const uploadJustificatif = require('../middlewares/uploadJustificatif.middleware');
const demandeControleur = require('../controllers/demandeReaffectation.controller');

routeur.use(authentifier);

routeur.get('/mes-interventions', autoriser('TECHNICIEN'), controleur.mesInterventions);
routeur.get('/:id', controleur.obtenir);
routeur.post('/:id/accepter', autoriser('TECHNICIEN'), controleur.accepter);
routeur.post('/:id/demarrer', autoriser('TECHNICIEN'), controleur.demarrer);
routeur.post('/:id/mettre-en-attente', autoriser('TECHNICIEN'), controleur.mettreEnAttente);
routeur.post('/:id/reprendre', autoriser('TECHNICIEN'), controleur.reprendre);
routeur.post('/:id/cloturer', autoriser('TECHNICIEN'), controleur.cloturer);
routeur.post('/:id/demande-reaffectation', autoriser('TECHNICIEN'), uploadJustificatif.single('justificatif'), demandeControleur.soumettre);

module.exports = routeur;