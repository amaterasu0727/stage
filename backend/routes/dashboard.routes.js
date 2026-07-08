const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/export.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);
routeur.use(autoriser('RESPONSABLE_TECHNIQUE'));

routeur.get('/tickets/pdf', controleur.exporterPdf);
routeur.get('/tickets/excel', controleur.exporterExcel);

module.exports = routeur;