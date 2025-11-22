# Database Schema - QA Testing Management Tool

## Overview

This document provides a comprehensive database schema for the QA Testing Management Tool using **PostgreSQL** with **Prisma ORM**.

## Prisma Schema

### Complete Schema Definition

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id            String   @id @default(uuid())
  username      String   @unique @db.VarChar(50)
  email         String   @unique @db.VarChar(255)
  passwordHash  String   @map("password_hash") @db.VarChar(255)
  firstName     String?  @map("first_name") @db.VarChar(100)
  lastName      String?  @map("last_name") @db.VarChar(100)
  role          UserRole @default(QA_ENGINEER)
  avatar        String?  @db.VarChar(255)
  isActive      Boolean  @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  failedLogins  Int      @default(0) @map("failed_login_attempts")
  lockedUntil   DateTime? @map("locked_until")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  testCases           TestCase[]      @relation("CreatedTestCases")
  testRuns            TestRun[]       @relation("ExecutedTestRuns")
  createdBugs         Bug[]           @relation("CreatedBugs")
  assignedBugs        Bug[]           @relation("AssignedBugs")
  bugComments         BugComment[]
  attachments         Attachment[]
  notifications       Notification[]
  refreshTokens       RefreshToken[]
  auditLogs           AuditLog[]
  teamMemberships     TeamMember[]

  @@map("users")
  @@index([email])
  @@index([username])
  @@index([role])
}

enum UserRole {
  ADMIN
  QA_MANAGER
  QA_ENGINEER
}

model RefreshToken {
  id           String   @id @default(uuid())
  token        String   @unique @db.VarChar(500)
  userId       String   @map("user_id")
  expiresAt    DateTime @map("expires_at")
  isRevoked    Boolean  @default(false) @map("is_revoked")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
  @@index([userId])
  @@index([token])
}

// ============================================
// TEST CASE MANAGEMENT
// ============================================

model TestCase {
  id              String         @id @default(uuid())
  title           String         @db.VarChar(255)
  description     String         @db.Text
  priority        Priority       @default(MEDIUM)
  status          TestCaseStatus @default(ACTIVE)
  module          String         @db.VarChar(100)
  expectedResult  String         @map("expected_result") @db.Text
  preconditions   String?        @db.Text
  postconditions  String?        @db.Text
  testData        Json?          @map("test_data")
  tags            String[]       @default([])
  estimatedTime   Int?           @map("estimated_time") // in seconds
  version         Int            @default(1)
  createdById     String         @map("created_by")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  // Relations
  createdBy       User           @relation("CreatedTestCases", fields: [createdById], references: [id])
  steps           TestStep[]
  testRuns        TestRun[]
  attachments     Attachment[]   @relation("TestCaseAttachments")

  @@map("test_cases")
  @@index([status])
  @@index([module])
  @@index([priority])
  @@index([createdById])
  @@index([createdAt])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TestCaseStatus {
  ACTIVE
  DEPRECATED
  DRAFT
  UNDER_REVIEW
}

model TestStep {
  id              String   @id @default(uuid())
  testCaseId      String   @map("test_case_id")
  stepNumber      Int      @map("step_number")
  action          String   @db.Text
  expectedResult  String   @map("expected_result") @db.Text
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  testCase        TestCase @relation(fields: [testCaseId], references: [id], onDelete: Cascade)

  @@map("test_steps")
  @@unique([testCaseId, stepNumber])
  @@index([testCaseId])
}

// ============================================
// TEST EXECUTION
// ============================================

model TestRun {
  id              String        @id @default(uuid())
  testCaseId      String        @map("test_case_id")
  executedById    String        @map("executed_by")
  result          TestResult    @default(PENDING)
  duration        Int?          // in seconds
  environment     String        @db.VarChar(50)
  buildVersion    String?       @map("build_version") @db.VarChar(100)
  notes           String?       @db.Text
  actualResult    String?       @map("actual_result") @db.Text
  executedAt      DateTime      @default(now()) @map("executed_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  // Relations
  testCase        TestCase      @relation(fields: [testCaseId], references: [id])
  executedBy      User          @relation("ExecutedTestRuns", fields: [executedById], references: [id])
  bugs            Bug[]
  attachments     Attachment[]  @relation("TestRunAttachments")
  stepResults     TestStepResult[]

  @@map("test_runs")
  @@index([testCaseId])
  @@index([executedById])
  @@index([result])
  @@index([executedAt])
  @@index([environment])
}

enum TestResult {
  PENDING
  PASSED
  FAILED
  BLOCKED
  SKIPPED
  NOT_APPLICABLE
}

model TestStepResult {
  id              String     @id @default(uuid())
  testRunId       String     @map("test_run_id")
  stepNumber      Int        @map("step_number")
  result          TestResult @default(PENDING)
  actualResult    String?    @map("actual_result") @db.Text
  notes           String?    @db.Text
  screenshot      String?    @db.VarChar(255)
  createdAt       DateTime   @default(now()) @map("created_at")

  // Relations
  testRun         TestRun    @relation(fields: [testRunId], references: [id], onDelete: Cascade)

  @@map("test_step_results")
  @@unique([testRunId, stepNumber])
  @@index([testRunId])
}

// ============================================
// BUG TRACKING
// ============================================

model Bug {
  id              String       @id @default(uuid())
  testRunId       String?      @map("test_run_id")
  title           String       @db.VarChar(255)
  description     String       @db.Text
  severity        Severity     @default(MEDIUM)
  priority        Priority     @default(MEDIUM)
  status          BugStatus    @default(OPEN)
  type            BugType      @default(FUNCTIONAL)
  stepsToReproduce String?     @map("steps_to_reproduce") @db.Text
  environment     String?      @db.VarChar(50)
  buildVersion    String?      @map("build_version") @db.VarChar(100)
  createdById     String       @map("created_by")
  assignedToId    String?      @map("assigned_to")
  resolvedAt      DateTime?    @map("resolved_at")
  closedAt        DateTime?    @map("closed_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  // Relations
  testRun         TestRun?     @relation(fields: [testRunId], references: [id])
  createdBy       User         @relation("CreatedBugs", fields: [createdById], references: [id])
  assignedTo      User?        @relation("AssignedBugs", fields: [assignedToId], references: [id])
  comments        BugComment[]
  attachments     Attachment[] @relation("BugAttachments")

  @@map("bugs")
  @@index([status])
  @@index([severity])
  @@index([priority])
  @@index([createdById])
  @@index([assignedToId])
  @@index([testRunId])
  @@index([createdAt])
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum BugStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  REOPENED
  DUPLICATE
  WONT_FIX
}

enum BugType {
  FUNCTIONAL
  PERFORMANCE
  UI_UX
  SECURITY
  COMPATIBILITY
  DATA
  OTHER
}

model BugComment {
  id         String   @id @default(uuid())
  bugId      String   @map("bug_id")
  userId     String   @map("user_id")
  comment    String   @db.Text
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relations
  bug        Bug      @relation(fields: [bugId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])

  @@map("bug_comments")
  @@index([bugId])
  @@index([userId])
  @@index([createdAt])
}

// ============================================
// ATTACHMENTS & FILES
// ============================================

model Attachment {
  id            String         @id @default(uuid())
  entityType    EntityType     @map("entity_type")
  entityId      String         @map("entity_id")
  fileName      String         @map("file_name") @db.VarChar(255)
  filePath      String         @map("file_path") @db.VarChar(500)
  fileSize      Int            @map("file_size") // in bytes
  mimeType      String         @map("mime_type") @db.VarChar(100)
  uploadedById  String         @map("uploaded_by")
  uploadedAt    DateTime       @default(now()) @map("uploaded_at")

  // Relations
  uploadedBy    User           @relation(fields: [uploadedById], references: [id])
  testCase      TestCase?      @relation("TestCaseAttachments", fields: [entityId], references: [id], onDelete: Cascade, map: "fk_attachment_test_case")
  testRun       TestRun?       @relation("TestRunAttachments", fields: [entityId], references: [id], onDelete: Cascade, map: "fk_attachment_test_run")
  bug           Bug?           @relation("BugAttachments", fields: [entityId], references: [id], onDelete: Cascade, map: "fk_attachment_bug")

  @@map("attachments")
  @@index([entityType, entityId])
  @@index([uploadedById])
}

enum EntityType {
  TEST_CASE
  TEST_RUN
  BUG
  USER
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id         String           @id @default(uuid())
  userId     String           @map("user_id")
  type       NotificationType
  title      String           @db.VarChar(255)
  message    String           @db.Text
  entityType EntityType?      @map("entity_type")
  entityId   String?          @map("entity_id")
  isRead     Boolean          @default(false) @map("is_read")
  readAt     DateTime?        @map("read_at")
  createdAt  DateTime         @default(now()) @map("created_at")

  // Relations
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

enum NotificationType {
  TEST_ASSIGNED
  TEST_COMPLETED
  BUG_CREATED
  BUG_ASSIGNED
  BUG_RESOLVED
  COMMENT_ADDED
  MENTION
  SYSTEM
}

// ============================================
// TEAM MANAGEMENT
// ============================================

model Team {
  id          String       @id @default(uuid())
  name        String       @db.VarChar(100)
  description String?      @db.Text
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relations
  members     TeamMember[]

  @@map("teams")
}

model TeamMember {
  id         String   @id @default(uuid())
  teamId     String   @map("team_id")
  userId     String   @map("user_id")
  role       String   @db.VarChar(50)
  joinedAt   DateTime @default(now()) @map("joined_at")

  // Relations
  team       Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("team_members")
  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

// ============================================
// AUDIT LOGS
// ============================================

model AuditLog {
  id         String      @id @default(uuid())
  userId     String?     @map("user_id")
  action     String      @db.VarChar(100)
  entityType EntityType? @map("entity_type")
  entityId   String?     @map("entity_id")
  oldValue   Json?       @map("old_value")
  newValue   Json?       @map("new_value")
  ipAddress  String?     @map("ip_address") @db.VarChar(45)
  userAgent  String?     @map("user_agent") @db.Text
  createdAt  DateTime    @default(now()) @map("created_at")

  // Relations
  user       User?       @relation(fields: [userId], references: [id])

  @@map("audit_logs")
  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}

// ============================================
// SYSTEM SETTINGS
// ============================================

model SystemSetting {
  id         String   @id @default(uuid())
  key        String   @unique @db.VarChar(100)
  value      Json
  category   String   @db.VarChar(50)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
  @@index([category])
}
```

## Database Indexes

### Critical Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Test Case indexes
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_module ON test_cases(module);
CREATE INDEX idx_test_cases_priority ON test_cases(priority);
CREATE INDEX idx_test_cases_created_by ON test_cases(created_by);
CREATE INDEX idx_test_cases_created_at ON test_cases(created_at);

-- Test Run indexes
CREATE INDEX idx_test_runs_test_case ON test_runs(test_case_id);
CREATE INDEX idx_test_runs_executed_by ON test_runs(executed_by);
CREATE INDEX idx_test_runs_result ON test_runs(result);
CREATE INDEX idx_test_runs_executed_at ON test_runs(executed_at);
CREATE INDEX idx_test_runs_environment ON test_runs(environment);

-- Bug indexes
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_priority ON bugs(priority);
CREATE INDEX idx_bugs_created_by ON bugs(created_by);
CREATE INDEX idx_bugs_assigned_to ON bugs(assigned_to);
CREATE INDEX idx_bugs_test_run ON bugs(test_run_id);
CREATE INDEX idx_bugs_created_at ON bugs(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit Log indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_test_runs_case_date ON test_runs(test_case_id, executed_at);
CREATE INDEX idx_bugs_status_severity ON bugs(status, severity);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

## Sample Data Migrations

### Seed Data for Development

```typescript
// prisma/seed.ts

import { PrismaClient, UserRole, Priority, TestCaseStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const testerPassword = await bcrypt.hash('tester123', 12);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@qatest.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      email: 'manager@qatest.com',
      passwordHash: await bcrypt.hash('manager123', 12),
      firstName: 'QA',
      lastName: 'Manager',
      role: UserRole.QA_MANAGER,
      isActive: true,
    },
  });

  const tester1 = await prisma.user.create({
    data: {
      username: 'tester',
      email: 'tester@qatest.com',
      passwordHash: testerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.QA_ENGINEER,
      isActive: true,
    },
  });

  const tester2 = await prisma.user.create({
    data: {
      username: 'jane',
      email: 'jane@qatest.com',
      passwordHash: await bcrypt.hash('jane123', 12),
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.QA_ENGINEER,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Create Test Cases
  const testCase1 = await prisma.testCase.create({
    data: {
      title: 'User Login - Valid Credentials',
      description: 'Verify that user can login with valid username and password',
      priority: Priority.CRITICAL,
      status: TestCaseStatus.ACTIVE,
      module: 'Authentication',
      expectedResult: 'User is successfully logged in and redirected to dashboard',
      createdById: admin.id,
      steps: {
        create: [
          {
            stepNumber: 1,
            action: 'Navigate to login page',
            expectedResult: 'Login page is displayed',
          },
          {
            stepNumber: 2,
            action: 'Enter valid username',
            expectedResult: 'Username field accepts input',
          },
          {
            stepNumber: 3,
            action: 'Enter valid password',
            expectedResult: 'Password field accepts input (masked)',
          },
          {
            stepNumber: 4,
            action: 'Click login button',
            expectedResult: 'User is authenticated and redirected',
          },
        ],
      },
    },
  });

  const testCase2 = await prisma.testCase.create({
    data: {
      title: 'User Login - Invalid Password',
      description: 'Verify error message when invalid password is entered',
      priority: Priority.HIGH,
      status: TestCaseStatus.ACTIVE,
      module: 'Authentication',
      expectedResult: 'Error message "Invalid credentials" is displayed',
      createdById: manager.id,
      steps: {
        create: [
          {
            stepNumber: 1,
            action: 'Navigate to login page',
            expectedResult: 'Login page is displayed',
          },
          {
            stepNumber: 2,
            action: 'Enter valid username',
            expectedResult: 'Username field accepts input',
          },
          {
            stepNumber: 3,
            action: 'Enter invalid password',
            expectedResult: 'Password field accepts input',
          },
          {
            stepNumber: 4,
            action: 'Click login button',
            expectedResult: 'Error message is shown',
          },
        ],
      },
    },
  });

  console.log('✅ Test cases created');

  // Create Test Runs
  const testRun1 = await prisma.testRun.create({
    data: {
      testCaseId: testCase1.id,
      executedById: tester1.id,
      result: 'PASSED',
      duration: 45,
      environment: 'Production',
      notes: 'Test executed successfully',
    },
  });

  const testRun2 = await prisma.testRun.create({
    data: {
      testCaseId: testCase2.id,
      executedById: tester2.id,
      result: 'PASSED',
      duration: 30,
      environment: 'Staging',
      notes: 'Error message displayed correctly',
    },
  });

  console.log('✅ Test runs created');

  // Create System Settings
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'APP_NAME',
        value: 'QA Testing Management',
        category: 'general',
      },
      {
        key: 'MAX_FILE_SIZE',
        value: 10485760, // 10MB
        category: 'uploads',
      },
      {
        key: 'ALLOWED_FILE_TYPES',
        value: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'],
        category: 'uploads',
      },
    ],
  });

  console.log('✅ System settings created');
  console.log('Seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Database Views for Reporting

### Create Views for Common Queries

```sql
-- Test Case Statistics View
CREATE VIEW v_test_case_stats AS
SELECT 
  tc.module,
  COUNT(*) as total_cases,
  COUNT(*) FILTER (WHERE tc.status = 'ACTIVE') as active_cases,
  COUNT(*) FILTER (WHERE tc.priority = 'CRITICAL') as critical_cases,
  COUNT(*) FILTER (WHERE tc.priority = 'HIGH') as high_priority_cases
FROM test_cases tc
GROUP BY tc.module;

-- Test Run Summary View
CREATE VIEW v_test_run_summary AS
SELECT 
  DATE(tr.executed_at) as execution_date,
  tr.environment,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE tr.result = 'PASSED') as passed,
  COUNT(*) FILTER (WHERE tr.result = 'FAILED') as failed,
  COUNT(*) FILTER (WHERE tr.result = 'BLOCKED') as blocked,
  AVG(tr.duration) as avg_duration,
  ROUND(COUNT(*) FILTER (WHERE tr.result = 'PASSED')::numeric / COUNT(*)::numeric * 100, 2) as pass_rate
FROM test_runs tr
GROUP BY DATE(tr.executed_at), tr.environment
ORDER BY execution_date DESC;

-- Bug Analytics View
CREATE VIEW v_bug_analytics AS
SELECT 
  DATE(b.created_at) as bug_date,
  b.status,
  b.severity,
  COUNT(*) as bug_count,
  COUNT(*) FILTER (WHERE b.resolved_at IS NOT NULL) as resolved_count,
  AVG(EXTRACT(EPOCH FROM (b.resolved_at - b.created_at))) as avg_resolution_time
FROM bugs b
GROUP BY DATE(b.created_at), b.status, b.severity
ORDER BY bug_date DESC;

-- User Activity View
CREATE VIEW v_user_activity AS
SELECT 
  u.id,
  u.username,
  u.role,
  COUNT(DISTINCT tr.id) as test_runs_count,
  COUNT(DISTINCT b.id) as bugs_created,
  MAX(tr.executed_at) as last_test_run,
  MAX(b.created_at) as last_bug_created
FROM users u
LEFT JOIN test_runs tr ON tr.executed_by = u.id
LEFT JOIN bugs b ON b.created_by = u.id
GROUP BY u.id, u.username, u.role;
```

## Backup and Maintenance

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/qa_testing"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="qa_testing_db"

# Create backup
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Maintenance Tasks

```sql
-- Vacuum and analyze (run weekly)
VACUUM ANALYZE test_cases;
VACUUM ANALYZE test_runs;
VACUUM ANALYZE bugs;

-- Reindex (run monthly)
REINDEX TABLE test_cases;
REINDEX TABLE test_runs;
REINDEX TABLE bugs;

-- Archive old data (run monthly)
-- Move test runs older than 1 year to archive table
INSERT INTO test_runs_archive 
SELECT * FROM test_runs 
WHERE executed_at < NOW() - INTERVAL '1 year';

DELETE FROM test_runs 
WHERE executed_at < NOW() - INTERVAL '1 year';
```

## Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

---

**Document Version**: 1.0  
**Last Updated**: {{ current_date }}

