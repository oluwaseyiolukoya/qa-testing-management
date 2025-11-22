-- QA Testing Management Database Export
-- Generated: 2025-11-22 01:35:21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Table: audit_logs
DROP TABLE IF EXISTS `audit_logs`;
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

-- Table: bug_comments
DROP TABLE IF EXISTS `bug_comments`;
CREATE TABLE `bug_comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bug_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bug_comments_bug` (`bug_id`),
  KEY `idx_bug_comments_user` (`user_id`),
  KEY `idx_bug_comments_created_at` (`created_at`),
  CONSTRAINT `bug_comments_ibfk_1` FOREIGN KEY (`bug_id`) REFERENCES `bugs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bug_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bugs
DROP TABLE IF EXISTS `bugs`;
CREATE TABLE `bugs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_run_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REOPENED','DUPLICATE','WONT_FIX') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `type` enum('FUNCTIONAL','PERFORMANCE','UI_UX','SECURITY','COMPATIBILITY','DATA','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'FUNCTIONAL',
  `steps_to_reproduce` text COLLATE utf8mb4_unicode_ci,
  `environment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `build_version` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bugs_status` (`status`),
  KEY `idx_bugs_severity` (`severity`),
  KEY `idx_bugs_priority` (`priority`),
  KEY `idx_bugs_created_by` (`created_by`),
  KEY `idx_bugs_assigned_to` (`assigned_to`),
  KEY `idx_bugs_test_run` (`test_run_id`),
  KEY `idx_bugs_created_at` (`created_at`),
  CONSTRAINT `bugs_ibfk_1` FOREIGN KEY (`test_run_id`) REFERENCES `test_runs` (`id`),
  CONSTRAINT `bugs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `bugs_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: modules
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_module` (`project_id`,`name`),
  KEY `created_by` (`created_by`),
  KEY `idx_modules_project` (`project_id`),
  KEY `idx_modules_is_active` (`is_active`),
  CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `modules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('TEST_ASSIGNED','TEST_COMPLETED','BUG_CREATED','BUG_ASSIGNED','BUG_RESOLVED','COMMENT_ADDED','MENTION','SYSTEM') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('TEST_CASE','TEST_RUN','BUG','USER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: projects
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_projects_code` (`code`),
  KEY `idx_projects_is_active` (`is_active`),
  KEY `idx_projects_created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: refresh_tokens
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  KEY `idx_refresh_tokens_token` (`token`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_cases
DROP TABLE IF EXISTS `test_cases`;
CREATE TABLE `test_cases` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `status` enum('TODO','IN_PROGRESS','RESOLVED') COLLATE utf8mb4_unicode_ci DEFAULT 'TODO',
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_result` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `preconditions` text COLLATE utf8mb4_unicode_ci,
  `postconditions` text COLLATE utf8mb4_unicode_ci,
  `test_data` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `estimated_time` int DEFAULT NULL,
  `version` int DEFAULT '1',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_test_cases_case_code` (`case_code`),
  KEY `idx_test_cases_status` (`status`),
  KEY `idx_test_cases_module` (`module`),
  KEY `idx_test_cases_priority` (`priority`),
  KEY `idx_test_cases_created_by` (`created_by`),
  KEY `idx_test_cases_created_at` (`created_at`),
  KEY `idx_test_cases_project` (`project_id`),
  KEY `idx_test_cases_version` (`version_id`),
  KEY `idx_test_cases_module_id` (`module_id`),
  CONSTRAINT `test_cases_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `test_cases_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_cases_ibfk_3` FOREIGN KEY (`version_id`) REFERENCES `versions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `test_cases_ibfk_4` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_runs
DROP TABLE IF EXISTS `test_runs`;
CREATE TABLE `test_runs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` enum('PENDING','PASSED','FAILED','BLOCKED','SKIPPED','NOT_APPLICABLE') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `duration` int DEFAULT NULL,
  `environment` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `build_version` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `actual_result` text COLLATE utf8mb4_unicode_ci,
  `executed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_test_runs_test_case` (`test_case_id`),
  KEY `idx_test_runs_executed_by` (`executed_by`),
  KEY `idx_test_runs_result` (`result`),
  KEY `idx_test_runs_executed_at` (`executed_at`),
  KEY `idx_test_runs_environment` (`environment`),
  CONSTRAINT `test_runs_ibfk_1` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`),
  CONSTRAINT `test_runs_ibfk_2` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_step_results
DROP TABLE IF EXISTS `test_step_results`;
CREATE TABLE `test_step_results` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_run_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_number` int NOT NULL,
  `result` enum('PENDING','PASSED','FAILED','BLOCKED','SKIPPED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `actual_result` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `screenshot` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_test_run_step` (`test_run_id`,`step_number`),
  KEY `idx_test_step_results_test_run` (`test_run_id`),
  CONSTRAINT `test_step_results_ibfk_1` FOREIGN KEY (`test_run_id`) REFERENCES `test_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_steps
DROP TABLE IF EXISTS `test_steps`;
CREATE TABLE `test_steps` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_case_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_number` int NOT NULL,
  `action` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_result` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_test_case_step` (`test_case_id`,`step_number`),
  KEY `idx_test_steps_test_case` (`test_case_id`),
  CONSTRAINT `test_steps_ibfk_1` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','MANAGER','TESTER','VIEWER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TESTER',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: versions
DROP TABLE IF EXISTS `versions`;
CREATE TABLE `versions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `release_date` datetime DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_version` (`project_id`,`name`),
  KEY `created_by` (`created_by`),
  KEY `idx_versions_project` (`project_id`),
  KEY `idx_versions_is_active` (`is_active`),
  CONSTRAINT `versions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `versions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

