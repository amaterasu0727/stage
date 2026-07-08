const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/ticket.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const interventionControleur = require('../controllers/intervention.controller');
const pieceJointeControleur = require('../controllers/pieceJointe.controller');

routeur.use(authentifier);

routeur.post('/', autoriser('AGENT'), upload.array('pieceJointe', 10), controleur.creer);
routeur.get('/', controleur.lister);
routeur.get('/mes-tickets', autoriser('AGENT'), controleur.mesTickets);
routeur.get('/non-affectes', autoriser('RESPONSABLE_TECHNIQUE', 'ADMIN'), controleur.nonAffectes);
routeur.get('/:id', controleur.obtenir);
routeur.get('/:id/historique', controleur.historique);
routeur.patch('/:id/priorite', autoriser('RESPONSABLE_TECHNIQUE'), controleur.changerPriorite);
routeur.patch('/:id/fermer', autoriser('AGENT'), controleur.fermer);
routeur.post('/:id/affecter', autoriser('RESPONSABLE_TECHNIQUE'), interventionControleur.affecter);
routeur.post('/:id/reaffecter', autoriser('RESPONSABLE_TECHNIQUE'), interventionControleur.reaffecter);
routeur.post('/:id/commentaire-validation', autoriser('AGENT'), controleur.commentaireValidation);
routeur.get('/:id/commentaires', controleur.listerCommentaires);
routeur.post('/:id/pieces-jointes', autoriser('AGENT'), upload.array('pieceJointe', 10), pieceJointeControleur.ajouter);

module.exports = routeur;