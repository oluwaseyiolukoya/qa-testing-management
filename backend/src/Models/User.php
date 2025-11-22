<?php

namespace App\Models;

use App\Utils\Database;

class User
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findByUsername($username)
    {
        return $this->db->fetchOne(
            "SELECT * FROM users WHERE username = ? AND is_active = 1",
            [$username]
        );
    }

    public function findById($id)
    {
        return $this->db->fetchOne(
            "SELECT id, username, email, first_name, last_name, role, avatar, is_active, created_at FROM users WHERE id = ?",
            [$id]
        );
    }

    public function findByEmail($email)
    {
        return $this->db->fetchOne(
            "SELECT * FROM users WHERE email = ? AND is_active = 1",
            [$email]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        $data['id'] = $id;
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']);
        
        $this->db->insert('users', $data);
        return $this->findById($id);
    }

    public function update($id, $data)
    {
        if (isset($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
            unset($data['password']);
        }
        
        $this->db->update('users', $data, 'id = :id', ['id' => $id]);
        return $this->findById($id);
    }

    public function verifyPassword($user, $password)
    {
        return password_verify($password, $user['password_hash']);
    }

    public function updateLastLogin($userId)
    {
        $this->db->update('users', [
            'last_login_at' => date('Y-m-d H:i:s'),
            'failed_login_attempts' => 0
        ], 'id = :id', ['id' => $userId]);
    }

    private function generateUuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }

    public function findAll($filters = [])
    {
        $sql = "SELECT id, username, email, first_name, last_name, role, avatar, is_active, last_login_at, created_at, updated_at FROM users WHERE 1=1";
        $params = [];

        if (isset($filters['role'])) {
            $sql .= " AND role = ?";
            $params[] = $filters['role'];
        }

        if (isset($filters['isActive'])) {
            $sql .= " AND is_active = ?";
            $params[] = $filters['isActive'] ? 1 : 0;
        }

        $sql .= " ORDER BY created_at DESC";

        if (isset($filters['limit'])) {
            $sql .= " LIMIT ?";
            $params[] = (int)$filters['limit'];
        }

        return $this->db->fetchAll($sql, $params);
    }

    public function delete($id)
    {
        return $this->db->delete('users', 'id = :id', ['id' => $id]);
    }

    public function toArray($user)
    {
        unset($user['password_hash']);
        unset($user['failed_login_attempts']);
        unset($user['locked_until']);
        return $user;
    }
}

