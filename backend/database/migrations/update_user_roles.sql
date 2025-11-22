-- Update user roles to match the application
-- Change from QA_MANAGER, QA_ENGINEER to ADMIN, MANAGER, TESTER, VIEWER

ALTER TABLE users 
MODIFY COLUMN role ENUM('ADMIN', 'MANAGER', 'TESTER', 'VIEWER') NOT NULL DEFAULT 'TESTER';

-- Update existing roles to match new values
UPDATE users SET role = 'MANAGER' WHERE role = 'QA_MANAGER';
UPDATE users SET role = 'TESTER' WHERE role = 'QA_ENGINEER';

