-- AlterTable
ALTER TABLE `message` ADD COLUMN `client_message_id` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `participant` ADD COLUMN `last_received_message_at` DATETIME(3) NULL,
    ADD COLUMN `last_seen_message_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Message_sender_id_client_message_id_key` ON `Message`(`sender_id`, `client_message_id`);

-- Backfill: copy the createdAt of each participant's existing pointer messages
UPDATE `participant` p
    JOIN `message` m ON m.`id` = p.`last_seen_message_id`
SET p.`last_seen_message_at` = m.`created_at`;

UPDATE `participant` p
    JOIN `message` m ON m.`id` = p.`last_received_message_id`
SET p.`last_received_message_at` = m.`created_at`;
