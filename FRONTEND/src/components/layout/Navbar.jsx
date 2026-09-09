import { useState } from 'react'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import { useContent } from '../../data/useContent.js'
import { useAuth } from '../../context/AuthContext.jsx'
import fundacionLogo from '../../assets/LOGO FUNDACIÓN.png'
import { useHashRoute } from '../../hooks/useHashRoute.js'
import './Navbar.css'

function getActiveHref(links, path) {
  const routeLink = links.find(
    (link) => link.href.startsWith('#/') && path.startsWith(link.href.slice(1))
  )

  return routeLink ? routeLink.href : '#inicio'
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const path = useHashRoute()
  const { nav, ui } = useContent()
  const { isAuthenticated } = useAuth()
  const links = isAuthenticated ? [...nav.links, { label: 'Admin', href: '#/admin' }] : nav.links
  const activeHref = getActiveHref(links, path)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a href="#inicio" className="navbar__brand">
          <Logo />
          <img src={fundacionLogo} alt="Fundación Juan del Corral" className="navbar__fundacion-logo" />
        </a>

        <nav className={`navbar__links ${open ? 'navbar__links--open' : 'na'}`}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.href === activeHref ? 'navbar__link--active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="navbar__links-actions">
            <LanguageSwitcher />
            <Button variant="outline" href={nav.secondaryCta.href}>
              {nav.secondaryCta.label}
            </Button>
            <Button variant="primary" href={nav.primaryCta.href}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.6-5-8-5Z" />
              </svg>
              {nav.primaryCta.label}
            </Button>
          </div>
        </nav>

        <div className="navbar__actions">
          <LanguageSwitcher />
          <Button variant="outline" href={nav.secondaryCta.href}>
            {nav.secondaryCta.label}
          </Button>
          <Button variant="primary" href={nav.primaryCta.href}>
            {nav.primaryCta.label}
          </Button>
        </div>

        <button
          className={`navbar__toggle ${open ? 'navbar__toggle--open' : ''}`}
          aria-label={ui.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Navbar
