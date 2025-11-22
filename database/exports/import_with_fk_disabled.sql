-- Disable foreign key checks to allow dropping tables in any order
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `bugs`;
DROP TABLE IF EXISTS `test_steps`;
DROP TABLE IF EXISTS `test_runs`;
DROP TABLE IF EXISTS `test_cases`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `versions`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;

-- Table: users
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','MANAGER','TESTER','VIEWER') COLLATE utf8mb4_unicode_ci DEFAULT 'TESTER',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: projects
CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_projects_is_active` (`is_active`),
  KEY `idx_projects_created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: versions
CREATE TABLE `versions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_versions_project` (`project_id`),
  KEY `idx_versions_is_active` (`is_active`),
  KEY `idx_versions_created_by` (`created_by`),
  CONSTRAINT `versions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `versions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: modules
CREATE TABLE `modules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_modules_project` (`project_id`),
  KEY `idx_modules_is_active` (`is_active`),
  KEY `idx_modules_created_by` (`created_by`),
  CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `modules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_cases
CREATE TABLE `test_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `preconditions` text COLLATE utf8mb4_unicode_ci,
  `expected_result` text COLLATE utf8mb4_unicode_ci,
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `status` enum('TODO','IN_PROGRESS','RESOLVED') COLLATE utf8mb4_unicode_ci DEFAULT 'TODO',
  `type` enum('FUNCTIONAL','REGRESSION','SMOKE','INTEGRATION','PERFORMANCE','SECURITY') COLLATE utf8mb4_unicode_ci DEFAULT 'FUNCTIONAL',
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_code` (`case_code`),
  KEY `idx_test_cases_project` (`project_id`),
  KEY `idx_test_cases_version` (`version_id`),
  KEY `idx_test_cases_module` (`module_id`),
  KEY `idx_test_cases_status` (`status`),
  KEY `idx_test_cases_priority` (`priority`),
  KEY `idx_test_cases_assigned_to` (`assigned_to`),
  KEY `idx_test_cases_created_by` (`created_by`),
  CONSTRAINT `test_cases_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `test_cases_ibfk_2` FOREIGN KEY (`version_id`) REFERENCES `versions` (`id`),
  CONSTRAINT `test_cases_ibfk_3` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  CONSTRAINT `test_cases_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `test_cases_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_steps
CREATE TABLE `test_steps` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_number` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_result` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_test_steps_test_case` (`test_case_id`),
  KEY `idx_test_steps_step_number` (`step_number`),
  CONSTRAINT `test_steps_ibfk_1` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_runs
CREATE TABLE `test_runs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result` enum('PENDING','PASSED','FAILED','BLOCKED','SKIPPED','NOT_APPLICABLE') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `execution_time` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `executed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_test_runs_test_case` (`test_case_id`),
  KEY `idx_test_runs_executed_by` (`executed_by`),
  KEY `idx_test_runs_result` (`result`),
  KEY `idx_test_runs_executed_at` (`executed_at`),
  CONSTRAINT `test_runs_ibfk_1` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`),
  CONSTRAINT `test_runs_ibfk_2` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bugs
CREATE TABLE `bugs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_run_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `test_case_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REOPENED') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `reported_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bugs_test_run` (`test_run_id`),
  KEY `idx_bugs_test_case` (`test_case_id`),
  KEY `idx_bugs_status` (`status`),
  KEY `idx_bugs_severity` (`severity`),
  KEY `idx_bugs_reported_by` (`reported_by`),
  KEY `idx_bugs_assigned_to` (`assigned_to`),
  CONSTRAINT `bugs_ibfk_1` FOREIGN KEY (`test_run_id`) REFERENCES `test_runs` (`id`),
  CONSTRAINT `bugs_ibfk_2` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`),
  CONSTRAINT `bugs_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`),
  CONSTRAINT `bugs_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: audit_logs
CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('TEST_CASE','TEST_RUN','BUG','USER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user` (`user_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert demo users with hashed passwords (password: admin123)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'manager', 'manager@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'QA', 'Manager', 'MANAGER', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'tester', 'tester@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Engineer', 'TESTER', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'john', 'john@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'TESTER', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

