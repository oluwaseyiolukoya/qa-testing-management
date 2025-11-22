-- Add case_code column to test_cases table
ALTER TABLE `test_cases` 
ADD COLUMN `case_code` VARCHAR(20) NULL AFTER `id`,
ADD UNIQUE INDEX `idx_test_cases_case_code` (`case_code`);

-- Generate case codes for existing test cases
-- Format: ProjectCode-XXX (e.g., CSC-001, CSC-002)
-- For now, using a generic prefix until we can link to projects properly
UPDATE `test_cases` tc
SET `case_code` = CONCAT('TC-', LPAD(
    (SELECT COUNT(*) FROM `test_cases` tc2 WHERE tc2.id <= tc.id), 
    3, 
    '0'
))
WHERE `case_code` IS NULL;

