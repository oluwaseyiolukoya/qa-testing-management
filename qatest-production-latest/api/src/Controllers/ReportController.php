<?php

namespace App\Controllers;

use App\Utils\Database;
use App\Utils\Response;

class ReportController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function dashboard()
    {
        // Get overview metrics
        $totalTestCases = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_cases")['count'];
        $activeTestCases = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_cases WHERE status = 'ACTIVE'")['count'];
        $totalTestRuns = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_runs")['count'];
        
        // Test results
        $passedRuns = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_runs WHERE result = 'PASSED'")['count'];
        $failedRuns = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_runs WHERE result = 'FAILED'")['count'];
        $blockedRuns = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_runs WHERE result = 'BLOCKED'")['count'];
        $skippedRuns = $this->db->fetchOne("SELECT COUNT(*) as count FROM test_runs WHERE result = 'SKIPPED'")['count'];
        
        $passRate = $totalTestRuns > 0 ? round(($passedRuns / $totalTestRuns) * 100, 2) : 0;
        
        // Bug metrics
        $openBugs = $this->db->fetchOne("SELECT COUNT(*) as count FROM bugs WHERE status IN ('OPEN', 'IN_PROGRESS')")['count'];
        $criticalBugs = $this->db->fetchOne("SELECT COUNT(*) as count FROM bugs WHERE severity = 'CRITICAL' AND status IN ('OPEN', 'IN_PROGRESS')")['count'];
        
        // Bugs by severity
        $bugsBySeverity = $this->db->fetchAll("SELECT severity, COUNT(*) as count FROM bugs WHERE status IN ('OPEN', 'IN_PROGRESS') GROUP BY severity");
        $bugsSeverityMap = [];
        foreach ($bugsBySeverity as $item) {
            $bugsSeverityMap[$item['severity']] = (int)$item['count'];
        }
        
        // Recent activity
        $recentActivity = $this->db->fetchAll("
            SELECT 'TEST_RUN' as type, 
                   CONCAT('Test \"', tc.title, '\" ', LOWER(tr.result)) as message,
                   tr.executed_at as timestamp
            FROM test_runs tr
            LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
            ORDER BY tr.executed_at DESC
            LIMIT 10
        ");

        $metrics = [
            'overview' => [
                'totalTestCases' => (int)$totalTestCases,
                'activeTestCases' => (int)$activeTestCases,
                'totalTestRuns' => (int)$totalTestRuns,
                'passRate' => (float)$passRate,
                'openBugs' => (int)$openBugs,
                'criticalBugs' => (int)$criticalBugs
            ],
            'testResults' => [
                'passed' => (int)$passedRuns,
                'failed' => (int)$failedRuns,
                'blocked' => (int)$blockedRuns,
                'skipped' => (int)$skippedRuns
            ],
            'bugsBySeverity' => $bugsSeverityMap,
            'recentActivity' => $recentActivity
        ];

        Response::success($metrics);
    }

    public function testCoverage()
    {
        $byModule = $this->db->fetchAll("
            SELECT module, COUNT(*) as test_cases
            FROM test_cases
            WHERE status = 'ACTIVE'
            GROUP BY module
        ");

        Response::success([
            'byModule' => $byModule
        ]);
    }

    public function bugAnalytics()
    {
        $summary = [
            'totalBugs' => (int)$this->db->fetchOne("SELECT COUNT(*) as count FROM bugs")['count'],
            'openBugs' => (int)$this->db->fetchOne("SELECT COUNT(*) as count FROM bugs WHERE status = 'OPEN'")['count'],
            'resolvedBugs' => (int)$this->db->fetchOne("SELECT COUNT(*) as count FROM bugs WHERE status = 'RESOLVED'")['count'],
            'closedBugs' => (int)$this->db->fetchOne("SELECT COUNT(*) as count FROM bugs WHERE status = 'CLOSED'")['count']
        ];

        $bySeverity = $this->db->fetchAll("SELECT severity, COUNT(*) as count FROM bugs GROUP BY severity");
        $byType = $this->db->fetchAll("SELECT type, COUNT(*) as count FROM bugs GROUP BY type");

        Response::success([
            'summary' => $summary,
            'bySeverity' => $this->arrayToKeyValue($bySeverity, 'severity', 'count'),
            'byType' => $this->arrayToKeyValue($byType, 'type', 'count')
        ]);
    }

    private function arrayToKeyValue($array, $keyField, $valueField)
    {
        $result = [];
        foreach ($array as $item) {
            $result[$item[$keyField]] = (int)$item[$valueField];
        }
        return $result;
    }
}

