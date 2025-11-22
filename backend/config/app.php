<?php

return [
    'name' => 'QA Testing Management API',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => getenv('APP_DEBUG') === 'true',
    'url' => getenv('APP_URL') ?: 'http://localhost:8000',
    'timezone' => 'UTC',
    
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-this-in-production',
        'expiry' => 3600, // 1 hour
        'refresh_expiry' => 604800, // 7 days
    ],
    
    'cors' => [
        'allowed_origins' => explode(',', getenv('CORS_ORIGINS') ?: 'http://localhost:5173'),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires'],
    ],
];

