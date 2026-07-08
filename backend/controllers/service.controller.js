const prisma = require('../prisma/client');

async function lister(req, res) {
  const services = await prisma.service.findMany({ orderBy: { nom: 'asc' } });
  return res.status(200).json({ success: true, data: services });
}

async function creer(req, res) {
  const { nom, description } = req.body;

  if (!nom) {
    return res.status(400).json({ success: false, message: 'Le nom est obligatoire.', errors: [] });
  }

  const existant = await prisma.service.findUnique({ where: { nom } });

  if (existant) {
    return res.status(409).json({ success: false, message: 'Ce service existe déjà.', errors: [] });
  }

  const service = await prisma.service.create({ data: { nom, description } });

  return res.status(201).json({ success: true, message: 'Service créé.', data: service });
}

async function modifier(req, res) {
  const { nom, description } = req.body;

  const service = await prisma.service.update({
    where: { id: Number(req.params.id) },
    data: { nom, description },
  });

  return res.status(200).json({ success: true, message: 'Service modifié.', data: service });
}

async function supprimer(req, res) {
  const ticketsLies = await prisma.ticket.count({ where: { serviceId: Number(req.params.id) } });

  if (ticketsLies > 0) {
    return res.status(409).json({ success: false, message: 'Impossible de supprimer un service lié à des tickets existants.', errors: [] });
  }

  await prisma.service.delete({ where: { id: Number(req.params.id) } });

  return res.status(200).json({ success: true, message: 'Service supprimé.' });
}

module.exports = { lister, creer, modifier, supprimer };