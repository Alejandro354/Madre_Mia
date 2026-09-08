import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { BrandLoader } from './Loaders'
import Sidebar from './Sidebar'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <BrandLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <main className="app-content" style={{marginBottom: '10px'}}>{children}</main>
      </div>
    </div>
  )
}
