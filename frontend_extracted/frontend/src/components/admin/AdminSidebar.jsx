import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
  BoltIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SparkIcon,
} from '../icons'

const STORAGE_KEY = 'admin-sidebar:collapsed'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: SparkIcon },
]

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Reutiliza exactamente las clases .sidebar del sistema existente para verse igual.
export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* preferencia no persistida */
      }
      return next
    })
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">
          <BoltIcon />
        </span>
        <span className="sidebar-brand-name">
          Práctica<span className="sidebar-brand-accent">Ya</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <span className="sidebar-link-icon">
              <Icon />
            </span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}

      </nav>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggle}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        <span className="sidebar-link-icon">
          {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
        </span>
        <span className="sidebar-link-label">Contraer</span>
      </button>
    </aside>
  )
}
