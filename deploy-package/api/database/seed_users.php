<?php
/**
 * Seed Users Script
 * Creates demo users with properly hashed passwords
 */

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
        }
    }
}

require_once __DIR__ . '/../src/Utils/Database.php';

use App\Utils\Database;

$db = Database::getInstance();

echo "Seeding users...\n";

// Demo users with their passwords
$users = [
    [
        'id' => '550e8400-e29b-41d4-a716-446655440001',
        'username' => 'admin',
        'email' => 'admin@qatest.com',
        'password' => 'admin123',
        'first_name' => 'Admin',
        'last_name' => 'User',
        'role' => 'ADMIN',
        'is_active' => 1
    ],
    [
        'id' => '550e8400-e29b-41d4-a716-446655440002',
        'username' => 'tester',
        'email' => 'tester@qatest.com',
        'password' => 'tester123',
        'first_name' => 'Test',
        'last_name' => 'Engineer',
        'role' => 'QA_ENGINEER',
        'is_active' => 1
    ],
    [
        'id' => '550e8400-e29b-41d4-a716-446655440003',
        'username' => 'john',
        'email' => 'john@qatest.com',
        'password' => 'john123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'role' => 'QA_ENGINEER',
        'is_active' => 1
    ],
    [
        'id' => '550e8400-e29b-41d4-a716-446655440004',
        'username' => 'jane',
        'email' => 'jane@qatest.com',
        'password' => 'jane123',
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'role' => 'QA_MANAGER',
        'is_active' => 1
    ]
];

foreach ($users as $userData) {
    $password = $userData['password'];
    unset($userData['password']);
    
    // Hash the password
    $userData['password_hash'] = password_hash($password, PASSWORD_BCRYPT);
    
    // Check if user already exists
    $existing = $db->fetchOne(
        "SELECT id FROM users WHERE id = ? OR username = ?",
        [$userData['id'], $userData['username']]
    );
    
    if ($existing) {
        // Update existing user
        $db->update('users', [
            'password_hash' => $userData['password_hash'],
            'email' => $userData['email'],
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'role' => $userData['role'],
            'is_active' => $userData['is_active']
        ], 'id = :id', ['id' => $userData['id']]);
        echo "✓ Updated user: {$userData['username']}\n";
    } else {
        // Insert new user
        $db->insert('users', $userData);
        echo "✓ Created user: {$userData['username']}\n";
    }
}

echo "\n✅ User seeding completed!\n";
echo "\nDemo Credentials:\n";
echo "  Admin: admin / admin123\n";
echo "  Tester: tester / tester123\n";
echo "  John: john / john123\n";
echo "  Jane: jane / jane123\n";

