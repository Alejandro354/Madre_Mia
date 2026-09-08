import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
  BoltIcon,
  BookmarkIcon,
  BriefcaseIcon,
  ChecklistIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from './icons'

const STORAGE_KEY = 'sidebar:collapsed'

const links = [
  { to: '/vacantes', label: 'Vacantes', Icon: BriefcaseIcon },
  { to: '/postulaciones', label: 'Mis postulaciones', Icon: ChecklistIcon },
  { to: '/guardadas', label: 'Guardados', Icon: BookmarkIcon },
]

/** Lee la preferencia guardada. En modo privado localStorage puede lanzar. */
function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // La preferencia no se conserva, pero la barra sigue funcionando.
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
            aria-label={collapsed ? label : undefined}
          >
            <span className="sidebar-link-icon">
              <Icon />
            </span>
            <span className="sidebar-link-label">{label}</span>
            <span className="sidebar-tooltip" role="tooltip">
              {label === 'Mis postulaciones' ? 'Postulaciones' : label}
            </span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        <span className="sidebar-link-icon">
          {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
        </span>
        <span className="sidebar-link-label">Contraer</span>
        <span className="sidebar-tooltip" role="tooltip">
          {collapsed ? 'Expandir menú' : 'Contraer menú'}
        </span>
      </button>
    </aside>
  )
}
