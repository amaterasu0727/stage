const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth.routes');
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/status', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "success", 
      message: "Le serveur Express et Prisma fonctionnent parfaitement !" 
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: "Le serveur tourne, mais la connexion à la base de données a échoué.",
      error: error.message 
    });
  }
});
const { demarrerTacheFermetureAutomatique } = require('./jobs/fermetureAutomatique');

demarrerTacheFermetureAutomatique();
app.listen(PORT, () => {
  console.log(`=== SERVEUR DEMARRE ===`);
  console.log(`URL : http://localhost:${PORT}`);
  console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
});
const utilisateurRoutes = require('./routes/utilisateur.routes');
const serviceRoutes = require('./routes/service.routes');
const categorieRoutes = require('./routes/categorie.routes');

app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categorieRoutes);
const ticketRoutes = require('./routes/ticket.routes');
app.use('/api/tickets', ticketRoutes);
const interventionRoutes = require('./routes/intervention.routes');
app.use('/api/interventions', interventionRoutes);
const demandeReaffectationRoutes = require('./routes/demandeReaffectation.routes');
app.use('/api/demandes-reaffectation', demandeReaffectationRoutes);
const pieceJointeRoutes = require('./routes/pieceJointe.routes');
app.use('/api/pieces-jointes', pieceJointeRoutes);
const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);
const dashboardRoutes = require('./routes/dashboard.routes');
const exportRoutes = require('./routes/export.routes');
const journalActiviteRoutes = require('./routes/journalActivite.routes');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/journal-activite', journalActiviteRoutes);
