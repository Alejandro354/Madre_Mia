import Icon from '../ui/Icon.jsx'
import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import fundadoresImg from '../../assets/fundadores1.jpeg'
import cadenaInnovacionImg from '../../assets/cadena y innovacion social.png'
import practicantesImg from '../../assets/practicantes.jpg'
import voluntariadoImg from '../../assets/Voluntariado Bosque seco tropical1.jpg'
import './MissionVision.css'

function MvBlock({ data, reverse, caption, id, mainImage, mainImageAlt, secondaryImage, secondaryImageAlt }) {
  return (
    <section id={id} className={`mv-block ${reverse ? 'mv-block--reverse' : ''}`}>
      <div className="container mv-block__grid">
        <div className="mv-block__media">
          <Illustration
            caption={caption}
            className="mv-block__media-main"
            image={mainImage}
            imageAlt={mainImageAlt}
          />
          <Illustration
            variant="dark"
            className="mv-block__media-secondary"
            image={secondaryImage}
            imageAlt={secondaryImageAlt}
          />
        </div>

        <div className="mv-block__content">
          <h2>{data.label}</h2>
          <p className="mv-block__text">{data.text}</p>
          <ul className="mv-block__checklist">
            {data.points.map((point) => (
              <li key={point}>
                <span className="mv-block__check">
                  <Icon name="check" size={13} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function MissionVision() {
  const { aboutPage } = useContent()

  return (
    <>
      <MvBlock
        id="mision"
        data={aboutPage.mission}
        mainImage={fundadoresImg}
        mainImageAlt="Fundadores de la Fundación Juan del Corral"
        secondaryImage={cadenaInnovacionImg}
        secondaryImageAlt="CADENA e Innovación Social"
      />
      <MvBlock
        id="vision"
        data={aboutPage.vision}
        reverse
        mainImage={voluntariadoImg}
        mainImageAlt="Voluntariado en el Bosque Seco Tropical"
        secondaryImage={practicantesImg}
        secondaryImageAlt="Practicantes de CDN Social"
      />
    </>
  )
}

export default MissionVision
