const prisma = require('../prisma/client');

async function lister(req, res) {
  const { lu } = req.query;

  const filtres = { destinataireId: req.utilisateur.id };
  if (lu !== undefined) filtres.lu = lu === 'true';

  const notifications = await prisma.notification.findMany({
    where: filtres,
    orderBy: { dateEnvoi: 'desc' },
  });

  return res.status(200).json({ success: true, data: notifications });
}

async function marquerLue(req, res) {
  const notification = await prisma.notification.findUnique({ where: { id: Number(req.params.id) } });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification introuvable.', errors: [] });
  }

  if (notification.destinataireId !== req.utilisateur.id) {
    return res.status(403).json({ success: false, message: 'Accès refusé.', errors: [] });
  }

  const notificationMiseAJour = await prisma.notification.update({
    where: { id: notification.id },
    data: { lu: true },
  });

  return res.status(200).json({ success: true, message: 'Notification marquée comme lue.', data: notificationMiseAJour });
}

async function marquerToutesLues(req, res) {
  await prisma.notification.updateMany({
    where: { destinataireId: req.utilisateur.id, lu: false },
    data: { lu: true },
  });

  return res.status(200).json({ success: true, message: 'Toutes les notifications ont été marquées comme lues.' });
}

module.exports = { lister, marquerLue, marquerToutesLues };