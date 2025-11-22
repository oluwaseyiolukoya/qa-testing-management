-- Add assigned_to column to test_cases table
-- This allows test cases to be assigned to specific users

ALTER TABLE `test_cases` 
ADD COLUMN `assigned_to` VARCHAR(36) NULL AFTER `created_by`,
ADD CONSTRAINT `fk_test_cases_assigned_to` 
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Add index for better query performance
ALTER TABLE `test_cases` 
ADD INDEX `idx_test_cases_assigned_to` (`assigned_to`);

