-- Update test_case status ENUM values to Todo, In Progress, Resolved
ALTER TABLE `test_cases` 
MODIFY COLUMN `status` ENUM('TODO', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'TODO';

-- Migrate existing data
UPDATE `test_cases` SET `status` = 'TODO' WHERE `status` IN ('ACTIVE', 'DRAFT', 'UNDER_REVIEW');
UPDATE `test_cases` SET `status` = 'RESOLVED' WHERE `status` = 'DEPRECATED';

