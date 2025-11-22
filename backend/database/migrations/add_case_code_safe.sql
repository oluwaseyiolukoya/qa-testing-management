-- Add case_code column to test_cases table (if it doesn't exist)
SET @dbname = DATABASE();
SET @tablename = "test_cases";
SET @columnname = "case_code";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(20) NULL AFTER id")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_cases_case_code ON test_cases(case_code);

-- Generate case codes for existing test cases that don't have one
-- This will generate codes based on project
UPDATE test_cases tc
LEFT JOIN projects p ON tc.project_id = p.id
SET tc.case_code = CONCAT(
    COALESCE(UPPER(SUBSTRING(p.code, 1, 3)), 'TC'),
    '-',
    LPAD(
        (SELECT COUNT(*) FROM test_cases tc2 
         WHERE (tc2.project_id = tc.project_id OR (tc2.project_id IS NULL AND tc.project_id IS NULL))
         AND tc2.id <= tc.id
         AND (tc2.case_code IS NULL OR tc2.case_code < tc.case_code OR tc2.id < tc.id)
        ),
        3,
        '0'
    )
)
WHERE tc.case_code IS NULL;

