# Project-Centric Architecture

## 🎯 Design Philosophy

**Projects are the foundation** - All test cases, test runs, and reports are organized under projects. This ensures:

1. **Clear Organization** - Every test belongs to a specific project
2. **Better Reporting** - All metrics and reports are project-scoped
3. **Team Collaboration** - Teams can work on different projects independently
4. **Data Isolation** - Projects provide natural boundaries for data

---

## 📐 Architecture Flow

```
Dashboard (Projects List)
    ↓
    └─→ Create Project
    └─→ Click Project
        ↓
    Project Detail Page
        ├─→ Overview Tab (Metrics & Charts)
        ├─→ Test Cases Tab (Project Test Cases)
        ├─→ Test Runs Tab (Project Test Runs)
        └─→ Reports Tab (Project Reports)
```

---

## 🏗️ Component Structure

### 1. **Dashboard Page** (`/dashboard`)
- **Purpose**: Entry point showing all projects
- **Features**:
  - List of all active projects
  - "Create Project" button
  - Project cards with key metrics
  - Click project to navigate to detail page

### 2. **Project Detail Page** (`/projects/:projectId`)
- **Purpose**: Central hub for all project-related activities
- **Tabs**:
  - **Overview**: Project metrics, charts, summary
  - **Test Cases**: All test cases for this project
  - **Test Runs**: All test runs for this project
  - **Reports**: Project-specific reports and analytics

### 3. **Project Tab Components**
- `ProjectOverviewTab` - Metrics and visualizations
- `ProjectTestCasesTab` - Project test cases list
- `ProjectTestRunsTab` - Project test runs list
- `ProjectReportsTab` - Project reports

---

## 🔄 User Workflow

### Step 1: Create a Project
1. User lands on Dashboard
2. Clicks "Create Project"
3. Enters:
   - Project Name (e.g., "Website Redesign")
   - Project Code (e.g., "WEB-REDESIGN")
   - Description (optional)
4. Project is created and user is redirected to Project Detail Page

### Step 2: Work Within Project
1. User is on Project Detail Page
2. Can navigate between tabs:
   - **Overview**: See project metrics
   - **Test Cases**: Create/manage test cases
   - **Test Runs**: Execute and track test runs
   - **Reports**: View project reports

### Step 3: Create Test Cases
1. Navigate to "Test Cases" tab
2. Click "Create Test Case"
3. Test case is automatically linked to current project
4. All test cases are project-scoped

### Step 4: Execute Test Runs
1. Navigate to "Test Runs" tab
2. Execute test cases
3. All runs are tracked within the project

### Step 5: View Reports
1. Navigate to "Reports" tab
2. View project-specific analytics
3. All metrics are scoped to the project

---

## 📊 Data Relationships

```
Project (1)
  ├─→ (Many) Versions
  ├─→ (Many) Modules
  ├─→ (Many) Test Cases
  │     └─→ (Many) Test Steps
  ├─→ (Many) Test Runs
  │     └─→ (Many) Test Step Results
  └─→ (Many) Bugs
```

**Key Points:**
- Every test case belongs to ONE project
- Every test run belongs to ONE project (via test case)
- Every report is scoped to ONE project
- Versions and Modules belong to ONE project

---

## 🎨 UI/UX Design

### Dashboard (Projects List)
```
┌─────────────────────────────────────────┐
│  Projects                    [+ Create]  │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Project  │  │ Project  │            │
│  │ Card     │  │ Card     │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Project Detail Page
```
┌─────────────────────────────────────────┐
│  ← Back    Project Name [CODE]          │
│            Description                   │
├─────────────────────────────────────────┤
│  [Overview] [Test Cases] [Runs] [Reports]│
├─────────────────────────────────────────┤
│  Tab Content (scoped to project)         │
└─────────────────────────────────────────┘
```

---

## 🔌 API Integration

### Current Implementation
- Projects API: `/api/v1/projects`
- Test Cases API: `/api/v1/test-cases` (needs `projectId` filter)
- Test Runs API: `/api/v1/test-runs` (needs `projectId` filter)
- Reports API: `/api/v1/reports` (needs `projectId` parameter)

### Backend Updates Needed
1. **Test Cases API**: Add `projectId` filter parameter
2. **Test Runs API**: Add `projectId` filter parameter
3. **Reports API**: Add `projectId` parameter for project-scoped reports
4. **Dashboard API**: Add `projectId` parameter for project metrics

---

## ✅ Implementation Status

### Completed
- ✅ Dashboard shows projects list
- ✅ Create Project functionality
- ✅ Project Detail Page structure
- ✅ Project Overview Tab (with charts)
- ✅ Project Test Cases Tab
- ✅ Project Test Runs Tab (placeholder)
- ✅ Project Reports Tab (placeholder)
- ✅ Navigation between projects

### Pending
- ⏳ Backend API support for project filtering
- ⏳ Test Cases creation requires project selection
- ⏳ Test Runs scoped to projects
- ⏳ Reports scoped to projects
- ⏳ Project context in all operations

---

## 🚀 Benefits

1. **Organization**: Clear project boundaries
2. **Scalability**: Easy to manage multiple projects
3. **Collaboration**: Teams can work on different projects
4. **Reporting**: Project-specific insights
5. **Data Integrity**: All data properly scoped
6. **User Experience**: Intuitive project-first workflow

---

## 📝 Next Steps

1. **Backend Updates**:
   - Add `projectId` filters to all APIs
   - Update test case creation to require project
   - Scope all queries by project

2. **Frontend Updates**:
   - Update Test Cases form to require project
   - Update Test Runs to be project-scoped
   - Update Reports to show project data

3. **Testing**:
   - Test project creation flow
   - Test project navigation
   - Test project-scoped operations

---

**Last Updated:** November 21, 2025  
**Status:** ✅ Core Implementation Complete  
**Next:** Backend API updates for project filtering

