<?php

namespace App\Middleware;

use App\Utils\JWT;
use App\Utils\Response;

class AuthMiddleware
{
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/app.php';
    }

    public function handle()
    {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
            Response::unauthorized('Authorization token is required');
        }

        $authHeader = $headers['Authorization'] ?? $headers['authorization'];
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization header format');
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token, $this->config['jwt']['secret']);
            return $payload;
        } catch (\Exception $e) {
            Response::unauthorized('Invalid or expired token: ' . $e->getMessage());
        }
    }
}

