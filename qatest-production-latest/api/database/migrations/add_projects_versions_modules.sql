-- Migration: Add Projects, Versions, and Modules
-- Run this after the initial schema.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX `idx_projects_code` (`code`),
  INDEX `idx_projects_is_active` (`is_active`),
  INDEX `idx_projects_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `versions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `release_date` DATETIME,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  UNIQUE KEY `unique_project_version` (`project_id`, `name`),
  INDEX `idx_versions_project` (`project_id`),
  INDEX `idx_versions_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MODULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `modules` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  UNIQUE KEY `unique_project_module` (`project_id`, `name`),
  INDEX `idx_modules_project` (`project_id`),
  INDEX `idx_modules_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE TEST CASES TABLE
-- ============================================
-- Add new columns for project, version, and module relationships (if they don't exist)
ALTER TABLE `test_cases`
  ADD COLUMN IF NOT EXISTS `project_id` VARCHAR(36) AFTER `id`,
  ADD COLUMN IF NOT EXISTS `version_id` VARCHAR(36) AFTER `project_id`,
  ADD COLUMN IF NOT EXISTS `module_id` VARCHAR(36) AFTER `version_id`;

-- Add foreign keys (check if they exist first)
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'test_cases' 
                  AND CONSTRAINT_NAME = 'test_cases_ibfk_project');
SET @sql = IF(@fk_exists = 0, 
              'ALTER TABLE `test_cases` ADD FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE',
              'SELECT "Foreign key already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'test_cases' 
                  AND CONSTRAINT_NAME = 'test_cases_ibfk_version');
SET @sql = IF(@fk_exists = 0, 
              'ALTER TABLE `test_cases` ADD FOREIGN KEY (`version_id`) REFERENCES `versions`(`id`) ON DELETE SET NULL',
              'SELECT "Foreign key already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'test_cases' 
                  AND CONSTRAINT_NAME = 'test_cases_ibfk_module');
SET @sql = IF(@fk_exists = 0, 
              'ALTER TABLE `test_cases` ADD FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE SET NULL',
              'SELECT "Foreign key already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS `idx_test_cases_project` ON `test_cases`(`project_id`);
CREATE INDEX IF NOT EXISTS `idx_test_cases_version` ON `test_cases`(`version_id`);
CREATE INDEX IF NOT EXISTS `idx_test_cases_module_id` ON `test_cases`(`module_id`);

-- Keep the old `module` column for backward compatibility (can be removed later)
-- The new `module_id` will be the primary reference

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INSERT DEFAULT PROJECT (for existing data)
-- ============================================
INSERT INTO `projects` (`id`, `name`, `description`, `code`, `is_active`, `created_by`)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  'Default Project',
  'Default project for existing test cases',
  'DEFAULT',
  TRUE,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE code = 'DEFAULT');

-- ============================================
-- INSERT DEFAULT VERSION
-- ============================================
INSERT INTO `versions` (`id`, `project_id`, `name`, `description`, `is_active`, `created_by`)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'v1.0',
  'Initial version',
  TRUE,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM versions WHERE project_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'v1.0');

-- ============================================
-- MIGRATE EXISTING MODULES
-- ============================================
-- Create modules from existing test case modules
INSERT INTO `modules` (`id`, `project_id`, `name`, `description`, `is_active`, `created_by`)
SELECT DISTINCT
  UUID(),
  '550e8400-e29b-41d4-a716-446655440000',
  tc.module,
  CONCAT('Module: ', tc.module),
  TRUE,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
FROM test_cases tc
WHERE tc.module IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules m 
    WHERE m.project_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND m.name = tc.module
  );

-- ============================================
-- UPDATE EXISTING TEST CASES
-- ============================================
UPDATE `test_cases` tc
SET 
  `project_id` = '550e8400-e29b-41d4-a716-446655440000',
  `version_id` = '550e8400-e29b-41d4-a716-446655440001',
  `module_id` = (
    SELECT id FROM modules m 
    WHERE m.project_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND m.name = tc.module 
    LIMIT 1
  )
WHERE `project_id` IS NULL;

