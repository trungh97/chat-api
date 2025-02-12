-- DropForeignKey
ALTER TABLE `deletedconversation` DROP FOREIGN KEY `DeletedConversation_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `participant` DROP FOREIGN KEY `Participant_conversation_id_fkey`;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeletedConversation` ADD CONSTRAINT `DeletedConversation_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
