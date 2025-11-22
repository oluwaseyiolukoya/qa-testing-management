<?php
/**
 * Migration: Update test_case status to Todo, In Progress, Resolved
 * 
 * Run: php backend/database/migrations/update_status_migration.php
 */

require_once __DIR__ . '/../../config/database.php';

$config = require __DIR__ . '/../../config/database.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    
    echo "Starting migration: Update test_case status values...\n";
    
    // First, migrate existing data to temporary values that will be valid in new ENUM
    echo "Migrating existing test case statuses...\n";
    
    // Temporarily change column to VARCHAR to allow any value
    $pdo->exec("ALTER TABLE test_cases MODIFY COLUMN status VARCHAR(20) DEFAULT 'TODO'");
    echo "✓ Column changed to VARCHAR temporarily\n";
    
    // Map old statuses to new ones
    $pdo->exec("UPDATE test_cases SET status = 'TODO' WHERE status IN ('ACTIVE', 'DRAFT', 'UNDER_REVIEW')");
    $pdo->exec("UPDATE test_cases SET status = 'RESOLVED' WHERE status = 'DEPRECATED'");
    echo "✓ Data migrated to new status values\n";
    
    // Now update ENUM values
    echo "Updating status ENUM values...\n";
    $pdo->exec("ALTER TABLE test_cases MODIFY COLUMN status ENUM('TODO', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'TODO'");
    echo "✓ ENUM values updated\n";
    
    echo "\n✓ Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

