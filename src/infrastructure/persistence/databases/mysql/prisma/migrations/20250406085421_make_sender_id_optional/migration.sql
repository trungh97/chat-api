-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_sender_id_fkey`;

-- AlterTable
ALTER TABLE `message` MODIFY `sender_id` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
