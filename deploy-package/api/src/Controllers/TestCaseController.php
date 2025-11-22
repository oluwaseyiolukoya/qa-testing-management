<?php

namespace App\Controllers;

use App\Models\TestCase;
use App\Utils\Response;

class TestCaseController
{
    private $testCaseModel;

    public function __construct()
    {
        $this->testCaseModel = new TestCase();
    }

    public function index()
    {
        $filters = [
            'status' => $_GET['status'] ?? null,
            'priority' => $_GET['priority'] ?? null,
            'module' => $_GET['module'] ?? null,
            'search' => $_GET['search'] ?? null,
            'projectId' => $_GET['projectId'] ?? null,
            'page' => $_GET['page'] ?? 1,
            'limit' => $_GET['limit'] ?? 20
        ];

        $testCases = $this->testCaseModel->findAll($filters);
        Response::success($testCases);
    }

    public function show($id)
    {
        $testCase = $this->testCaseModel->findById($id);
        
        if (!$testCase) {
            Response::notFound('Test case not found');
        }

        Response::success($testCase);
    }

    public function store($userId)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['title']) || empty($input['description']) || empty($input['module']) || empty($input['expectedResult'])) {
            Response::validationError('Title, description, module, and expected result are required');
        }

        $input['createdBy'] = $userId;
        $testCase = $this->testCaseModel->create($input);

        Response::success($testCase, 'Test case created successfully', 201);
    }

    public function update($id, $userId)
    {
        $testCase = $this->testCaseModel->findById($id);
        
        if (!$testCase) {
            Response::notFound('Test case not found');
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        // Log for debugging (remove in production)
        error_log('Update test case input: ' . json_encode($input));
        
        $updated = $this->testCaseModel->update($id, $input);

        Response::success($updated, 'Test case updated successfully');
    }

    public function destroy($id)
    {
        $testCase = $this->testCaseModel->findById($id);
        
        if (!$testCase) {
            Response::notFound('Test case not found');
        }

        $this->testCaseModel->delete($id);
        Response::success(null, 'Test case deleted successfully');
    }

    public function stats()
    {
        $stats = $this->testCaseModel->getStats();
        Response::success($stats);
    }
}

