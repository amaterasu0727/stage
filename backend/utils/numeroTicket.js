function normaliser(texte) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
}

async function obtenirCodeService(prisma, service) {
  const base = normaliser(service.nom).slice(0, 4);
  const autresServices = await prisma.service.findMany({ where: { id: { not: service.id } } });
  const collision = autresServices.some((s) => normaliser(s.nom).slice(0, 4) === base);
  return collision ? `${base}${service.id}` : base;
}

async function genererNumeroTicket(prisma, service) {
  const annee = new Date().getFullYear();
  const code = await obtenirCodeService(prisma, service);

  const compteur = await prisma.$transaction(async (tx) => {
    const existant = await tx.compteurTicket.findUnique({
      where: { serviceId_annee: { serviceId: service.id, annee } },
    });

    if (existant) {
      return tx.compteurTicket.update({
        where: { id: existant.id },
        data: { dernierNumero: { increment: 1 } },
      });
    }

    return tx.compteurTicket.create({
      data: { serviceId: service.id, annee, dernierNumero: 1 },
    });
  });

  const sequence = String(compteur.dernierNumero).padStart(6, '0');
  return `${code}-${annee}-${sequence}`;
}

module.exports = { genererNumeroTicket, obtenirCodeService };