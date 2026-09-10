import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import './AboutHistory.css'

function AboutHistory() {
  const { history } = useContent()

  return (
    <section className="history">
      <div className="container history__grid">
        <div className="history__content">
          <h2>{history.title}</h2>
          {history.paragraphs.map((paragraph, i) => (
            <p key={i} className="history__paragraph">{paragraph}</p>
          ))}
        </div>

        <div className="history__media">
          <Illustration
            className="history__media-main"
            image={history.mainImage}
            imageAlt={history.title}
          />
          <Illustration
            variant="dark"
            className="history__media-secondary"
            image={history.secondaryImage}
            imageAlt={history.title}
          />
        </div>
      </div>
    </section>
  )
}

export default AboutHistory
