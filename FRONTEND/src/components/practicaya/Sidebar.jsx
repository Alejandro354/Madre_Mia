import Icon from '../ui/Icon.jsx'
import { brand, sidebarNav } from '../../data/practicaYaContent.js'
import './Sidebar.css'

function Sidebar({ activeKey }) {
  return (
    <aside className="pya-sidebar">
      <a href="#/practicaya/guardados" className="pya-sidebar__brand">
        <span className="pya-sidebar__brand-mark">
          <Icon name="bolt" size={18} filled />
        </span>
        <span className="pya-sidebar__brand-name">{brand.name}</span>
      </a>

      <nav className="pya-sidebar__nav">
        {sidebarNav.map((item) => (
          <a
            key={item.key}
            href={`#${item.path}`}
            className={`pya-sidebar__link ${activeKey === item.key ? 'pya-sidebar__link--active' : ''}`}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
