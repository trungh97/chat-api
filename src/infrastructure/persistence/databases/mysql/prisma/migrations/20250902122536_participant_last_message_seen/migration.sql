-- AlterTable
ALTER TABLE `participant` ADD COLUMN `last_received_message_id` VARCHAR(191) NULL,
    ADD COLUMN `last_seen_at` DATETIME(3) NULL,
    ADD COLUMN `last_seen_message_id` VARCHAR(191) NULL;
