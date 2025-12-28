import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import CandidateLogin from './pages/CandidateLogin';
import AdminDashboard from './pages/admin/Dashboard';
import CreateAssessment from './pages/admin/CreateAssessment';
import CandidateProfile from './pages/candidate/Profile';
import AssessmentPage from './pages/candidate/AssessmentPage';
import { api } from './services/apiService';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children?: React.ReactNode, role: UserRole }) => {
  const user = api.getCurrentUser();
  const location = useLocation();

  if (!api.isAuthenticated() || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-iron-50 text-iron-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<CandidateLogin />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role={UserRole.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/create-assessment" element={
            <ProtectedRoute role={UserRole.ADMIN}>
              <CreateAssessment />
            </ProtectedRoute>
          } />
          
          <Route path="/candidate/profile" element={
            <ProtectedRoute role={UserRole.CANDIDATE}>
              <CandidateProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/candidate/assessment" element={
            <ProtectedRoute role={UserRole.CANDIDATE}>
              <AssessmentPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
