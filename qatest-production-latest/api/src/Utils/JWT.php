<?php

namespace App\Utils;

class JWT
{
    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data)
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    public static function encode($payload, $secret, $expiresIn = 3600)
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    public static function decode($token, $secret)
    {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new \Exception('Invalid token format');
        }

        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);

        if (!hash_equals($signature, $expectedSignature)) {
            throw new \Exception('Invalid token signature');
        }

        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new \Exception('Token has expired');
        }

        return $payload;
    }

    public static function verify($token, $secret)
    {
        try {
            return self::decode($token, $secret);
        } catch (\Exception $e) {
            return false;
        }
    }
}

