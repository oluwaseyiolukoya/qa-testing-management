# Migration: Add case_code to test_cases

## To run this migration:

### Option 1: Using MySQL command line
```bash
mysql -u your_username -p qa_testing < backend/database/migrations/add_case_code_safe.sql
```

### Option 2: Using phpMyAdmin or MySQL Workbench
1. Open phpMyAdmin or MySQL Workbench
2. Select the `qa_testing` database
3. Go to SQL tab
4. Copy and paste the contents of `add_case_code_safe.sql`
5. Execute

### Option 3: Using PHP script
```php
<?php
require_once 'config/database.php';
$db = Database::getInstance();
$sql = file_get_contents('database/migrations/add_case_code_safe.sql');
// Execute SQL statements one by one
```

## What this migration does:

1. Adds `case_code` VARCHAR(20) column to `test_cases` table (if it doesn't exist)
2. Creates a unique index on `case_code`
3. Generates case codes for existing test cases based on their project:
   - Format: `{PROJECT_CODE}-{NUMBER}` (e.g., `CSC-001`, `CSC-002`)
   - Uses first 3 characters of project code
   - Falls back to `TC-` prefix if no project assigned
   - Numbers are sequential per project

## After migration:

- New test cases will automatically get case codes like `CSC-010`
- Existing test cases will have codes generated based on their project
- The frontend will display these codes instead of UUIDs

