const prisma = require('../prisma/client');

async function lister(req, res) {
  const categories = await prisma.categorie.findMany({ orderBy: { nom: 'asc' } });
  return res.status(200).json({ success: true, data: categories });
}

async function creer(req, res) {
  const { nom, description } = req.body;

  if (!nom) {
    return res.status(400).json({ success: false, message: 'Le nom est obligatoire.', errors: [] });
  }

  const existante = await prisma.categorie.findUnique({ where: { nom } });

  if (existante) {
    return res.status(409).json({ success: false, message: 'Cette catégorie existe déjà.', errors: [] });
  }

  const categorie = await prisma.categorie.create({ data: { nom, description } });

  return res.status(201).json({ success: true, message: 'Catégorie créée.', data: categorie });
}

async function modifier(req, res) {
  const { nom, description } = req.body;

  const categorie = await prisma.categorie.update({
    where: { id: Number(req.params.id) },
    data: { nom, description },
  });

  return res.status(200).json({ success: true, message: 'Catégorie modifiée.', data: categorie });
}

async function supprimer(req, res) {
  await prisma.categorie.delete({ where: { id: Number(req.params.id) } });
  return res.status(200).json({ success: true, message: 'Catégorie supprimée.' });
}

module.exports = { lister, creer, modifier, supprimer };