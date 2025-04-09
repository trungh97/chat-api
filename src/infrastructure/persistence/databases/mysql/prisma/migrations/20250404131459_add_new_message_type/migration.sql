-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_conversation_id_fkey`;

-- AlterTable
ALTER TABLE `message` MODIFY `message_type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'SYSTEM') NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
