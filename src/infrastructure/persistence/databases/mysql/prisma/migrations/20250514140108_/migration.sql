/*
  Warnings:

  - A unique constraint covering the columns `[last_message_at,id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Conversation_last_message_at_id_key` ON `Conversation`(`last_message_at`, `id`);
