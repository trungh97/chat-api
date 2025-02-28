-- CreateTable
CREATE TABLE `FriendRequest` (
    `id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `receiver_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,

    INDEX `FriendRequest_sender_id_receiver_id_idx`(`sender_id`, `receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
