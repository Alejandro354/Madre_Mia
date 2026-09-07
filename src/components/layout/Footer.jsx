import Logo from '../ui/Logo.jsx'
import SocialIcon from '../ui/SocialIcon.jsx'
import { useContent } from '../../data/useContent.js'
import './Footer.css'

function Footer() {
  const { footer, fundacionSocial } = useContent()

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
                  <a href={link.href}>{link.label}</a>
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
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>&copy; {new Date().getFullYear()} CDN Social. {footer.rights}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
