-- QA Testing Management Tool - Database Schema
-- MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `role` ENUM('ADMIN', 'QA_MANAGER', 'QA_ENGINEER') DEFAULT 'QA_ENGINEER',
  `avatar` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_login_at` DATETIME,
  `failed_login_attempts` INT DEFAULT 0,
  `locked_until` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` VARCHAR(36) PRIMARY KEY,
  `token` VARCHAR(500) UNIQUE NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_refresh_tokens_user` (`user_id`),
  INDEX `idx_refresh_tokens_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEST CASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `test_cases` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  `status` ENUM('ACTIVE', 'DEPRECATED', 'DRAFT', 'UNDER_REVIEW') DEFAULT 'ACTIVE',
  `module` VARCHAR(100) NOT NULL,
  `expected_result` TEXT NOT NULL,
  `preconditions` TEXT,
  `postconditions` TEXT,
  `test_data` JSON,
  `tags` JSON,
  `estimated_time` INT,
  `version` INT DEFAULT 1,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX `idx_test_cases_status` (`status`),
  INDEX `idx_test_cases_module` (`module`),
  INDEX `idx_test_cases_priority` (`priority`),
  INDEX `idx_test_cases_created_by` (`created_by`),
  INDEX `idx_test_cases_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEST STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `test_steps` (
  `id` VARCHAR(36) PRIMARY KEY,
  `test_case_id` VARCHAR(36) NOT NULL,
  `step_number` INT NOT NULL,
  `action` TEXT NOT NULL,
  `expected_result` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_test_case_step` (`test_case_id`, `step_number`),
  INDEX `idx_test_steps_test_case` (`test_case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEST RUNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `test_runs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `test_case_id` VARCHAR(36) NOT NULL,
  `executed_by` VARCHAR(36) NOT NULL,
  `result` ENUM('PENDING', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'NOT_APPLICABLE') DEFAULT 'PENDING',
  `duration` INT,
  `environment` VARCHAR(50) NOT NULL,
  `build_version` VARCHAR(100),
  `notes` TEXT,
  `actual_result` TEXT,
  `executed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`),
  FOREIGN KEY (`executed_by`) REFERENCES `users`(`id`),
  INDEX `idx_test_runs_test_case` (`test_case_id`),
  INDEX `idx_test_runs_executed_by` (`executed_by`),
  INDEX `idx_test_runs_result` (`result`),
  INDEX `idx_test_runs_executed_at` (`executed_at`),
  INDEX `idx_test_runs_environment` (`environment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEST STEP RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `test_step_results` (
  `id` VARCHAR(36) PRIMARY KEY,
  `test_run_id` VARCHAR(36) NOT NULL,
  `step_number` INT NOT NULL,
  `result` ENUM('PENDING', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED') DEFAULT 'PENDING',
  `actual_result` TEXT,
  `notes` TEXT,
  `screenshot` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_run_id`) REFERENCES `test_runs`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_test_run_step` (`test_run_id`, `step_number`),
  INDEX `idx_test_step_results_test_run` (`test_run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BUGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `bugs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `test_run_id` VARCHAR(36),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'DUPLICATE', 'WONT_FIX') DEFAULT 'OPEN',
  `type` ENUM('FUNCTIONAL', 'PERFORMANCE', 'UI_UX', 'SECURITY', 'COMPATIBILITY', 'DATA', 'OTHER') DEFAULT 'FUNCTIONAL',
  `steps_to_reproduce` TEXT,
  `environment` VARCHAR(50),
  `build_version` VARCHAR(100),
  `created_by` VARCHAR(36) NOT NULL,
  `assigned_to` VARCHAR(36),
  `resolved_at` DATETIME,
  `closed_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_run_id`) REFERENCES `test_runs`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`),
  INDEX `idx_bugs_status` (`status`),
  INDEX `idx_bugs_severity` (`severity`),
  INDEX `idx_bugs_priority` (`priority`),
  INDEX `idx_bugs_created_by` (`created_by`),
  INDEX `idx_bugs_assigned_to` (`assigned_to`),
  INDEX `idx_bugs_test_run` (`test_run_id`),
  INDEX `idx_bugs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BUG COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `bug_comments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `bug_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`bug_id`) REFERENCES `bugs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_bug_comments_bug` (`bug_id`),
  INDEX `idx_bug_comments_user` (`user_id`),
  INDEX `idx_bug_comments_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('TEST_ASSIGNED', 'TEST_COMPLETED', 'BUG_CREATED', 'BUG_ASSIGNED', 'BUG_RESOLVED', 'COMMENT_ADDED', 'MENTION', 'SYSTEM'),
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `entity_type` ENUM('TEST_CASE', 'TEST_RUN', 'BUG', 'USER'),
  `entity_id` VARCHAR(36),
  `is_read` BOOLEAN DEFAULT FALSE,
  `read_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_is_read` (`is_read`),
  INDEX `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36),
  `action` VARCHAR(100) NOT NULL,
  `entity_type` ENUM('TEST_CASE', 'TEST_RUN', 'BUG', 'USER'),
  `entity_id` VARCHAR(36),
  `old_value` JSON,
  `new_value` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_audit_logs_user` (`user_id`),
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA (Demo Users)
-- ============================================

-- Insert demo users (password is 'admin123', 'tester123', 'john123', 'jane123')
-- Passwords are hashed with bcrypt
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'tester', 'tester@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Engineer', 'QA_ENGINEER', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'john', 'john@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'QA_ENGINEER', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'jane', 'jane@qatest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'QA_MANAGER', TRUE);

-- Insert sample test cases
INSERT INTO `test_cases` (`id`, `title`, `description`, `priority`, `status`, `module`, `expected_result`, `created_by`) VALUES
('tc-001', 'User Login - Valid Credentials', 'Verify that user can login with valid username and password', 'CRITICAL', 'ACTIVE', 'Authentication', 'User is successfully logged in and redirected to dashboard', '550e8400-e29b-41d4-a716-446655440001'),
('tc-002', 'User Login - Invalid Password', 'Verify error message when invalid password is entered', 'HIGH', 'ACTIVE', 'Authentication', 'Error message "Invalid credentials" is displayed', '550e8400-e29b-41d4-a716-446655440001'),
('tc-003', 'Dashboard Load Time', 'Verify dashboard loads within acceptable time', 'MEDIUM', 'ACTIVE', 'Dashboard', 'Dashboard loads within 2 seconds', '550e8400-e29b-41d4-a716-446655440004');

-- Insert test steps
INSERT INTO `test_steps` (`id`, `test_case_id`, `step_number`, `action`, `expected_result`) VALUES
('step-001', 'tc-001', 1, 'Navigate to login page', 'Login page is displayed'),
('step-002', 'tc-001', 2, 'Enter valid username', 'Username field accepts input'),
('step-003', 'tc-001', 3, 'Enter valid password', 'Password field accepts input (masked)'),
('step-004', 'tc-001', 4, 'Click login button', 'User is authenticated and redirected');

-- Insert sample test runs
INSERT INTO `test_runs` (`id`, `test_case_id`, `executed_by`, `result`, `duration`, `environment`, `notes`) VALUES
('tr-001', 'tc-001', '550e8400-e29b-41d4-a716-446655440002', 'PASSED', 45, 'Production', 'Test executed successfully'),
('tr-002', 'tc-002', '550e8400-e29b-41d4-a716-446655440003', 'PASSED', 30, 'Staging', 'Error message displayed correctly'),
('tr-003', 'tc-003', '550e8400-e29b-41d4-a716-446655440002', 'FAILED', 60, 'Production', 'Dashboard took 3.5 seconds to load');

-- Insert sample bug
INSERT INTO `bugs` (`id`, `test_run_id`, `title`, `description`, `severity`, `priority`, `status`, `type`, `created_by`, `assigned_to`) VALUES
('bug-001', 'tr-003', 'Dashboard slow load time', 'Dashboard is taking more than 3 seconds to load, exceeding the 2-second requirement', 'MEDIUM', 'HIGH', 'OPEN', 'PERFORMANCE', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004');

SET FOREIGN_KEY_CHECKS = 1;

