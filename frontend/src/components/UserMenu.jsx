import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import { ChevronDownIcon } from './icons'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(user?.profile?.foto_url || null)
  const ref = useRef(null)

  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res.data.profile?.foto_url) {
          setFotoUrl(res.data.profile.foto_url)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initial = (user?.nombre_completo || '?').charAt(0).toUpperCase()

  function goToProfile() {
    setOpen(false)
    navigate('/perfil')
  }

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="user-menu-info">
          <span className="user-menu-name">{user?.nombre_completo}</span>
          <span className="user-menu-role">Estudiante</span>
        </span>
        {fotoUrl ? (
          <img className="user-menu-avatar" src={fotoUrl} alt="Foto de perfil" />
        ) : (
          <div className="user-menu-avatar user-menu-avatar--initial">{initial}</div>
        )}
        <span className="user-menu-chevron">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <button className="user-menu-item" onClick={goToProfile}>
            Ir al perfil
          </button>
          <button className="user-menu-item user-menu-item--danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
