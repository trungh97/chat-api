/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `CredentialBasedAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `FederatedCredential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CredentialBasedAuth_user_id_key` ON `CredentialBasedAuth`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `FederatedCredential_user_id_key` ON `FederatedCredential`(`user_id`);
