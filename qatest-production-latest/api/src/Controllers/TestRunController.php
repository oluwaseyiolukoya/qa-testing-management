<?php

namespace App\Controllers;

use App\Models\TestRun;
use App\Utils\Response;

class TestRunController
{
    private $testRunModel;

    public function __construct()
    {
        $this->testRunModel = new TestRun();
    }

    public function index()
    {
        $filters = [
            'result' => $_GET['result'] ?? null,
            'testCaseId' => $_GET['testCaseId'] ?? null,
            'environment' => $_GET['environment'] ?? null,
            'executedBy' => $_GET['executedBy'] ?? null,
            'projectId' => $_GET['projectId'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 20
        ];

        $testRuns = $this->testRunModel->findAll($filters);
        Response::success($testRuns);
    }

    public function show($id)
    {
        $testRun = $this->testRunModel->findById($id);
        
        if (!$testRun) {
            Response::notFound('Test run not found');
        }

        Response::success($testRun);
    }

    public function store($userId)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['testCaseId']) || empty($input['environment'])) {
            Response::validationError('Test case ID and environment are required');
        }

        $input['executedById'] = $userId;
        $testRun = $this->testRunModel->create($input);

        Response::success($testRun, 'Test run created successfully', 201);
    }

    public function update($id, $userId)
    {
        $testRun = $this->testRunModel->findById($id);
        
        if (!$testRun) {
            Response::notFound('Test run not found');
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $updated = $this->testRunModel->update($id, $input);

        Response::success($updated, 'Test run updated successfully');
    }

    public function destroy($id)
    {
        $testRun = $this->testRunModel->findById($id);
        
        if (!$testRun) {
            Response::notFound('Test run not found');
        }

        $this->testRunModel->delete($id);
        Response::success(null, 'Test run deleted successfully');
    }
}

