<?php

namespace App\Utils;

class Response
{
    public static function json($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => $statusCode >= 200 && $statusCode < 300,
            'data' => $data,
            'meta' => [
                'timestamp' => date('c'),
                'requestId' => uniqid('req_')
            ]
        ];
        
        echo json_encode($response);
        exit;
    }

    public static function success($data = null, $message = null, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => true,
            'data' => $data,
            'meta' => [
                'timestamp' => date('c'),
                'requestId' => uniqid('req_')
            ]
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        echo json_encode($response);
        exit;
    }

    public static function error($message, $code = 'ERROR', $statusCode = 400, $details = null)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message
            ],
            'meta' => [
                'timestamp' => date('c'),
                'requestId' => uniqid('req_')
            ]
        ];
        
        if ($details) {
            $response['error']['details'] = $details;
        }
        
        echo json_encode($response);
        exit;
    }

    public static function unauthorized($message = 'Unauthorized')
    {
        self::error($message, 'UNAUTHORIZED', 401);
    }

    public static function notFound($message = 'Resource not found')
    {
        self::error($message, 'NOT_FOUND', 404);
    }

    public static function validationError($message, $details = null)
    {
        self::error($message, 'VALIDATION_ERROR', 422, $details);
    }
}

