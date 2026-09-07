import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import CreateProfile from './pages/student/CreateProfile';
import VacanciesList from './pages/student/VacanciesList';
import VacancyDetail from './pages/student/VacancyDetail';
import Portfolio from './pages/student/Portfolio';
import Applications from './pages/student/Applications';
import SavedVacancies from './pages/student/SavedVacancies';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import StudentsList from './pages/company/StudentsList';
import StudentProfile from './pages/company/StudentProfile';
import CompanyProfile from './pages/company/CompanyProfile';
import SavedCandidates from './pages/company/SavedCandidates';

// Shared
import Chat from './pages/shared/Chat';

// Placeholder for protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/estudiante" element={
          <ProtectedRoute allowedRoles={['estudiante']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="perfil" element={<CreateProfile />} />
          <Route path="vacantes" element={<VacanciesList />} />
          <Route path="vacantes/:id" element={<VacancyDetail />} />
          <Route path="portafolio" element={<Portfolio />} />
          <Route path="postulaciones" element={<Applications />} />
          <Route path="guardados" element={<SavedVacancies />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* Company Routes */}
        <Route path="/empresa" element={
          <ProtectedRoute allowedRoles={['empresa']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CompanyDashboard />} />
          <Route path="estudiantes" element={<StudentsList />} />
          <Route path="estudiantes/:id" element={<StudentProfile />} />
          <Route path="perfil" element={<CompanyProfile />} />
          <Route path="candidatos" element={<SavedCandidates />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* Redirect root based on auth or default to login */}
        <Route path="/" element={
          <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
