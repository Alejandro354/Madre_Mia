import UserMenu from './UserMenu'

/**
 * Fila superior del shell: título de la página a la izquierda, contenido opcional
 * en el centro (p. ej. el buscador de Vacantes) y las acciones a la derecha.
 *
 */
export default function Topbar({ title, subtitle, children, showUserMenu = true }) {
  return (
    <header className="topbar">
      <div className="topbar-heading">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      {children && <div className="topbar-center">{children}</div>}

      {showUserMenu && (
        <div className="topbar-actions">
          <UserMenu />
        </div>
      )}
    </header>
  )
}
