import Icon from '../ui/Icon.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { useContent } from '../../data/useContent.js'
import './Services.css'

function Services() {
  const { services } = useContent()

  return (
    <section id="servicios" className="services">
      <div className="container">
        <SectionHeader title={services.title} align="center" />

        <div className="services__grid">
          {services.items.map((item, i) => {
            const number = String(i + 1).padStart(2, '0')

            return (
              <div key={item.title} className="service-card">
                <div className="service-card__inner">
                  <div className="service-card__face service-card__face--front">
                    <img src={item.image} alt="" className="service-card__face-image" />
                    <div className="service-card__face-overlay">
                      <div className="service-card__number-row">
                        <span className="service-card__arrow">
                          <Icon name="arrow-right" size={14} />
                        </span>
                        <span className="service-card__number">{number}</span>
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                  </div>

                  <div className="service-card__face service-card__face--back">
                    <span className="service-card__back-number">{number}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Services
