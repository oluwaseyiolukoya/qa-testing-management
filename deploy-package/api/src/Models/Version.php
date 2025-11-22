<?php

namespace App\Models;

use App\Utils\Database;

class Version
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
            $where[] = "v.project_id = ?";
            $params[] = $filters['projectId'];
        }

        if (isset($filters['isActive']) && $filters['isActive'] !== '') {
            $where[] = "v.is_active = ?";
            $params[] = $filters['isActive'] ? 1 : 0;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 100;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT v.*, 
                       p.name as project_name,
                       u.username as created_by_username
                FROM versions v 
                LEFT JOIN projects p ON v.project_id = p.id
                LEFT JOIN users u ON v.created_by = u.id 
                {$whereClause}
                ORDER BY v.created_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById($id)
    {
        return $this->db->fetchOne(
            "SELECT v.*, p.name as project_name, u.username as created_by_username
             FROM versions v 
             LEFT JOIN projects p ON v.project_id = p.id
             LEFT JOIN users u ON v.created_by = u.id 
             WHERE v.id = ?",
            [$id]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        $versionData = [
            'id' => $id,
            'project_id' => $data['projectId'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['isActive'] ?? true,
            'release_date' => isset($data['releaseDate']) ? $data['releaseDate'] : null,
            'created_by' => $data['createdBy']
        ];

        $this->db->insert('versions', $versionData);
        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['isActive'])) $updateData['is_active'] = $data['isActive'] ? 1 : 0;
        if (isset($data['releaseDate'])) $updateData['release_date'] = $data['releaseDate'];

        if (!empty($updateData)) {
            $this->db->update('versions', $updateData, 'id = :id', ['id' => $id]);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        return $this->db->delete('versions', 'id = :id', ['id' => $id]);
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

