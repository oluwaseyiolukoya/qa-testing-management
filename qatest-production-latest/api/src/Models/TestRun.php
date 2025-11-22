<?php

namespace App\Models;

use App\Utils\Database;

class TestRun
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

        if (!empty($filters['result'])) {
            $where[] = "tr.result = ?";
            $params[] = $filters['result'];
        }

        if (!empty($filters['testCaseId'])) {
            $where[] = "tr.test_case_id = ?";
            $params[] = $filters['testCaseId'];
        }

        if (!empty($filters['environment'])) {
            $where[] = "tr.environment = ?";
            $params[] = $filters['environment'];
        }

        if (!empty($filters['executedBy'])) {
            $where[] = "tr.executed_by = ?";
            $params[] = $filters['executedBy'];
        }

        if (!empty($filters['projectId'])) {
            $where[] = "tc.project_id = ?";
            $params[] = $filters['projectId'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 20;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT tr.*, 
                       tc.title as test_case_title,
                       tc.module as test_case_module,
                       u.username as executed_by_username
                FROM test_runs tr 
                LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
                LEFT JOIN users u ON tr.executed_by = u.id 
                {$whereClause}
                ORDER BY tr.executed_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById($id)
    {
        $testRun = $this->db->fetchOne(
            "SELECT tr.*, 
                    tc.title as test_case_title,
                    tc.module as test_case_module,
                    u.username as executed_by_username,
                    u.email as executed_by_email
             FROM test_runs tr 
             LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
             LEFT JOIN users u ON tr.executed_by = u.id 
             WHERE tr.id = ?",
            [$id]
        );

        if ($testRun) {
            $testRun['stepResults'] = $this->getStepResults($id);
        }

        return $testRun;
    }

    public function getStepResults($testRunId)
    {
        return $this->db->fetchAll(
            "SELECT * FROM test_step_results WHERE test_run_id = ? ORDER BY step_number ASC",
            [$testRunId]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        $testRunData = [
            'id' => $id,
            'test_case_id' => $data['testCaseId'],
            'executed_by' => $data['executedById'],
            'result' => $data['result'] ?? 'PENDING',
            'duration' => $data['duration'] ?? null,
            'environment' => $data['environment'],
            'build_version' => $data['buildVersion'] ?? null,
            'notes' => $data['notes'] ?? null,
            'actual_result' => $data['actualResult'] ?? null,
            'executed_at' => date('Y-m-d H:i:s')
        ];

        $this->db->insert('test_runs', $testRunData);

        // Insert step results if provided
        if (!empty($data['stepResults'])) {
            foreach ($data['stepResults'] as $stepResult) {
                $this->db->insert('test_step_results', [
                    'id' => $this->generateUuid(),
                    'test_run_id' => $id,
                    'step_number' => $stepResult['stepNumber'],
                    'result' => $stepResult['result'],
                    'actual_result' => $stepResult['actualResult'] ?? null,
                    'notes' => $stepResult['notes'] ?? null,
                    'screenshot' => $stepResult['screenshot'] ?? null
                ]);
            }
        }

        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['result'])) $updateData['result'] = $data['result'];
        if (isset($data['duration'])) $updateData['duration'] = $data['duration'];
        if (isset($data['notes'])) $updateData['notes'] = $data['notes'];
        if (isset($data['actualResult'])) $updateData['actual_result'] = $data['actualResult'];

        if (!empty($updateData)) {
            $this->db->update('test_runs', $updateData, 'id = :id', ['id' => $id]);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        return $this->db->delete('test_runs', 'id = :id', ['id' => $id]);
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

