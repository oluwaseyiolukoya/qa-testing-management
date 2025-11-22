-- QA Testing Management Database Import
-- Run this BEFORE importing the main SQL file

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Drop all tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `bug_comments`;
DROP TABLE IF EXISTS `bugs`;
DROP TABLE IF EXISTS `test_step_results`;
DROP TABLE IF EXISTS `test_runs`;
DROP TABLE IF EXISTS `test_steps`;
DROP TABLE IF EXISTS `test_cases`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `versions`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

