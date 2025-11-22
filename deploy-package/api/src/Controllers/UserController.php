<?php

namespace App\Controllers;

use App\Models\User as UserModel;
use App\Utils\Response;

class UserController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    public function index()
    {
        try {
            $filters = [];
            
            if (isset($_GET['role'])) {
                $filters['role'] = $_GET['role'];
            }
            
            if (isset($_GET['isActive'])) {
                $filters['isActive'] = $_GET['isActive'] === 'true';
            }
            
            if (isset($_GET['limit'])) {
                $filters['limit'] = (int)$_GET['limit'];
            }

            $users = $this->userModel->findAll($filters);
            $usersArray = array_map(function($user) {
                $cleaned = $this->userModel->toArray($user);
                // Transform snake_case to camelCase for frontend
                return [
                    'id' => $cleaned['id'],
                    'username' => $cleaned['username'],
                    'email' => $cleaned['email'],
                    'firstName' => $cleaned['first_name'] ?? null,
                    'lastName' => $cleaned['last_name'] ?? null,
                    'role' => $cleaned['role'],
                    'avatar' => $cleaned['avatar'] ?? null,
                    'isActive' => (bool)$cleaned['is_active'],
                    'lastLoginAt' => $cleaned['last_login_at'] ?? null,
                    'createdAt' => $cleaned['created_at'],
                    'updatedAt' => $cleaned['updated_at'] ?? $cleaned['created_at']
                ];
            }, $users);
            $total = count($usersArray);

            http_response_code(200);
            header('Content-Type: application/json');
            
            echo json_encode([
                'success' => true,
                'data' => $usersArray,
                'meta' => [
                    'total' => $total,
                    'page' => 1,
                    'limit' => $filters['limit'] ?? $total,
                    'timestamp' => date('c'),
                    'requestId' => uniqid('req_')
                ]
            ]);
            exit;
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $user = $this->userModel->findById($id);

            if (!$user) {
                return Response::error('NOT_FOUND', 'User not found');
            }

            $cleaned = $this->userModel->toArray($user);
            // Transform snake_case to camelCase for frontend
            $transformed = [
                'id' => $cleaned['id'],
                'username' => $cleaned['username'],
                'email' => $cleaned['email'],
                'firstName' => $cleaned['first_name'] ?? null,
                'lastName' => $cleaned['last_name'] ?? null,
                'role' => $cleaned['role'],
                'avatar' => $cleaned['avatar'] ?? null,
                'isActive' => (bool)$cleaned['is_active'],
                'lastLoginAt' => $cleaned['last_login_at'] ?? null,
                'createdAt' => $cleaned['created_at'],
                'updatedAt' => $cleaned['updated_at'] ?? $cleaned['created_at']
            ];

            return Response::success($transformed);
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function create()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Debug logging
            error_log("Create user request data: " . json_encode($data));

            // Validation
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                error_log("Validation failed - username: " . ($data['username'] ?? 'missing') . 
                         ", email: " . ($data['email'] ?? 'missing') . 
                         ", password: " . (isset($data['password']) ? 'provided' : 'missing'));
                return Response::error('VALIDATION_ERROR', 'Username, email, and password are required');
            }

            // Check if username already exists
            $existingUser = $this->userModel->findByUsername($data['username']);
            if ($existingUser) {
                error_log("Username '{$data['username']}' already exists");
                return Response::error('VALIDATION_ERROR', 'Username already exists');
            }

            // Check if email already exists
            $existingEmail = $this->userModel->findByEmail($data['email']);
            if ($existingEmail) {
                error_log("Email '{$data['email']}' already exists");
                return Response::error('VALIDATION_ERROR', 'Email already exists');
            }
            
            error_log("Validation passed, creating user...");

            $userData = [
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => $data['password'],
                'first_name' => $data['firstName'] ?? null,
                'last_name' => $data['lastName'] ?? null,
                'role' => $data['role'] ?? 'TESTER',
                'is_active' => isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1,
            ];

            error_log("About to create user with data: " . json_encode($userData));
            $user = $this->userModel->create($userData);
            error_log("User created successfully: " . json_encode($user));
            
            $cleaned = $this->userModel->toArray($user);
            // Transform snake_case to camelCase for frontend
            $transformed = [
                'id' => $cleaned['id'],
                'username' => $cleaned['username'],
                'email' => $cleaned['email'],
                'firstName' => $cleaned['first_name'] ?? null,
                'lastName' => $cleaned['last_name'] ?? null,
                'role' => $cleaned['role'],
                'avatar' => $cleaned['avatar'] ?? null,
                'isActive' => (bool)$cleaned['is_active'],
                'lastLoginAt' => $cleaned['last_login_at'] ?? null,
                'createdAt' => $cleaned['created_at'],
                'updatedAt' => $cleaned['updated_at'] ?? $cleaned['created_at']
            ];
            
            return Response::success($transformed, 'User created successfully', 201);
        } catch (\Exception $e) {
            error_log("Exception in create user: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function update($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("Update user {$id} request data: " . json_encode($data));
            
            $user = $this->userModel->findById($id);

            if (!$user) {
                return Response::error('NOT_FOUND', 'User not found');
            }
            
            error_log("Current user data: " . json_encode($user));

            // Check email uniqueness if being updated
            if (isset($data['email']) && $data['email'] !== $user['email']) {
                $existingEmail = $this->userModel->findByEmail($data['email']);
                if ($existingEmail) {
                    return Response::error('VALIDATION_ERROR', 'Email already exists');
                }
            }

            $updateData = [];
            
            if (isset($data['email'])) {
                $updateData['email'] = $data['email'];
            }
            
            if (isset($data['firstName'])) {
                $updateData['first_name'] = $data['firstName'];
            }
            
            if (isset($data['lastName'])) {
                $updateData['last_name'] = $data['lastName'];
            }
            
            if (isset($data['role'])) {
                $updateData['role'] = $data['role'];
            }
            
            if (isset($data['isActive'])) {
                $updateData['is_active'] = $data['isActive'] ? 1 : 0;
            }
            
            if (isset($data['password']) && !empty($data['password'])) {
                $updateData['password'] = $data['password'];
            }

            error_log("Update data to be applied: " . json_encode($updateData));
            $updatedUser = $this->userModel->update($id, $updateData);
            error_log("Updated user result: " . json_encode($updatedUser));
            
            $cleaned = $this->userModel->toArray($updatedUser);
            // Transform snake_case to camelCase for frontend
            $transformed = [
                'id' => $cleaned['id'],
                'username' => $cleaned['username'],
                'email' => $cleaned['email'],
                'firstName' => $cleaned['first_name'] ?? null,
                'lastName' => $cleaned['last_name'] ?? null,
                'role' => $cleaned['role'],
                'avatar' => $cleaned['avatar'] ?? null,
                'isActive' => (bool)$cleaned['is_active'],
                'lastLoginAt' => $cleaned['last_login_at'] ?? null,
                'createdAt' => $cleaned['created_at'],
                'updatedAt' => $cleaned['updated_at'] ?? $cleaned['created_at']
            ];
            
            return Response::success($transformed, 'User updated successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            $user = $this->userModel->findById($id);

            if (!$user) {
                return Response::error('NOT_FOUND', 'User not found');
            }

            $this->userModel->delete($id);
            
            return Response::success(null, 'User deleted successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }
}

