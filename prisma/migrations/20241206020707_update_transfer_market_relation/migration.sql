-- AddForeignKey
ALTER TABLE `TransferMarket` ADD CONSTRAINT `TransferMarket_userTeamsId_fkey` FOREIGN KEY (`userTeamsId`) REFERENCES `UserTeams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
