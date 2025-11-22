<?php

namespace App\Models;

use App\Utils\Database;

class Project
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

        if (isset($filters['isActive']) && $filters['isActive'] !== '' && $filters['isActive'] !== null) {
            $where[] = "p.is_active = ?";
            // Handle string "true"/"false" or boolean true/false
            $isActive = $filters['isActive'];
            if (is_string($isActive)) {
                $isActive = strtolower($isActive) === 'true' || $isActive === '1';
            }
            $params[] = ($isActive === true || $isActive === 1 || $isActive === '1') ? 1 : 0;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 100;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT p.*, 
                       u.username as created_by_username,
                       (SELECT COUNT(*) FROM test_cases WHERE project_id = p.id) as test_case_count
                FROM projects p 
                LEFT JOIN users u ON p.created_by = u.id 
                {$whereClause}
                ORDER BY p.created_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById($id)
    {
        return $this->db->fetchOne(
            "SELECT p.*, 
                    u.username as created_by_username,
                    (SELECT COUNT(*) FROM test_cases WHERE project_id = p.id) as test_case_count
             FROM projects p 
             LEFT JOIN users u ON p.created_by = u.id 
             WHERE p.id = ?",
            [$id]
        );
    }

    public function findByCode($code)
    {
        return $this->db->fetchOne(
            "SELECT * FROM projects WHERE code = ?",
            [$code]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        // Handle isActive - can be boolean or string
        $isActive = $data['isActive'] ?? true;
        if (is_string($isActive)) {
            $isActive = strtolower($isActive) === 'true' || $isActive === '1';
        }
        
        $projectData = [
            'id' => $id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'code' => strtoupper($data['code']),
            'is_active' => $isActive ? 1 : 0,
            'created_by' => $data['createdBy']
        ];

        $this->db->insert('projects', $projectData);
        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['code'])) $updateData['code'] = strtoupper($data['code']);
        if (isset($data['isActive'])) $updateData['is_active'] = $data['isActive'] ? 1 : 0;

        if (!empty($updateData)) {
            $this->db->update('projects', $updateData, 'id = :id', ['id' => $id]);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        try {
            // Start transaction
            $conn = $this->db->getConnection();
            $conn->beginTransaction();

            // 1) Delete bugs linked to test runs for this project's test cases
            $this->db->query(
                "DELETE b FROM bugs b
                 INNER JOIN test_runs tr ON b.test_run_id = tr.id
                 INNER JOIN test_cases tc ON tr.test_case_id = tc.id
                 WHERE tc.project_id = ?",
                [$id]
            );

            // 2) Delete associated test steps (via test cases)
            $this->db->query(
                "DELETE ts FROM test_steps ts 
                 INNER JOIN test_cases tc ON ts.test_case_id = tc.id 
                 WHERE tc.project_id = ?",
                [$id]
            );

            // 3) Delete associated test runs (via test cases)
            $this->db->query(
                "DELETE tr FROM test_runs tr 
                 INNER JOIN test_cases tc ON tr.test_case_id = tc.id 
                 WHERE tc.project_id = ?",
                [$id]
            );

            // 4) Delete associated test cases
            $this->db->query("DELETE FROM test_cases WHERE project_id = ?", [$id]);

            // 5) Delete associated modules
            $this->db->query("DELETE FROM modules WHERE project_id = ?", [$id]);

            // 6) Delete associated versions
            $this->db->query("DELETE FROM versions WHERE project_id = ?", [$id]);

            // 7) Finally delete the project itself
            $result = $this->db->delete('projects', 'id = :id', ['id' => $id]);

            // Commit transaction
            $conn->commit();

            return $result;
        } catch (\Exception $e) {
            // Rollback on error
            if (isset($conn)) {
                $conn->rollBack();
            }
            throw $e;
        }
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

