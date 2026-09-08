import { BellIcon, ChatIcon } from './icons'
import UserMenu from './UserMenu'

/**
 * Fila superior del shell: título de la página a la izquierda, contenido opcional
 * en el centro (p. ej. el buscador de Vacantes) y las acciones a la derecha.
 *
 * Los iconos de chat y campana son decorativos: el backend todavía no tiene
 * mensajería ni notificaciones, así que no llevan acción.
 */
export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="topbar" style={{ 'marginBottom': '12px' }}>
      <div className="topbar-heading">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      {children && <div className="topbar-center">{children}</div>}

      <div className="topbar-actions">
        <span className="topbar-icon" aria-hidden="true">
          <ChatIcon />
        </span>
        <span className="topbar-icon topbar-icon--dot" aria-hidden="true">
          <BellIcon />
        </span>
        <UserMenu />
      </div>
    </header>
  )
}
