import { createContext, useCallback, useContext, useState } from 'react'

const AuthContext = createContext(null)
const TOKEN_KEY = 'cdn-admin-token'

function getInitialToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getInitialToken)

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo iniciar sesión')
    }
    try {
      window.localStorage.setItem(TOKEN_KEY, data.token)
    } catch {
      // localStorage unavailable — session stays in memory only
    }
    setToken(data.token)
    return data
  }, [])

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      // ignore
    }
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
