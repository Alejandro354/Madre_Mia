import { useState } from 'react'
import Logo from '../ui/Logo.jsx'
import SmartLink from '../ui/SmartLink.jsx'
import SocialIcon from '../ui/SocialIcon.jsx'
import LoginModal from '../auth/LoginModal.jsx'
import { useContent } from '../../data/useContent.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './Footer.css'

function Footer() {
  const { footer, fundacionSocial, ui } = useContent()
  const { isAuthenticated, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo variant="dark" />
          <p className="footer__description">{footer.description}</p>
          <div className="footer__social">
            {fundacionSocial.networks.map((network) => (
              <a key={network.label} href={network.href} target="_blank" rel="noopener noreferrer" aria-label={network.label}>
                <SocialIcon name={network.icon} />
              </a>
            ))}
          </div>
        </div>

        {footer.columns.map((col) => (
          <div key={col.title} className="footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <SmartLink href={link.href}>{link.label}</SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer__col">
          <h4>{fundacionSocial.title}</h4>
          <ul>
            {fundacionSocial.team.map((person) => (
              <li key={person.label}>
                <a href={person.href} target="_blank" rel="noopener noreferrer">
                  {person.label} · LinkedIn
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="footer__admin-link"
                onClick={() => (isAuthenticated ? logout() : setLoginOpen(true))}
              >
                {isAuthenticated ? ui.logout : 'Admin'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>&copy; {new Date().getFullYear()} CDN Social. {footer.rights}</span>
        </div>
      </div>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </footer>
  )
}

export default Footer
