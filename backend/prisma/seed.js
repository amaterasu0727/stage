const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const motDePasseHache = await bcrypt.hash('Passer123!', 10);

  const service = await prisma.service.upsert({
    where: { nom: 'Informatique' },
    update: {},
    create: { nom: 'Informatique', description: 'Service informatique central' },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'admin@ministere.gouv' },
    update: {},
    create: {
      nom: 'Admin', prenom: 'Système', email: 'admin@ministere.gouv',
      motDePasse: motDePasseHache, telephone: '0000000000',
      role: 'ADMIN', serviceId: service.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'responsable@ministere.gouv' },
    update: {},
    create: {
      nom: 'Responsable', prenom: 'Test', email: 'responsable@ministere.gouv',
      motDePasse: motDePasseHache, telephone: '0000000001',
      role: 'RESPONSABLE_TECHNIQUE', serviceId: service.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'technicien@ministere.gouv' },
    update: {},
    create: {
      nom: 'Technicien', prenom: 'Test', email: 'technicien@ministere.gouv',
      motDePasse: motDePasseHache, telephone: '0000000002',
      role: 'TECHNICIEN', serviceId: service.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'agent@ministere.gouv' },
    update: {},
    create: {
      nom: 'Agent', prenom: 'Test', email: 'agent@ministere.gouv',
      motDePasse: motDePasseHache, telephone: '0000000003',
      role: 'AGENT', serviceId: service.id,
    },
  });

  await prisma.categorie.upsert({
    where: { nom: 'Matériel' },
    update: {},
    create: { nom: 'Matériel', description: 'Problèmes matériels' },
  });

  console.log('Comptes de test créés. Mot de passe pour tous : Passer123!');
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });