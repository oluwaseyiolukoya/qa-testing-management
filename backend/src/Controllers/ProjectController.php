<?php

namespace App\Controllers;

use App\Models\Project;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class ProjectController
{
    private $projectModel;

    public function __construct()
    {
        $this->projectModel = new Project();
    }

    public function index()
    {
        try {
            $filters = [
                'isActive' => $_GET['isActive'] ?? null,
                'page' => $_GET['page'] ?? 1,
                'limit' => $_GET['limit'] ?? 100
            ];

            $projects = $this->projectModel->findAll($filters);
            
            return Response::success($projects, 'Projects retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $project = $this->projectModel->findById($id);
            
            if (!$project) {
                return Response::error('NOT_FOUND', 'Project not found');
            }

            return Response::success($project, 'Project retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function create($userId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Validation
            if (empty($data['name']) || empty($data['code'])) {
                return Response::error('VALIDATION_ERROR', 'Name and code are required');
            }

            // Check if code already exists
            $existing = $this->projectModel->findByCode($data['code']);
            if ($existing) {
                return Response::error('VALIDATION_ERROR', 'Project code already exists');
            }

            $projectData = [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'code' => $data['code'],
                'isActive' => $data['isActive'] ?? true,
                'createdBy' => $userId
            ];

            $project = $this->projectModel->create($projectData);
            
            return Response::success($project, 'Project created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function update($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $project = $this->projectModel->findById($id);

            if (!$project) {
                return Response::error('NOT_FOUND', 'Project not found');
            }

            // Check code uniqueness if being updated
            if (isset($data['code']) && $data['code'] !== $project['code']) {
                $existing = $this->projectModel->findByCode($data['code']);
                if ($existing) {
                    return Response::error('VALIDATION_ERROR', 'Project code already exists');
                }
            }

            $updatedProject = $this->projectModel->update($id, $data);
            
            return Response::success($updatedProject, 'Project updated successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            error_log("Delete project request for ID: " . $id);
            
            $project = $this->projectModel->findById($id);

            if (!$project) {
                error_log("Project not found: " . $id);
                return Response::error('NOT_FOUND', 'Project not found', 404);
            }

            error_log("Attempting to delete project: " . $project['name']);
            $this->projectModel->delete($id);
            error_log("Project deleted successfully: " . $id);
            
            return Response::success(null, 'Project deleted successfully');
        } catch (\Exception $e) {
            error_log("Error deleting project: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return Response::error('SERVER_ERROR', $e->getMessage(), 500);
        }
    }
}

