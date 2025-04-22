/*
  Warnings:

  - You are about to drop the column `groupAvatar` on the `conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `conversation` DROP COLUMN `groupAvatar`,
    ADD COLUMN `group_avatar` VARCHAR(191) NULL;
