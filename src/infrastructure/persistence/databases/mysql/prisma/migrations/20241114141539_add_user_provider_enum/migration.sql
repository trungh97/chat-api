/*
  Warnings:

  - You are about to alter the column `provider` on the `federatedcredential` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `federatedcredential` MODIFY `provider` ENUM('GOOGLE', 'FACEBOOK') NOT NULL;
