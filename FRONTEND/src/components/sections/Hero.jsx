import Button from '../ui/Button.jsx'
import heroImage from '../../assets/Imagen1.jpg'
import { useContent } from '../../data/useContent.js'
import './Hero.css'

function Hero() {
  const { hero } = useContent()

  return (
    <section id="inicio" className="hero">
      <div className="container hero__grid">
        <div className="hero__content">
          <h1 className="hero__title">{hero.title}</h1>
          <p className="hero__subtitle">{hero.subtitle}</p>
          <div className="hero__actions">
            <Button variant="primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </Button>
            <Button variant="outline" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <div className="hero__media">
          <div className="hero__image-frame">
            <img
              src={heroImage}
              alt="Equipo CDN Social en su oficina"
              className="hero__image"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
