<?php

namespace App\Models;

use App\Utils\Database;

class TestCase
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
            $where[] = "status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['priority'])) {
            $where[] = "priority = ?";
            $params[] = $filters['priority'];
        }

        if (!empty($filters['module'])) {
            $where[] = "module = ?";
            $params[] = $filters['module'];
        }

        if (!empty($filters['search'])) {
            $where[] = "(title LIKE ? OR description LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['projectId'])) {
            $where[] = "tc.project_id = ?";
            $params[] = $filters['projectId'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $limit = $filters['limit'] ?? 20;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;

        $sql = "SELECT tc.*, u.username as created_by_username,
                       p.code as project_code,
                       tc.case_code
                FROM test_cases tc 
                LEFT JOIN users u ON tc.created_by = u.id 
                LEFT JOIN projects p ON tc.project_id = p.id
                {$whereClause}
                ORDER BY tc.created_at DESC 
                LIMIT {$limit} OFFSET {$offset}";

        $testCases = $this->db->fetchAll($sql, $params);
        
        // Optionally load steps for each test case (only if requested)
        if (!empty($filters['includeSteps'])) {
            foreach ($testCases as &$testCase) {
                $testCase['steps'] = $this->getSteps($testCase['id']);
            }
        }
        
        return $testCases;
    }

    public function findById($id)
    {
        $testCase = $this->db->fetchOne(
            "SELECT tc.*, u.username as created_by_username, u.email as created_by_email,
                    p.code as project_code
             FROM test_cases tc 
             LEFT JOIN users u ON tc.created_by = u.id 
             LEFT JOIN projects p ON tc.project_id = p.id
             WHERE tc.id = ?",
            [$id]
        );

        if ($testCase) {
            $testCase['steps'] = $this->getSteps($id);
        }

        return $testCase;
    }

    public function getSteps($testCaseId)
    {
        return $this->db->fetchAll(
            "SELECT * FROM test_steps WHERE test_case_id = ? ORDER BY step_number ASC",
            [$testCaseId]
        );
    }

    public function create($data)
    {
        $id = $this->generateUuid();
        
        $testCaseData = [
            'id' => $id,
            'title' => $data['title'],
            'description' => $data['description'],
            'priority' => $data['priority'] ?? 'MEDIUM',
            'status' => $data['status'] ?? 'TODO',
            'module' => $data['module'],
            'expected_result' => $data['expectedResult'],
            'preconditions' => $data['preconditions'] ?? null,
            'postconditions' => $data['postconditions'] ?? null,
            'test_data' => isset($data['testData']) ? json_encode($data['testData']) : null,
            'tags' => isset($data['tags']) ? json_encode($data['tags']) : null,
            'estimated_time' => $data['estimatedTime'] ?? null,
            'created_by' => $data['createdBy'],
            'project_id' => $data['projectId'] ?? null
        ];

        // Add case_code only if column exists
        if ($this->hasCaseCodeColumn()) {
            $caseCode = $this->generateCaseCode($data['projectId'] ?? null);
            $testCaseData['case_code'] = $caseCode;
        }

        $this->db->insert('test_cases', $testCaseData);

        // Insert steps if provided
        if (!empty($data['steps'])) {
            foreach ($data['steps'] as $step) {
                $this->db->insert('test_steps', [
                    'id' => $this->generateUuid(),
                    'test_case_id' => $id,
                    'step_number' => $step['stepNumber'],
                    'action' => $step['action'],
                    'expected_result' => $step['expectedResult']
                ]);
            }
        }

        return $this->findById($id);
    }

    public function update($id, $data)
    {
        $updateData = [];
        
        if (isset($data['title'])) $updateData['title'] = $data['title'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['priority'])) $updateData['priority'] = $data['priority'];
        if (isset($data['status'])) $updateData['status'] = $data['status'];
        if (isset($data['module'])) $updateData['module'] = $data['module'];
        if (isset($data['expectedResult'])) $updateData['expected_result'] = $data['expectedResult'];
        if (isset($data['preconditions'])) $updateData['preconditions'] = $data['preconditions'];
        if (isset($data['postconditions'])) $updateData['postconditions'] = $data['postconditions'];
        if (isset($data['testData'])) $updateData['test_data'] = json_encode($data['testData']);
        if (isset($data['tags'])) $updateData['tags'] = json_encode($data['tags']);
        if (isset($data['estimatedTime'])) $updateData['estimated_time'] = $data['estimatedTime'];

        if (!empty($updateData)) {
            $this->db->update('test_cases', $updateData, 'id = :id', ['id' => $id]);
        }

        // Update steps if provided (always update steps, even if empty array)
        if (isset($data['steps'])) {
            // Delete existing steps first
            $this->db->query("DELETE FROM test_steps WHERE test_case_id = ?", [$id]);
            
            // Insert new steps if any provided
            if (is_array($data['steps']) && !empty($data['steps'])) {
                $stepNumber = 1;
                foreach ($data['steps'] as $step) {
                    if (!empty($step['action']) && trim($step['action']) !== '') {
                        $this->db->insert('test_steps', [
                            'id' => $this->generateUuid(),
                            'test_case_id' => $id,
                            'step_number' => isset($step['stepNumber']) ? (int)$step['stepNumber'] : $stepNumber,
                            'action' => trim($step['action']),
                            'expected_result' => isset($step['expectedResult']) ? trim($step['expectedResult']) : ''
                        ]);
                        $stepNumber++;
                    }
                }
            }
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        return $this->db->delete('test_cases', 'id = :id', ['id' => $id]);
    }

    public function getStats()
    {
        $total = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_cases")['count'];
        $byStatus = $this->db->fetchAll("SELECT status, COUNT(*) as count FROM test_cases GROUP BY status");
        $byPriority = $this->db->fetchAll("SELECT priority, COUNT(*) as count FROM test_cases GROUP BY priority");
        $byModule = $this->db->fetchAll("SELECT module, COUNT(*) as count FROM test_cases GROUP BY module");

        return [
            'total' => (int)$total,
            'byStatus' => $this->arrayToKeyValue($byStatus, 'status', 'count'),
            'byPriority' => $this->arrayToKeyValue($byPriority, 'priority', 'count'),
            'byModule' => $byModule
        ];
    }

    private function arrayToKeyValue($array, $keyField, $valueField)
    {
        $result = [];
        foreach ($array as $item) {
            $result[$item[$keyField]] = (int)$item[$valueField];
        }
        return $result;
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

    private function hasCaseCodeColumn()
    {
        try {
            $result = $this->db->fetchOne(
                "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'test_cases' 
                 AND COLUMN_NAME = 'case_code'"
            );
            return isset($result['count']) && $result['count'] > 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function generateCaseCode($projectId = null)
    {
        // Get project code if project ID is provided
        $prefix = 'TC'; // Default prefix
        if ($projectId) {
            $project = $this->db->fetchOne(
                "SELECT code FROM projects WHERE id = ?",
                [$projectId]
            );
            if ($project && !empty($project['code'])) {
                // Use first 3 characters of project code, uppercase
                $prefix = strtoupper(substr($project['code'], 0, 3));
            }
        }

        // Get the next sequence number for this project
        $whereClause = $projectId ? "WHERE project_id = ?" : "WHERE project_id IS NULL";
        $params = $projectId ? [$projectId] : [];
        
        $lastCase = $this->db->fetchOne(
            "SELECT case_code FROM test_cases {$whereClause} ORDER BY case_code DESC LIMIT 1",
            $params
        );

        $nextNumber = 1;
        if ($lastCase && !empty($lastCase['case_code'])) {
            // Extract number from last case code (e.g., "CSC-010" -> 10)
            if (preg_match('/-(\d+)$/', $lastCase['case_code'], $matches)) {
                $nextNumber = (int)$matches[1] + 1;
            }
        }

        return $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}

