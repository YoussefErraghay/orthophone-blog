-- CreateTable
CREATE TABLE `MediaFile` (
    `id` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `kind` ENUM('IMAGE', 'PDF') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaFile_storageKey_key`(`storageKey`),
    INDEX `MediaFile_kind_idx`(`kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: drop the old URL columns, add media relations.
-- The previous `pdfUrl` values were local `file://` paths that could never be
-- served to visitors, so nothing usable is lost here.
ALTER TABLE `Article` DROP COLUMN `coverImage`,
    DROP COLUMN `pdfUrl`,
    ADD COLUMN `coverImageId` VARCHAR(191) NULL,
    ADD COLUMN `pdfId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Article_coverImageId_idx` ON `Article`(`coverImageId`);

-- CreateIndex
CREATE INDEX `Article_pdfId_idx` ON `Article`(`pdfId`);

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `MediaFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_pdfId_fkey` FOREIGN KEY (`pdfId`) REFERENCES `MediaFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
