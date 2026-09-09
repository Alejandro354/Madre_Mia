import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { BrandLoader } from './Loaders'

/**
 * Protege las rutas del panel administrativo (/admin/*).
 *
 * A diferencia de <ProtectedRoute>, este guard NO envuelve el contenido en el
 * layout de usuario (Sidebar + app-layout), porque <AdminLayout> ya aporta su
 * propio layout (AdminSidebar). Antes de este cambio, /admin/* no usaba
 * ningún guard y era visible sin iniciar sesión.
 *
 * TODO (cuando el backend valide roles): además de `user`, exigir
 * `user.role === 'admin'` para que un usuario autenticado pero no-admin no
 * pueda entrar aquí. Ahora mismo el modelo de usuario expuesto por
 * /api/auth/me no incluye un rol, así que solo se valida sesión.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <BrandLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
