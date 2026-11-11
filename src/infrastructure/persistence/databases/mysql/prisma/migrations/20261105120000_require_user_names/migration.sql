-- Backfill missing names with the part of the email before the @ before making them required.
UPDATE `User` SET `first_name` = SUBSTRING_INDEX(`email`, '@', 1)
WHERE `first_name` IS NULL OR TRIM(`first_name`) = '';

UPDATE `User` SET `last_name` = SUBSTRING_INDEX(`email`, '@', 1)
WHERE `last_name` IS NULL OR TRIM(`last_name`) = '';

-- AlterTable
ALTER TABLE `User` MODIFY `first_name` VARCHAR(255) NOT NULL,
    MODIFY `last_name` VARCHAR(255) NOT NULL;
