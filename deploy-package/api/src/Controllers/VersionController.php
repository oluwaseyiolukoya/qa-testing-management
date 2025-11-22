<?php

namespace App\Controllers;

use App\Models\Version;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class VersionController
{
    private $versionModel;

    public function __construct()
    {
        $this->versionModel = new Version();
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

            $versions = $this->versionModel->findAll($filters);
            
            return Response::success($versions, 'Versions retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $version = $this->versionModel->findById($id);
            
            if (!$version) {
                return Response::error('NOT_FOUND', 'Version not found');
            }

            return Response::success($version, 'Version retrieved successfully');
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

            $versionData = [
                'projectId' => $data['projectId'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'releaseDate' => $data['releaseDate'] ?? null,
                'createdBy' => $userId
            ];

            $version = $this->versionModel->create($versionData);
            
            return Response::success($version, 'Version created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function update($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $version = $this->versionModel->findById($id);

            if (!$version) {
                return Response::error('NOT_FOUND', 'Version not found');
            }

            $updatedVersion = $this->versionModel->update($id, $data);
            
            return Response::success($updatedVersion, 'Version updated successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            $version = $this->versionModel->findById($id);

            if (!$version) {
                return Response::error('NOT_FOUND', 'Version not found');
            }

            $this->versionModel->delete($id);
            
            return Response::success(null, 'Version deleted successfully');
        } catch (\Exception $e) {
            return Response::error('SERVER_ERROR', $e->getMessage());
        }
    }
}

