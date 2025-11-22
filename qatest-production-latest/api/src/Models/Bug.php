<?php

namespace App\Models;

use App\Utils\Database;

class Bug
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

        if (!empty($filters['status'])) {
            $where[] = "b.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['severity'])) {
            $where[] = "b.severity = ?";
            $params[] = $filters['severity'];
        }

        if (!empty($filters['priority'])) {
            $where[] = "b.priority = ?";
            $params[] = $filters['priority'];
        }

        if (!empty($filters['assignedTo'])) {
            $where[] = "b.assigned_to = ?";
            $params[] = $filters['assignedTo'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 20;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT b.*, 
                       u1.username as created_by_username,
                       u2.username as assigned_to_username,
                       tr.test_case_id,
                       tc.title as test_case_title
                FROM bugs b 
                LEFT JOIN users u1 ON b.created_by = u1.id
                LEFT JOIN users u2 ON b.assigned_to = u2.id
                LEFT JOIN test_runs tr ON b.test_run_id = tr.id
                LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
                {$whereClause}
                ORDER BY b.created_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById($id)
    {
        $bug = $this->db->fetchOne(
            "SELECT b.*, 
                    u1.username as created_by_username,
                    u1.email as created_by_email,
                    u2.username as assigned_to_username,
                    u2.email as assigned_to_email,
                    tr.test_case_id,
                    tc.title as test_case_title
             FROM bugs b 
             LEFT JOIN users u1 ON b.created_by = u1.id
             LEFT JOIN users u2 ON b.assigned_to = u2.id
             LEFT JOIN test_runs tr ON b.test_run_id = tr.id
             LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
             WHERE b.id = ?",
            [$id]
        );

        if ($bug) {
            $bug['comments'] = $this->getComments($id);
        }

        return $bug;
    }

    public function getComments($bugId)
    {
        return $this->db->fetchAll(
            "SELECT bc.*, u.username, u.email 
             FROM bug_comments bc
             LEFT JOIN users u ON bc.user_id = u.id
             WHERE bc.bug_id = ? 
             ORDER BY bc.created_at ASC",
            [$bugId]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        $bugData = [
            'id' => $id,
            'test_run_id' => $data['testRunId'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'],
            'severity' => $data['severity'] ?? 'MEDIUM',
            'priority' => $data['priority'] ?? 'MEDIUM',
            'status' => $data['status'] ?? 'OPEN',
            'type' => $data['type'] ?? 'FUNCTIONAL',
            'steps_to_reproduce' => $data['stepsToReproduce'] ?? null,
            'environment' => $data['environment'] ?? null,
            'build_version' => $data['buildVersion'] ?? null,
            'created_by' => $data['createdBy'],
            'assigned_to' => $data['assignedTo'] ?? null
        ];

        $this->db->insert('bugs', $bugData);
        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['title'])) $updateData['title'] = $data['title'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['severity'])) $updateData['severity'] = $data['severity'];
        if (isset($data['priority'])) $updateData['priority'] = $data['priority'];
        if (isset($data['status'])) $updateData['status'] = $data['status'];
        if (isset($data['type'])) $updateData['type'] = $data['type'];
        if (isset($data['stepsToReproduce'])) $updateData['steps_to_reproduce'] = $data['stepsToReproduce'];
        if (isset($data['assignedTo'])) $updateData['assigned_to'] = $data['assignedTo'];

        if ($data['status'] === 'RESOLVED' && !isset($updateData['resolved_at'])) {
            $updateData['resolved_at'] = date('Y-m-d H:i:s');
        }
        
        if ($data['status'] === 'CLOSED' && !isset($updateData['closed_at'])) {
            $updateData['closed_at'] = date('Y-m-d H:i:s');
        }

        if (!empty($updateData)) {
            $this->db->update('bugs', $updateData, 'id = :id', ['id' => $id]);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        return $this->db->delete('bugs', 'id = :id', ['id' => $id]);
    }

    public function addComment($bugId, $userId, $comment)
    {
        $commentId = $this->generateUuid();
        
        $this->db->insert('bug_comments', [
            'id' => $commentId,
            'bug_id' => $bugId,
            'user_id' => $userId,
            'comment' => $comment
        ]);

        return $this->db->fetchOne(
            "SELECT bc.*, u.username, u.email 
             FROM bug_comments bc
             LEFT JOIN users u ON bc.user_id = u.id
             WHERE bc.id = ?",
            [$commentId]
        );
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

