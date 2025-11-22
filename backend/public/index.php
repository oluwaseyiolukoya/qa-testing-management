<?php

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Set to 1 for development

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

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

use App\Utils\Response;
use App\Middleware\AuthMiddleware;
use App\Controllers\AuthController;
use App\Controllers\TestCaseController;
use App\Controllers\TestRunController;
use App\Controllers\ReportController;
use App\Controllers\UserController;
use App\Controllers\ProjectController;
use App\Controllers\VersionController;
use App\Controllers\ModuleController;

// CORS headers
$config = require __DIR__ . '/../config/app.php';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $config['cors']['allowed_origins'];

if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: " . implode(', ', $config['cors']['allowed_methods']));
    header("Access-Control-Allow-Headers: " . implode(', ', $config['cors']['allowed_headers']));
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set JSON content type
header('Content-Type: application/json');

// Parse request
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and trim slashes
$path = strtok($requestUri, '?');
$path = trim($path, '/');

// Remove 'api/v1' prefix if present
$path = preg_replace('#^api/v1/?#', '', $path);

// Parse path segments
$segments = array_filter(explode('/', $path));
$segments = array_values($segments);

try {
    // Log all requests for debugging
    error_log("Request: " . $requestMethod . " " . $requestUri);
    error_log("Parsed path: " . $path);
    error_log("Segments: " . json_encode($segments));
    
    // Public routes (no authentication required)
    if ($requestMethod === 'POST' && isset($segments[0]) && isset($segments[1]) && $segments[0] === 'auth' && $segments[1] === 'login') {
        error_log("Matched login route");
        $controller = new AuthController();
        $controller->login();
        exit;
    }

    if ($requestMethod === 'POST' && $segments[0] === 'auth' && $segments[1] === 'refresh') {
        $controller = new AuthController();
        $controller->refresh();
        exit;
    }

    // Protected routes (authentication required)
    $authMiddleware = new AuthMiddleware();
    $user = $authMiddleware->handle();
    $userId = $user['sub'];

    // Auth routes
    if ($segments[0] === 'auth') {
        $controller = new AuthController();
        
        if ($requestMethod === 'GET' && $segments[1] === 'me') {
            $controller->me($userId);
        } elseif ($requestMethod === 'POST' && $segments[1] === 'logout') {
            $controller->logout();
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Users routes
    if ($segments[0] === 'users') {
        $controller = new UserController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->create();
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Test Cases routes
    if ($segments[0] === 'test-cases') {
        $controller = new TestCaseController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && $segments[1] === 'stats') {
            $controller->stats();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->store($userId);
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1], $userId);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->destroy($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Test Runs routes
    if ($segments[0] === 'test-runs') {
        $controller = new TestRunController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->store($userId);
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1], $userId);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->destroy($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Bugs routes
    if ($segments[0] === 'bugs') {
        // Similar structure to test-cases
        Response::success([], 'Bugs endpoint - to be implemented');
        exit;
    }

    // Projects routes
    if ($segments[0] === 'projects') {
        $controller = new ProjectController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->create($userId);
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Versions routes
    if ($segments[0] === 'versions') {
        $controller = new VersionController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->create($userId);
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Modules routes
    if ($segments[0] === 'modules') {
        $controller = new ModuleController();
        
        if ($requestMethod === 'GET' && !isset($segments[1])) {
            $controller->index();
        } elseif ($requestMethod === 'GET' && isset($segments[1])) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'POST') {
            $controller->create($userId);
        } elseif ($requestMethod === 'PUT' && isset($segments[1])) {
            $controller->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1])) {
            $controller->delete($segments[1]);
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Reports routes
    if ($segments[0] === 'reports') {
        $controller = new ReportController();
        
        if ($requestMethod === 'GET' && $segments[1] === 'dashboard') {
            $controller->dashboard();
        } elseif ($requestMethod === 'GET' && $segments[1] === 'test-coverage') {
            $controller->testCoverage();
        } elseif ($requestMethod === 'GET' && $segments[1] === 'bug-analytics') {
            $controller->bugAnalytics();
        } else {
            Response::notFound('Route not found');
        }
        exit;
    }

    // Health check
    if ($segments[0] === 'health') {
        Response::success([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '1.0.0'
        ]);
        exit;
    }

    // Route not found
    Response::notFound('Route not found');

} catch (\Exception $e) {
    Response::error($e->getMessage(), 'SERVER_ERROR', 500);
}

