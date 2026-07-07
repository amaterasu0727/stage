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

app.listen(PORT, () => {
  console.log(`=== SERVEUR DEMARRE ===`);
  console.log(`URL : http://localhost:${PORT}`);
  console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
});