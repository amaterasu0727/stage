-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `historique_utilisateurId_fkey` ON `historique`;

-- AlterTable
ALTER TABLE `commentaires` ADD COLUMN `interventionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `historique` MODIFY `utilisateurId` INTEGER NULL;

-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `dateLimiteFermeture` DATETIME(3) NULL,
    MODIFY `titre` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `commentaires` ADD CONSTRAINT `commentaires_interventionId_fkey` FOREIGN KEY (`interventionId`) REFERENCES `interventions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
