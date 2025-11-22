<?php

namespace App\Controllers;

use App\Models\User;
use App\Utils\JWT;
use App\Utils\Response;

class AuthController
{
    private $userModel;
    private $config;

    public function __construct()
    {
        $this->userModel = new User();
        $this->config = require __DIR__ . '/../../config/app.php';
    }

    public function login()
    {
        $rawInput = file_get_contents('php://input');
        error_log("Login attempt - Raw input: " . $rawInput);
        
        $input = json_decode($rawInput, true);

        // Check for JSON decode errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            Response::validationError('Invalid JSON in request body: ' . json_last_error_msg());
        }

        error_log("Login attempt - Username: " . ($input['username'] ?? 'MISSING'));

        if (empty($input['username']) || empty($input['password'])) {
            error_log("Login failed - Missing credentials");
            Response::validationError('Username and password are required');
        }

        $user = $this->userModel->findByUsername($input['username']);

        if (!$user) {
            error_log("Login failed - User not found: " . $input['username']);
            Response::error('Invalid credentials', 'INVALID_CREDENTIALS', 401);
        }

        error_log("User found: " . $user['username'] . ", checking password...");
        
        if (!$this->userModel->verifyPassword($user, $input['password'])) {
            error_log("Login failed - Password mismatch for user: " . $input['username']);
            Response::error('Invalid credentials', 'INVALID_CREDENTIALS', 401);
        }
        
        error_log("Login successful for user: " . $user['username']);

        if (!$user['is_active']) {
            Response::error('Account is inactive', 'ACCOUNT_INACTIVE', 403);
        }

        // Update last login
        $this->userModel->updateLastLogin($user['id']);

        // Generate tokens
        $accessToken = JWT::encode([
            'sub' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ], $this->config['jwt']['secret'], $this->config['jwt']['expiry']);

        $refreshToken = JWT::encode([
            'sub' => $user['id'],
            'type' => 'refresh'
        ], $this->config['jwt']['secret'], $this->config['jwt']['refresh_expiry']);

        $userData = $this->userModel->toArray($user);

        Response::success([
            'user' => $userData,
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken,
            'expiresIn' => $this->config['jwt']['expiry']
        ], 'Login successful');
    }

    public function me($userId)
    {
        $user = $this->userModel->findById($userId);
        
        if (!$user) {
            Response::notFound('User not found');
        }

        Response::success($this->userModel->toArray($user));
    }

    public function refresh()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['refreshToken'])) {
            Response::validationError('Refresh token is required');
        }

        try {
            $payload = JWT::decode($input['refreshToken'], $this->config['jwt']['secret']);

            if (!isset($payload['type']) || $payload['type'] !== 'refresh') {
                Response::unauthorized('Invalid refresh token');
            }

            $user = $this->userModel->findById($payload['sub']);

            if (!$user) {
                Response::unauthorized('User not found');
            }

            // Generate new tokens
            $accessToken = JWT::encode([
                'sub' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ], $this->config['jwt']['secret'], $this->config['jwt']['expiry']);

            $refreshToken = JWT::encode([
                'sub' => $user['id'],
                'type' => 'refresh'
            ], $this->config['jwt']['secret'], $this->config['jwt']['refresh_expiry']);

            Response::success([
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'expiresIn' => $this->config['jwt']['expiry']
            ]);
        } catch (\Exception $e) {
            Response::unauthorized('Invalid or expired refresh token');
        }
    }

    public function logout()
    {
        // In a production app, you would invalidate the refresh token here
        Response::success(null, 'Logged out successfully');
    }
}

