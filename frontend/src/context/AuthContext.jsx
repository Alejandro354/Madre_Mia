import { createContext, useContext, useEffect, useState } from 'react'

import { getMe, login as loginApi, register as registerApi } from '../api/auth'
import { ACCESS_KEY, REFRESH_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  function persist(response) {
    localStorage.setItem(ACCESS_KEY, response.data.access_token)
    localStorage.setItem(REFRESH_KEY, response.data.refresh_token)
    setUser(response.data.user)
  }

  async function register(payload) {
    const res = await registerApi(payload)
    persist(res)
    return res
  }

  async function login(payload) {
    const res = await loginApi(payload)
    persist(res)
    return res
  }

  function logout() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
