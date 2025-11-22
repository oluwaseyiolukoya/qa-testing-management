<?php
/**
 * Migration Runner: Add case_code to test_cases
 * 
 * Run this file from command line:
 * php backend/database/migrations/run_migration.php
 * 
 * Or access via browser (if web server is configured)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../src/Utils/Database.php';

use App\Utils\Database;

try {
    $db = Database::getInstance();
    $pdo = new PDO(
        "mysql:host=" . getenv('DB_HOST') ?: 'localhost' . ";dbname=" . (getenv('DB_DATABASE') ?: 'qa_testing'),
        getenv('DB_USERNAME') ?: 'root',
        getenv('DB_PASSWORD') ?: ''
    );
    
    echo "Starting migration: Add case_code column...\n";
    
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM test_cases LIKE 'case_code'");
    $columnExists = $stmt->rowCount() > 0;
    
    if (!$columnExists) {
        echo "Adding case_code column...\n";
        $pdo->exec("ALTER TABLE test_cases ADD COLUMN case_code VARCHAR(20) NULL AFTER id");
        echo "✓ Column added\n";
    } else {
        echo "✓ Column already exists\n";
    }
    
    // Add unique index if it doesn't exist
    try {
        $pdo->exec("CREATE UNIQUE INDEX idx_test_cases_case_code ON test_cases(case_code)");
        echo "✓ Unique index created\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "✓ Index already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Generate case codes for existing test cases
    echo "Generating case codes for existing test cases...\n";
    
    // Get all test cases without case_code
    $stmt = $pdo->query("SELECT id, project_id FROM test_cases WHERE case_code IS NULL ORDER BY created_at ASC");
    $testCases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $projectCounters = [];
    
    foreach ($testCases as $testCase) {
        $projectId = $testCase['project_id'];
        
        // Get project code
        $prefix = 'TC';
        if ($projectId) {
            $projectStmt = $pdo->prepare("SELECT code FROM projects WHERE id = ?");
            $projectStmt->execute([$projectId]);
            $project = $projectStmt->fetch(PDO::FETCH_ASSOC);
            if ($project && !empty($project['code'])) {
                $prefix = strtoupper(substr($project['code'], 0, 3));
            }
        }
        
        // Initialize counter for this project
        if (!isset($projectCounters[$projectId ?: 'null'])) {
            // Get the highest existing number for this project
            $maxStmt = $pdo->prepare("
                SELECT case_code FROM test_cases 
                WHERE project_id " . ($projectId ? "= ?" : "IS NULL") . " 
                AND case_code IS NOT NULL 
                ORDER BY case_code DESC LIMIT 1
            ");
            $maxStmt->execute($projectId ? [$projectId] : []);
            $maxCase = $maxStmt->fetch(PDO::FETCH_ASSOC);
            
            $projectCounters[$projectId ?: 'null'] = 0;
            if ($maxCase && !empty($maxCase['case_code'])) {
                if (preg_match('/-(\d+)$/', $maxCase['case_code'], $matches)) {
                    $projectCounters[$projectId ?: 'null'] = (int)$matches[1];
                }
            }
        }
        
        // Increment counter
        $projectCounters[$projectId ?: 'null']++;
        $caseCode = $prefix . '-' . str_pad($projectCounters[$projectId ?: 'null'], 3, '0', STR_PAD_LEFT);
        
        // Update test case
        $updateStmt = $pdo->prepare("UPDATE test_cases SET case_code = ? WHERE id = ?");
        $updateStmt->execute([$caseCode, $testCase['id']]);
        
        echo "  Generated: {$caseCode} for test case {$testCase['id']}\n";
    }
    
    echo "\n✓ Migration completed successfully!\n";
    echo "Total test cases processed: " . count($testCases) . "\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

