CREATE TABLE `users` (
  `id` uuid PRIMARY KEY,
  `email` varchar(255) UNIQUE NOT NULL,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) UNIQUE,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `avatar` varchar(255),
  `is_active` bool DEFAULT true,
  `status` ENUM ('online', 'offline', 'busy')
);

CREATE TABLE `messages` (
  `id` uuid PRIMARY KEY,
  `sender_id` uuid NOT NULL,
  `message_type` ENUM ('text', 'image', 'video', 'file'),
  `content` varchar2,
  `reply_to_message_id` uuid,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
);

CREATE TABLE `conversation` (
  `id` uuid PRIMARY KEY,
  `title` varchar(255),
  `creator_id` uuid NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_archived` bool DEFAULT false,
  `deleted_at` datetime
);

CREATE TABLE `participants` (
  `id` uuid PRIMARY KEY,
  `conversation_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  `type` ENUM ('admin', 'member'),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
);

CREATE TABLE `deleted_messages` (
  `id` uuid PRIMARY KEY,
  `message_id` uuid,
  `user_id` uuid,
  `created_at` datetime NOT NULL
);

CREATE TABLE `deleted_conversations` (
  `id` uuid PRIMARY KEY,
  `conversation_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  `created_at` datetime NOT NULL
);

CREATE TABLE `contacts` (
  `id` uuid PRIMARY KEY,
  `user_id` uuid NOT NULL,
  `contact_id` uuid NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
);

CREATE TABLE `attachments` (
  `id` uuid PRIMARY KEY,
  `message_id` uuid NOT NULL,
  `thumb_url` varchar(255),
  `file_url` varchar(255),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
);

CREATE UNIQUE INDEX `users_index_0` ON `users` (`email`);

CREATE UNIQUE INDEX `participants_index_1` ON `participants` (`conversation_id`, `user_id`);

CREATE UNIQUE INDEX `contacts_index_2` ON `contacts` (`user_id`, `contact_id`);

ALTER TABLE `messages` ADD FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

ALTER TABLE `messages` ADD FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`id`);

ALTER TABLE `conversation` ADD FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

ALTER TABLE `participants` ADD FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`);

ALTER TABLE `participants` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `deleted_messages` ADD FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`);

ALTER TABLE `deleted_messages` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `deleted_conversations` ADD FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`);

ALTER TABLE `deleted_conversations` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `contacts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `contacts` ADD FOREIGN KEY (`contact_id`) REFERENCES `users` (`id`);

ALTER TABLE `attachments` ADD FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`);
