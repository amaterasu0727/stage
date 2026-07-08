const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = require('../prisma/client');

function construireFiltres(query) {
  const { statut, priorite, serviceId, categorieId, technicienId } = query;
  const filtres = {};
  if (statut) filtres.statut = statut;
  if (priorite) filtres.priorite = priorite;
  if (serviceId) filtres.serviceId = Number(serviceId);
  if (categorieId) filtres.categorieId = Number(categorieId);
  if (technicienId) filtres.interventions = { some: { technicienId: Number(technicienId) } };
  return filtres;
}

async function exporterPdf(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: construireFiltres(req.query),
    include: { service: true, categorie: true, auteur: { select: { nom: true, prenom: true } } },
    orderBy: { dateCreation: 'desc' },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=export_tickets.pdf');

  const document = new PDFDocument({ margin: 30, size: 'A4' });
  document.pipe(res);

  document.fontSize(16).text('Export des tickets', { align: 'center' });
  document.moveDown();

  tickets.forEach((ticket) => {
    document.fontSize(10).text(
      `${ticket.numero} | ${ticket.titre || 'Sans titre'} | ${ticket.statut} | ${ticket.priorite || 'Non définie'} | ${ticket.service.nom} | ${ticket.auteur.prenom} ${ticket.auteur.nom}`
    );
    document.moveDown(0.3);
  });

  document.end();
}

async function exporterExcel(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: construireFiltres(req.query),
    include: { service: true, categorie: true, auteur: { select: { nom: true, prenom: true } } },
    orderBy: { dateCreation: 'desc' },
  });

  const classeur = new ExcelJS.Workbook();
  const feuille = classeur.addWorksheet('Tickets');

  feuille.columns = [
    { header: 'Numéro', key: 'numero', width: 20 },
    { header: 'Titre', key: 'titre', width: 30 },
    { header: 'Statut', key: 'statut', width: 15 },
    { header: 'Priorité', key: 'priorite', width: 12 },
    { header: 'Service', key: 'service', width: 20 },
    { header: 'Catégorie', key: 'categorie', width: 20 },
    { header: 'Auteur', key: 'auteur', width: 25 },
    { header: 'Date création', key: 'dateCreation', width: 20 },
  ];

  tickets.forEach((ticket) => {
    feuille.addRow({
      numero: ticket.numero,
      titre: ticket.titre || '',
      statut: ticket.statut,
      priorite: ticket.priorite || '',
      service: ticket.service.nom,
      categorie: ticket.categorie ? ticket.categorie.nom : '',
      auteur: `${ticket.auteur.prenom} ${ticket.auteur.nom}`,
      dateCreation: ticket.dateCreation.toISOString().slice(0, 10),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=export_tickets.xlsx');

  await classeur.xlsx.write(res);
  res.end();
}

module.exports = { exporterPdf, exporterExcel };