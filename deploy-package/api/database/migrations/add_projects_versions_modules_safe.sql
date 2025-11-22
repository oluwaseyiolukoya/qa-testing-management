-- Safe Migration: Add Projects, Versions, and Modules
-- This script checks for existing tables/columns before creating them

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

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INSERT DEFAULT PROJECT (for existing data)
-- ============================================
INSERT IGNORE INTO `projects` (`id`, `name`, `description`, `code`, `is_active`, `created_by`)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  'Default Project',
  'Default project for existing test cases',
  'DEFAULT',
  TRUE,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- ============================================
-- INSERT DEFAULT VERSION
-- ============================================
INSERT IGNORE INTO `versions` (`id`, `project_id`, `name`, `description`, `is_active`, `created_by`)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'v1.0',
  'Initial version',
  TRUE,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- ============================================
-- MIGRATE EXISTING MODULES
-- ============================================
-- Create modules from existing test case modules
INSERT IGNORE INTO `modules` (`id`, `project_id`, `name`, `description`, `is_active`, `created_by`)
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
  `project_id` = COALESCE(`project_id`, '550e8400-e29b-41d4-a716-446655440000'),
  `version_id` = COALESCE(`version_id`, '550e8400-e29b-41d4-a716-446655440001'),
  `module_id` = COALESCE(`module_id`, (
    SELECT id FROM modules m 
    WHERE m.project_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND m.name = tc.module 
    LIMIT 1
  ))
WHERE `project_id` IS NULL OR `version_id` IS NULL OR `module_id` IS NULL;

