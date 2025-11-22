# API Documentation - QA Testing Management Tool

## Base URL

```
Development:  http://localhost:3000/api/v1
Production:   https://api.qatest.com/api/v1
```

## Authentication

All API endpoints (except login/register) require authentication via JWT token.

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req-123abc"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req-123abc"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req-123abc",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

## 1. Authentication Endpoints

### 1.1 Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "QA_ENGINEER"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "QA_ENGINEER",
      "isActive": true,
      "createdAt": "2024-01-20T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "message": "User registered successfully"
}
```

### 1.2 Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "SecureP@ss123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "QA_ENGINEER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### 1.3 Refresh Token

```http
POST /auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### 1.4 Logout

```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.5 Get Current User

```http
GET /auth/me
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "QA_ENGINEER",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "lastLoginAt": "2024-01-20T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

---

## 2. Users Endpoints

### 2.1 List All Users

```http
GET /users?page=1&limit=20&role=QA_ENGINEER&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role
- `search` (optional): Search by username/email
- `isActive` (optional): Filter by active status

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "QA_ENGINEER",
      "isActive": true,
      "lastLoginAt": "2024-01-20T10:30:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 2.2 Get User by ID

```http
GET /users/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "QA_ENGINEER",
    "isActive": true,
    "stats": {
      "testRunsCount": 45,
      "bugsCreated": 12,
      "lastTestRun": "2024-01-20T15:30:00Z"
    }
  }
}
```

### 2.3 Create User (Admin Only)

```http
POST /users
```

**Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecureP@ss123",
  "firstName": "New",
  "lastName": "User",
  "role": "QA_ENGINEER"
}
```

**Response:** `201 Created`

### 2.4 Update User

```http
PUT /users/:id
```

**Request Body:**

```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "john.updated@example.com"
}
```

**Response:** `200 OK`

### 2.5 Delete User (Soft Delete)

```http
DELETE /users/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## 3. Test Cases Endpoints

### 3.1 List Test Cases

```http
GET /test-cases?page=1&limit=20&status=ACTIVE&priority=HIGH&module=Authentication
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: ACTIVE, DEPRECATED, DRAFT, UNDER_REVIEW
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `module`: Filter by module name
- `search`: Search in title/description
- `createdBy`: Filter by creator ID

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "tc-123abc",
      "title": "User Login - Valid Credentials",
      "description": "Verify that user can login with valid username and password",
      "priority": "CRITICAL",
      "status": "ACTIVE",
      "module": "Authentication",
      "expectedResult": "User is successfully logged in and redirected to dashboard",
      "tags": ["login", "authentication", "critical"],
      "estimatedTime": 45,
      "version": 1,
      "createdBy": {
        "id": "user-123",
        "username": "admin",
        "firstName": "Admin",
        "lastName": "User"
      },
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T09:00:00Z",
      "stats": {
        "totalRuns": 15,
        "passRate": 93.33,
        "lastRun": "2024-01-20T10:30:00Z"
      }
    }
  ]
}
```

### 3.2 Get Test Case Details

```http
GET /test-cases/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "tc-123abc",
    "title": "User Login - Valid Credentials",
    "description": "Verify that user can login with valid username and password",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "module": "Authentication",
    "expectedResult": "User is successfully logged in",
    "preconditions": "User account exists and is active",
    "postconditions": "User session is created",
    "testData": {
      "username": "testuser",
      "password": "Test@123"
    },
    "tags": ["login", "authentication"],
    "estimatedTime": 45,
    "version": 1,
    "steps": [
      {
        "id": "step-1",
        "stepNumber": 1,
        "action": "Navigate to login page",
        "expectedResult": "Login page is displayed"
      },
      {
        "id": "step-2",
        "stepNumber": 2,
        "action": "Enter valid username",
        "expectedResult": "Username field accepts input"
      },
      {
        "id": "step-3",
        "stepNumber": 3,
        "action": "Enter valid password",
        "expectedResult": "Password field accepts input (masked)"
      },
      {
        "id": "step-4",
        "stepNumber": 4,
        "action": "Click login button",
        "expectedResult": "User is authenticated and redirected"
      }
    ],
    "attachments": [
      {
        "id": "att-1",
        "fileName": "test-data.csv",
        "fileSize": 1024,
        "uploadedAt": "2024-01-15T09:00:00Z"
      }
    ],
    "createdBy": {
      "id": "user-123",
      "username": "admin"
    },
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  }
}
```

### 3.3 Create Test Case

```http
POST /test-cases
```

**Request Body:**

```json
{
  "title": "New Test Case",
  "description": "Description of the test case",
  "priority": "HIGH",
  "status": "ACTIVE",
  "module": "Authentication",
  "expectedResult": "Expected outcome",
  "preconditions": "Prerequisites for test",
  "postconditions": "State after test",
  "testData": {
    "key": "value"
  },
  "tags": ["tag1", "tag2"],
  "estimatedTime": 60,
  "steps": [
    {
      "stepNumber": 1,
      "action": "Step action",
      "expectedResult": "Step expected result"
    }
  ]
}
```

**Response:** `201 Created`

### 3.4 Update Test Case

```http
PUT /test-cases/:id
```

**Request Body:** Same as create (partial updates supported)

**Response:** `200 OK`

### 3.5 Delete Test Case

```http
DELETE /test-cases/:id
```

**Response:** `200 OK`

### 3.6 Bulk Import Test Cases

```http
POST /test-cases/bulk
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: CSV file with test cases

**CSV Format:**
```csv
title,description,priority,module,expectedResult
"Test 1","Description 1","HIGH","Auth","Result 1"
"Test 2","Description 2","MEDIUM","Dashboard","Result 2"
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "imported": 50,
    "failed": 2,
    "errors": [
      {
        "row": 5,
        "error": "Invalid priority value"
      }
    ]
  }
}
```

### 3.7 Export Test Cases

```http
GET /test-cases/export?format=csv&status=ACTIVE
```

**Query Parameters:**
- `format`: csv, xlsx, pdf
- Other filters same as list endpoint

**Response:** File download

### 3.8 Get Test Case Statistics

```http
GET /test-cases/stats
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "ACTIVE": 120,
      "DEPRECATED": 20,
      "DRAFT": 10
    },
    "byPriority": {
      "CRITICAL": 30,
      "HIGH": 50,
      "MEDIUM": 50,
      "LOW": 20
    },
    "byModule": {
      "Authentication": 40,
      "Dashboard": 35,
      "User Management": 25,
      "Reports": 50
    }
  }
}
```

---

## 4. Test Runs Endpoints

### 4.1 List Test Runs

```http
GET /test-runs?page=1&limit=20&result=PASSED&environment=Production
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `result`: PASSED, FAILED, BLOCKED, SKIPPED
- `testCaseId`: Filter by test case
- `executedBy`: Filter by executor
- `environment`: Filter by environment
- `startDate`, `endDate`: Date range filter

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "run-123",
      "testCase": {
        "id": "tc-123",
        "title": "User Login - Valid Credentials"
      },
      "executedBy": {
        "id": "user-123",
        "username": "johndoe"
      },
      "result": "PASSED",
      "duration": 45,
      "environment": "Production",
      "buildVersion": "v1.2.3",
      "notes": "Test executed successfully",
      "executedAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### 4.2 Get Test Run Details

```http
GET /test-runs/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "run-123",
    "testCase": {
      "id": "tc-123",
      "title": "User Login - Valid Credentials",
      "module": "Authentication"
    },
    "executedBy": {
      "id": "user-123",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "result": "PASSED",
    "duration": 45,
    "environment": "Production",
    "buildVersion": "v1.2.3",
    "notes": "All steps passed successfully",
    "actualResult": "User logged in and redirected as expected",
    "stepResults": [
      {
        "stepNumber": 1,
        "result": "PASSED",
        "actualResult": "Login page displayed correctly",
        "screenshot": "https://example.com/screenshots/step1.png"
      },
      {
        "stepNumber": 2,
        "result": "PASSED",
        "actualResult": "Username entered successfully"
      }
    ],
    "attachments": [
      {
        "id": "att-1",
        "fileName": "execution-log.txt",
        "fileSize": 2048
      }
    ],
    "bugs": [
      {
        "id": "bug-456",
        "title": "Minor UI issue",
        "severity": "LOW"
      }
    ],
    "executedAt": "2024-01-20T10:30:00Z",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### 4.3 Create Test Run (Execute Test)

```http
POST /test-runs
```

**Request Body:**

```json
{
  "testCaseId": "tc-123",
  "result": "PASSED",
  "duration": 45,
  "environment": "Production",
  "buildVersion": "v1.2.3",
  "notes": "Test executed successfully",
  "actualResult": "User logged in as expected",
  "stepResults": [
    {
      "stepNumber": 1,
      "result": "PASSED",
      "actualResult": "Login page displayed",
      "notes": "All elements visible"
    }
  ]
}
```

**Response:** `201 Created`

### 4.4 Update Test Run

```http
PUT /test-runs/:id
```

**Request Body:** Partial update of test run

**Response:** `200 OK`

### 4.5 Delete Test Run

```http
DELETE /test-runs/:id
```

**Response:** `200 OK`

### 4.6 Get Test Run History

```http
GET /test-runs/history?testCaseId=tc-123&limit=10
```

**Response:** `200 OK` - Returns last N executions of a test case

### 4.7 Bulk Test Execution

```http
POST /test-runs/bulk
```

**Request Body:**

```json
{
  "testCaseIds": ["tc-123", "tc-456", "tc-789"],
  "environment": "Staging",
  "buildVersion": "v1.2.3",
  "executedBy": "user-123"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "created": 3,
    "testRunIds": ["run-1", "run-2", "run-3"]
  }
}
```

---

## 5. Bugs Endpoints

### 5.1 List Bugs

```http
GET /bugs?page=1&limit=20&status=OPEN&severity=HIGH
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REOPENED
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `assignedTo`: Filter by assignee
- `createdBy`: Filter by creator

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "bug-123",
      "title": "Login button not responsive on mobile",
      "description": "The login button doesn't respond to clicks on iOS devices",
      "severity": "HIGH",
      "priority": "HIGH",
      "status": "OPEN",
      "type": "UI_UX",
      "testRun": {
        "id": "run-123",
        "testCase": {
          "title": "User Login - Mobile"
        }
      },
      "createdBy": {
        "id": "user-123",
        "username": "johndoe"
      },
      "assignedTo": {
        "id": "user-456",
        "username": "janedoe"
      },
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T14:00:00Z"
    }
  ]
}
```

### 5.2 Get Bug Details

```http
GET /bugs/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "bug-123",
    "title": "Login button not responsive on mobile",
    "description": "The login button doesn't respond to clicks on iOS devices",
    "severity": "HIGH",
    "priority": "HIGH",
    "status": "OPEN",
    "type": "UI_UX",
    "stepsToReproduce": "1. Open app on iOS\n2. Navigate to login\n3. Tap login button\n4. Nothing happens",
    "environment": "Production",
    "buildVersion": "v1.2.3",
    "testRun": {
      "id": "run-123",
      "testCase": {
        "id": "tc-123",
        "title": "User Login - Mobile"
      }
    },
    "createdBy": {
      "id": "user-123",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "assignedTo": {
      "id": "user-456",
      "username": "janedoe"
    },
    "comments": [
      {
        "id": "comment-1",
        "user": {
          "username": "janedoe"
        },
        "comment": "Investigating this issue",
        "createdAt": "2024-01-20T11:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": "att-1",
        "fileName": "screenshot.png",
        "fileSize": 102400
      }
    ],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T14:00:00Z",
    "resolvedAt": null,
    "closedAt": null
  }
}
```

### 5.3 Create Bug

```http
POST /bugs
```

**Request Body:**

```json
{
  "testRunId": "run-123",
  "title": "Login button not responsive",
  "description": "Detailed description",
  "severity": "HIGH",
  "priority": "HIGH",
  "type": "UI_UX",
  "stepsToReproduce": "Steps here...",
  "environment": "Production",
  "buildVersion": "v1.2.3",
  "assignedToId": "user-456"
}
```

**Response:** `201 Created`

### 5.4 Update Bug

```http
PUT /bugs/:id
```

**Request Body:** Partial update

**Response:** `200 OK`

### 5.5 Delete Bug

```http
DELETE /bugs/:id
```

**Response:** `200 OK`

### 5.6 Add Comment to Bug

```http
POST /bugs/:id/comments
```

**Request Body:**

```json
{
  "comment": "This issue has been fixed in the latest build"
}
```

**Response:** `201 Created`

### 5.7 Get Bug Comments

```http
GET /bugs/:id/comments
```

**Response:** `200 OK`

### 5.8 Update Bug Status

```http
PUT /bugs/:id/status
```

**Request Body:**

```json
{
  "status": "RESOLVED",
  "comment": "Fixed in build v1.2.4"
}
```

**Response:** `200 OK`

### 5.9 Assign Bug

```http
PUT /bugs/:id/assign
```

**Request Body:**

```json
{
  "assignedToId": "user-789"
}
```

**Response:** `200 OK`

---

## 6. Reports Endpoints

### 6.1 Dashboard Metrics

```http
GET /reports/dashboard?startDate=2024-01-01&endDate=2024-01-31
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTestCases": 150,
      "activeTestCases": 120,
      "totalTestRuns": 450,
      "passRate": 87.5,
      "openBugs": 15,
      "criticalBugs": 3
    },
    "testResults": {
      "passed": 394,
      "failed": 35,
      "blocked": 15,
      "skipped": 6
    },
    "bugsBySeverity": {
      "LOW": 5,
      "MEDIUM": 7,
      "HIGH": 2,
      "CRITICAL": 1
    },
    "recentActivity": [
      {
        "type": "TEST_RUN",
        "message": "Test 'User Login' passed",
        "timestamp": "2024-01-20T15:30:00Z"
      }
    ],
    "trends": {
      "passRateTrend": [
        { "date": "2024-01-15", "rate": 85 },
        { "date": "2024-01-16", "rate": 87 },
        { "date": "2024-01-17", "rate": 88 }
      ]
    }
  }
}
```

### 6.2 Test Coverage Report

```http
GET /reports/test-coverage?module=Authentication
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalModules": 5,
      "coverage": 82.5
    },
    "byModule": [
      {
        "module": "Authentication",
        "testCases": 40,
        "coverage": 95,
        "lastExecuted": "2024-01-20T10:00:00Z"
      },
      {
        "module": "Dashboard",
        "testCases": 35,
        "coverage": 75,
        "lastExecuted": "2024-01-19T14:30:00Z"
      }
    ],
    "byPriority": {
      "CRITICAL": {
        "total": 30,
        "covered": 29,
        "percentage": 96.67
      },
      "HIGH": {
        "total": 50,
        "covered": 42,
        "percentage": 84
      }
    }
  }
}
```

### 6.3 Bug Analytics

```http
GET /reports/bug-analytics?startDate=2024-01-01&endDate=2024-01-31
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBugs": 45,
      "openBugs": 15,
      "resolvedBugs": 25,
      "closedBugs": 5,
      "avgResolutionTime": 172800 // in seconds (2 days)
    },
    "bySeverity": {
      "CRITICAL": 3,
      "HIGH": 12,
      "MEDIUM": 20,
      "LOW": 10
    },
    "byType": {
      "FUNCTIONAL": 20,
      "UI_UX": 10,
      "PERFORMANCE": 5,
      "SECURITY": 3,
      "OTHER": 7
    },
    "trend": [
      {
        "date": "2024-01-15",
        "opened": 5,
        "resolved": 3,
        "closed": 1
      }
    ],
    "topBugCreators": [
      {
        "user": "johndoe",
        "count": 15
      }
    ]
  }
}
```

### 6.4 Team Performance Report

```http
GET /reports/team-performance?startDate=2024-01-01&endDate=2024-01-31
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "teamMembers": [
      {
        "user": {
          "id": "user-123",
          "username": "johndoe",
          "role": "QA_ENGINEER"
        },
        "metrics": {
          "testRunsExecuted": 75,
          "bugsCreated": 12,
          "avgExecutionTime": 60,
          "passRate": 92.5
        }
      }
    ],
    "summary": {
      "totalExecutions": 450,
      "avgExecutionsPerUser": 90,
      "avgPassRate": 87.5
    }
  }
}
```

### 6.5 Generate Custom Report

```http
POST /reports/custom
```

**Request Body:**

```json
{
  "reportType": "test_summary",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "module": "Authentication",
    "environment": "Production"
  },
  "groupBy": ["date", "result"],
  "metrics": ["count", "passRate", "avgDuration"]
}
```

**Response:** `200 OK`

### 6.6 Export Report

```http
GET /reports/export?type=dashboard&format=pdf&startDate=2024-01-01
```

**Query Parameters:**
- `type`: dashboard, test-coverage, bug-analytics, team-performance
- `format`: pdf, csv, xlsx
- Other filters based on report type

**Response:** File download

---

## 7. Notifications Endpoints

### 7.1 List Notifications

```http
GET /notifications?page=1&limit=20&isRead=false
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-123",
      "type": "BUG_ASSIGNED",
      "title": "New bug assigned to you",
      "message": "Bug #456 'Login issue' has been assigned to you",
      "entityType": "BUG",
      "entityId": "bug-456",
      "isRead": false,
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### 7.2 Mark Notification as Read

```http
PUT /notifications/:id/read
```

**Response:** `200 OK`

### 7.3 Mark All as Read

```http
PUT /notifications/read-all
```

**Response:** `200 OK`

### 7.4 Delete Notification

```http
DELETE /notifications/:id
```

**Response:** `200 OK`

---

## 8. File Upload Endpoints

### 8.1 Upload File

```http
POST /uploads
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload
- `entityType`: TEST_CASE, TEST_RUN, BUG, USER
- `entityId`: ID of the entity

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "att-123",
    "fileName": "screenshot.png",
    "filePath": "uploads/2024/01/20/screenshot-abc123.png",
    "fileSize": 102400,
    "mimeType": "image/png",
    "url": "https://example.com/files/att-123"
  }
}
```

### 8.2 Download File

```http
GET /uploads/:id
```

**Response:** File stream

### 8.3 Delete File

```http
DELETE /uploads/:id
```

**Response:** `200 OK`

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Webhooks (Optional Future Feature)

### Configure Webhook

```http
POST /webhooks
```

**Request Body:**

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["TEST_RUN_COMPLETED", "BUG_CREATED"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example

```json
{
  "event": "TEST_RUN_COMPLETED",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "testRunId": "run-123",
    "result": "PASSED",
    "testCase": {
      "id": "tc-123",
      "title": "User Login"
    }
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: {{ current_date }}

