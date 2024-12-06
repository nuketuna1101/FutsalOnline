/*
  Warnings:

  - A unique constraint covering the columns `[userTeamsId]` on the table `TransferMarket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TransferMarket_userTeamsId_key` ON `TransferMarket`(`userTeamsId`);
