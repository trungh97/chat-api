/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `CredentialBasedAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `credentialbasedauth` ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CredentialBasedAuth_phone_key` ON `CredentialBasedAuth`(`phone`);

-- CreateIndex
CREATE INDEX `FederatedCredential_user_id_provider_idx` ON `FederatedCredential`(`user_id`, `provider`);
