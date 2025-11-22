<?php

namespace App\Controllers;

use App\Models\Module;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class ModuleController
{
    private $moduleModel;

    public function __construct()
    {
        $this->moduleModel = new Module();
    }

    public function index()
    {
        try {
            $filters = [
                'projectId' => $_GET['projectId'] ?? null,
                'isActive' => $_GET['isActive'] ?? null,
                'page' => $_GET['page'] ?? 1,
                'limit' => $_GET['limit'] ?? 100
            ];

            $modules = $this->moduleModel->findAll($filters);
            
            return Response::success($modules, 'Modules retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $module = $this->moduleModel->findById($id);
            
            if (!$module) {
                return Response::error('NOT_FOUND', 'Module not found');
            }

            return Response::success($module, 'Module retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function create($userId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Validation
            if (empty($data['name']) || empty($data['projectId'])) {
                return Response::error('VALIDATION_ERROR', 'Name and projectId are required');
            }

            $moduleData = [
                'projectId' => $data['projectId'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'createdBy' => $userId
            ];

            $module = $this->moduleModel->create($moduleData);
            
            return Response::success($module, 'Module created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function update($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $module = $this->moduleModel->findById($id);

            if (!$module) {
                return Response::error('NOT_FOUND', 'Module not found');
            }

            $updatedModule = $this->moduleModel->update($id, $data);
            
            return Response::success($updatedModule, 'Module updated successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            $module = $this->moduleModel->findById($id);

            if (!$module) {
                return Response::error('NOT_FOUND', 'Module not found');
            }

            $this->moduleModel->delete($id);
            
            return Response::success(null, 'Module deleted successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }
}

