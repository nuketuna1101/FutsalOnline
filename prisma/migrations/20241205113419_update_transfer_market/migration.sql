-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_nickname_key`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserElo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userRating` INTEGER NOT NULL,

    UNIQUE INDEX `UserElo_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cash` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `UserAccount_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTeams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `playerUpgrade` INTEGER NOT NULL DEFAULT 1,
    `isSquad` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserTeams_playerId_fkey`(`playerId`),
    INDEX `UserTeams_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Players` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransferMarket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userTeamsId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `matchUserId1` INTEGER NOT NULL,
    `matchUserId2` INTEGER NOT NULL,
    `matchResult` ENUM('USER1WIN', 'USER2WIN', 'DRAW') NOT NULL,

    INDEX `Matches_matchUserId1_fkey`(`matchUserId1`),
    INDEX `Matches_matchUserId2_fkey`(`matchUserId2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `technique` INTEGER NOT NULL DEFAULT 0,
    `pass` INTEGER NOT NULL DEFAULT 0,
    `pace` INTEGER NOT NULL DEFAULT 0,
    `agility` INTEGER NOT NULL DEFAULT 0,
    `defense` INTEGER NOT NULL DEFAULT 0,
    `finishing` INTEGER NOT NULL DEFAULT 0,
    `stamina` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `PlayerStats_playerId_key`(`playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INTEGER UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserElo` ADD CONSTRAINT `UserElo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAccount` ADD CONSTRAINT `UserAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeams` ADD CONSTRAINT `UserTeams_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTeams` ADD CONSTRAINT `UserTeams_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matches` ADD CONSTRAINT `Matches_matchUserId1_fkey` FOREIGN KEY (`matchUserId1`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matches` ADD CONSTRAINT `Matches_matchUserId2_fkey` FOREIGN KEY (`matchUserId2`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
