<?php

namespace App\Models;

use App\Utils\Database;

class Module
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findAll($filters = [])
    {
        $where = [];
        $params = [];

        if (!empty($filters['projectId'])) {
            $where[] = "m.project_id = ?";
            $params[] = $filters['projectId'];
        }

        if (isset($filters['isActive']) && $filters['isActive'] !== '') {
            $where[] = "m.is_active = ?";
            $params[] = $filters['isActive'] ? 1 : 0;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 100;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT m.*, 
                       p.name as project_name,
                       u.username as created_by_username,
                       (SELECT COUNT(*) FROM test_cases WHERE module_id = m.id) as test_case_count
                FROM modules m 
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN users u ON m.created_by = u.id 
                {$whereClause}
                ORDER BY m.created_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById($id)
    {
        return $this->db->fetchOne(
            "SELECT m.*, p.name as project_name, u.username as created_by_username
             FROM modules m 
             LEFT JOIN projects p ON m.project_id = p.id
             LEFT JOIN users u ON m.created_by = u.id 
             WHERE m.id = ?",
            [$id]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        $moduleData = [
            'id' => $id,
            'project_id' => $data['projectId'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['isActive'] ?? true,
            'created_by' => $data['createdBy']
        ];

        $this->db->insert('modules', $moduleData);
        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['isActive'])) $updateData['is_active'] = $data['isActive'] ? 1 : 0;

        if (!empty($updateData)) {
            $this->db->update('modules', $updateData, 'id = :id', ['id' => $id]);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        return $this->db->delete('modules', 'id = :id', ['id' => $id]);
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
}

