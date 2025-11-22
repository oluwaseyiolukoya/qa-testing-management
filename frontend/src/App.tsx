import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectModulesPage } from './pages/ProjectModulesPage';
import { TestCasesPage } from './pages/TestCasesPage';
import { TestRunsPage } from './pages/TestRunsPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { UserActivityPage } from './pages/UserActivityPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/projects/:projectId/modules" element={<ProjectModulesPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="/test-cases" element={<TestCasesPage />} />
                  <Route path="/test-runs" element={<TestRunsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route 
                    path="/team" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <TeamPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/user-activity" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UserActivityPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
