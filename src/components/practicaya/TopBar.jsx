import Icon from '../ui/Icon.jsx'
import { currentUser } from '../../data/practicaYaContent.js'
import './TopBar.css'

function TopBar({ title, subtitle }) {
  return (
    <header className="pya-topbar">
      <div className="pya-topbar__heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="pya-topbar__actions">
        <label className="pya-topbar__search">
          <Icon name="search" size={17} />
          <input type="text" placeholder="Label" />
        </label>

        <button className="pya-topbar__icon-btn" aria-label="Mensajes" type="button">
          <Icon name="message" size={19} />
        </button>

        <button className="pya-topbar__icon-btn" aria-label="Notificaciones" type="button">
          <Icon name="bell" size={19} />
          <span className="pya-topbar__icon-dot" />
        </button>

        <div className="pya-topbar__user">
          <span className="pya-topbar__avatar">{currentUser.initials}</span>
          <span className="pya-topbar__user-info">
            <span className="pya-topbar__user-name">{currentUser.name}</span>
            <span className="pya-topbar__user-role">{currentUser.role}</span>
          </span>
          <Icon name="chevron-down" size={16} />
        </div>
      </div>
    </header>
  )
}

export default TopBar
