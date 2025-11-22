<?php

namespace App\Controllers;

use App\Utils\Database;
use App\Utils\Response;

class UserActivityController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get user activity report
     * Shows which users executed which tests, with statistics
     */
    public function getUserActivity($filters = [])
    {
        error_log("UserActivityController::getUserActivity called with filters: " . json_encode($filters));
        
        $where = ['1=1'];
        $params = [];

        // Filter by project
        if (!empty($filters['projectId'])) {
            $where[] = "tc.project_id = ?";
            $params[] = $filters['projectId'];
        }

        // Filter by user
        if (!empty($filters['userId'])) {
            $where[] = "tr.executed_by = ?";
            $params[] = $filters['userId'];
        }

        // Filter by date range
        if (!empty($filters['startDate'])) {
            $where[] = "tr.executed_at >= ?";
            $params[] = $filters['startDate'];
        }

        if (!empty($filters['endDate'])) {
            $where[] = "tr.executed_at <= ?";
            $params[] = $filters['endDate'];
        }

        $whereClause = implode(' AND ', $where);

        // Get detailed test runs by user
        $sql = "SELECT 
                    u.id as user_id,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.role,
                    tr.id as test_run_id,
                    tr.test_case_id,
                    tc.case_code,
                    tc.title as test_case_title,
                    tc.module,
                    tr.result,
                    tr.duration,
                    tr.environment,
                    tr.executed_at,
                    p.name as project_name,
                    p.code as project_code
                FROM test_runs tr
                INNER JOIN users u ON tr.executed_by = u.id
                INNER JOIN test_cases tc ON tr.test_case_id = tc.id
                LEFT JOIN projects p ON tc.project_id = p.id
                WHERE {$whereClause}
                ORDER BY tr.executed_at DESC";

        $testRuns = $this->db->fetchAll($sql, $params);

        // Get summary statistics by user
        // Build separate where clause for stats (without the '1=1' placeholder)
        $statsWhere = [];
        $statsParams = [];
        
        if (!empty($filters['projectId'])) {
            $statsWhere[] = "tc.project_id = ?";
            $statsParams[] = $filters['projectId'];
        }
        
        if (!empty($filters['userId'])) {
            $statsWhere[] = "tr.executed_by = ?";
            $statsParams[] = $filters['userId'];
        }
        
        if (!empty($filters['startDate'])) {
            $statsWhere[] = "tr.executed_at >= ?";
            $statsParams[] = $filters['startDate'];
        }
        
        if (!empty($filters['endDate'])) {
            $statsWhere[] = "tr.executed_at <= ?";
            $statsParams[] = $filters['endDate'];
        }
        
        $statsWhereClause = !empty($statsWhere) ? 'AND ' . implode(' AND ', $statsWhere) : '';
        
        $statsSql = "SELECT 
                        u.id as user_id,
                        u.username,
                        u.email,
                        u.first_name,
                        u.last_name,
                        u.role,
                        COUNT(tr.id) as total_tests,
                        SUM(CASE WHEN tr.result = 'PASSED' THEN 1 ELSE 0 END) as passed_tests,
                        SUM(CASE WHEN tr.result = 'FAILED' THEN 1 ELSE 0 END) as failed_tests,
                        SUM(CASE WHEN tr.result = 'BLOCKED' THEN 1 ELSE 0 END) as blocked_tests,
                        SUM(CASE WHEN tr.result = 'SKIPPED' THEN 1 ELSE 0 END) as skipped_tests,
                        AVG(tr.duration) as avg_duration,
                        MIN(tr.executed_at) as first_test_date,
                        MAX(tr.executed_at) as last_test_date
                    FROM users u
                    LEFT JOIN test_runs tr ON u.id = tr.executed_by
                    LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
                    WHERE 1=1 {$statsWhereClause}
                    GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.role
                    HAVING total_tests > 0
                    ORDER BY total_tests DESC";

        error_log("Stats SQL: " . $statsSql);
        error_log("Stats Params: " . json_encode($statsParams));
        
        $userStats = $this->db->fetchAll($statsSql, $statsParams);
        
        error_log("User stats count: " . count($userStats));

        // Get test cases assigned to users
        $assignedSql = "SELECT 
                            u.id as user_id,
                            u.username,
                            COUNT(tc.id) as assigned_count,
                            SUM(CASE WHEN tc.status = 'TODO' THEN 1 ELSE 0 END) as todo_count,
                            SUM(CASE WHEN tc.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
                            SUM(CASE WHEN tc.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count
                        FROM users u
                        LEFT JOIN test_cases tc ON u.id = tc.assigned_to
                        WHERE tc.id IS NOT NULL";

        if (!empty($filters['projectId'])) {
            $assignedSql .= " AND tc.project_id = ?";
        }

        $assignedSql .= " GROUP BY u.id, u.username";

        $assignedStats = $this->db->fetchAll($assignedSql, !empty($filters['projectId']) ? [$filters['projectId']] : []);

        error_log("Test runs count: " . count($testRuns));
        error_log("Assigned stats count: " . count($assignedStats));
        
        Response::success([
            'testRuns' => $testRuns,
            'userStats' => $userStats,
            'assignedStats' => $assignedStats,
        ]);
    }
}

