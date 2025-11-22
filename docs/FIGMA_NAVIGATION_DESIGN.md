# Figma Navigation Design - Tab Menu Implementation

## 📋 Navigation Structure

The application uses a **tab-based navigation system** matching the exact Figma design.

### Tab Menu Layout

The navigation tabs are displayed in a horizontal bar below the header, with 5 tabs arranged in a grid:

```
┌─────────────────────────────────────────────────────────┐
│  [Dashboard] [Test Cases] [Test Runs] [Reports] [Team] │
└─────────────────────────────────────────────────────────┘
```

### Tab Specifications (From Figma)

| Tab | Icon | Label | Route | Description |
|-----|------|-------|-------|-------------|
| **Dashboard** | `BarChart3` | Dashboard | `/dashboard` | Overview metrics and charts |
| **Test Cases** | `FileCheck` | Test Cases | `/test-cases` | Manage test cases |
| **Test Runs** | `PlayCircle` | Test Runs | `/test-runs` | Track test executions |
| **Reports** | `BarChart3` | Reports | `/reports` | Detailed reports |
| **Team** | `Users` | Team | `/team` | Team management |

### Design Details

#### Tab Container
```tsx
<TabsList className="grid w-full max-w-3xl grid-cols-5">
```

**Styling:**
- Grid layout: 5 columns
- Max width: `max-w-3xl` (768px)
- Full width on smaller screens
- Responsive: Stacks on mobile

#### Tab Trigger
```tsx
<TabsTrigger value="dashboard" className="flex items-center gap-2">
  <BarChart3 className="size-4" />
  Dashboard
</TabsTrigger>
```

**Features:**
- Icon + Label layout
- Icons from Lucide React
- Icon size: `size-4` (16px)
- Gap between icon and text: `gap-2` (8px)
- Active state styling via shadcn/ui Tabs component

### Icons Used

| Tab | Icon Component | Import |
|-----|----------------|--------|
| Dashboard | `BarChart3` | `lucide-react` |
| Test Cases | `FileCheck` | `lucide-react` |
| Test Runs | `PlayCircle` | `lucide-react` |
| Reports | `BarChart3` | `lucide-react` |
| Team | `Users` | `lucide-react` |

### Implementation

#### MainLayout Component
```tsx
<Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
  <TabsList className="grid w-full max-w-3xl grid-cols-5">
    {/* Tab triggers */}
  </TabsList>
  <div>{children}</div>
</Tabs>
```

#### Routing Integration
- Tabs sync with React Router
- Tab change triggers navigation
- Current route determines active tab
- URL-based navigation supported

### Tab States

**Active Tab:**
- Highlighted background
- Primary text color
- Icon visible

**Inactive Tab:**
- Muted background
- Muted text color
- Icon visible

### Responsive Behavior

**Desktop (>768px):**
- 5 tabs in a row
- Max width: 768px
- Centered layout

**Tablet/Mobile (<768px):**
- Tabs wrap or stack
- Full width
- Touch-friendly sizing

### Navigation Flow

1. User clicks tab
2. `handleTabChange` called
3. Navigate to corresponding route
4. Tab state updates
5. Page content changes

### Routes Mapping

```
/dashboard    → DashboardPage
/test-cases   → TestCasesPage
/test-runs    → TestRunsPage
/reports      → ReportsPage
/team         → TeamPage
```

### Current Implementation

✅ **Completed:**
- Tab navigation menu
- 5 tabs with icons
- Routing integration
- Active state management
- Responsive layout
- Placeholder pages created

⏳ **To Be Implemented:**
- Test Cases page content
- Test Runs page content
- Reports page content
- Team page content

### Code Structure

```
MainLayout.tsx
├── Header (Logo, User Info, Logout)
├── Tabs Navigation
│   ├── TabsList (5 tabs)
│   └── Tab Triggers (with icons)
└── Content Area
    └── {children} (Page components)
```

### Styling Classes

**TabsList:**
- `grid` - Grid layout
- `w-full` - Full width
- `max-w-3xl` - Max width constraint
- `grid-cols-5` - 5 columns

**TabsTrigger:**
- `flex` - Flex layout
- `items-center` - Vertical centering
- `gap-2` - Icon-text spacing

**Icons:**
- `size-4` - 16px × 16px

### Accessibility

- Keyboard navigation supported
- ARIA labels via shadcn/ui
- Focus states visible
- Screen reader friendly

---

**Last Updated:** November 21, 2025  
**Design Source:** Figma - Software Testing Management Tool  
**Implementation:** React + TypeScript + shadcn/ui Tabs

