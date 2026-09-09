import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import './App.css'
import './admin-enhancements.css'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminLayout from './components/admin/AdminLayout'
import Applications from './pages/Applications'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Vacancies from './pages/Vacancies'
import VacancyDetail from './pages/VacancyDetail'
import AdminDashboard from './pages/admin/Dashboard'
import AdminReports from './pages/admin/Reports'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  // FIX (se mantiene): esta ruta faltaba por completo. ProtectedRoute, el
  // interceptor 401 de api/client.js y el logout de UserMenu.jsx ya
  // redirigían a '/login', pero al no existir la ruta, react-router caía en
  // '*' -> '/vacantes' -> ProtectedRoute sin user -> '/login' de nuevo:
  // bucle de redirecciones. Esto es independiente del panel admin, así que
  // se deja igual.
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/vacantes',
    element: (
      <ProtectedRoute>
        <Vacancies />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vacantes/:id',
    element: (
      <ProtectedRoute>
        <VacancyDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/guardadas',
    element: (
      <ProtectedRoute>
        <Favorites />
      </ProtectedRoute>
    ),
  },
  {
    path: '/postulaciones',
    element: (
      <ProtectedRoute>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  // --- Panel administrativo ---
  // Sin guard de auth propio, a pedido: el acceso a estas rutas se controla
  // fuera de esta app (login previo / despliegue restringido al
  // administrador), no con <ProtectedRoute> ni similar.
  { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
  {
    path: '/admin/dashboard',
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/reportes',
    element: (
      <AdminLayout>
        <AdminReports />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/practicantes',
    element: (
      <AdminLayout>
        <AdminDashboard domain="practicantes" />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/practicantes/reportes',
    element: (
      <AdminLayout>
        <AdminReports domain="practicantes" />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/practicaya',
    element: (
      <AdminLayout>
        <AdminDashboard domain="practicaya" />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/practicaya/reportes',
    element: (
      <AdminLayout>
        <AdminReports domain="practicaya" />
      </AdminLayout>
    ),
  },
  { path: '*', element: <Navigate to="/vacantes" replace /> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
