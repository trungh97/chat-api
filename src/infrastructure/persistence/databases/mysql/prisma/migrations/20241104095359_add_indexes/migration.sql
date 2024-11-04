-- CreateIndex
CREATE INDEX `Contact_user_id_contact_id_idx` ON `Contact`(`user_id`, `contact_id`);

-- CreateIndex
CREATE INDEX `Participant_conversation_id_user_id_idx` ON `Participant`(`conversation_id`, `user_id`);
