-- AlterTable
ALTER TABLE `message` ADD COLUMN `status` ENUM('SENDING', 'SENT', 'DELIVERED', 'SEEN', 'ERROR') NULL;
