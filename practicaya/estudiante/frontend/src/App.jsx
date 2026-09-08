import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import './App.css'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Applications from './pages/Applications'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Vacancies from './pages/Vacancies'
import VacancyDetail from './pages/VacancyDetail'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/', element: <Navigate to="/vacantes" replace /> },
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
  { path: '*', element: <Navigate to="/vacantes" replace /> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
