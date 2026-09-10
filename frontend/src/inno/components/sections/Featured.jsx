import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useBlogPosts } from '../../hooks/useBlogPosts.js'
import { localizePosts } from '../../utils/localizePost.js'
import './Featured.css'

const AUTO_ADVANCE_MS = 4200

function Featured() {
  const { news, ui } = useContent()
  const { language } = useLanguage()
  const { posts } = useBlogPosts()
  const items = [...localizePosts(posts, language), ...news.items]
  const [active, setActive] = useState(0)
  const total = items.length
  const timerRef = useRef(null)

  useEffect(() => {
    if (total === 0) return undefined

    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total)
    }, AUTO_ADVANCE_MS)

    return () => clearInterval(timerRef.current)
  }, [total])

  const goTo = (index) => {
    clearInterval(timerRef.current)
    setActive(index)
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total)
    }, AUTO_ADVANCE_MS)
  }

  const goPrev = () => goTo((active - 1 + total) % total)
  const goNext = () => goTo((active + 1) % total)

  if (total === 0) {
    return <section id="historias" className="spotlight" />
  }

  const slide = items[Math.min(active, total - 1)]

  return (
    <section id="historias" className="spotlight">
      <div className="spotlight__card">
        {items.map((item, i) => (
          <div
            key={item.slug || item.title}
            className={`spotlight__slide ${i === active ? 'spotlight__slide--active' : ''}`}
          >
            {item.image ? (
              <img
                className="spotlight__image"
                src={item.image}
                alt={item.title}
                decoding="async"
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{
                  ...(item.imagePosition ? { objectPosition: item.imagePosition } : null),
                  ...(item.imageZoom ? { transform: `scale(${item.imageZoom})`, transformOrigin: 'top center' } : null),
                }}
              />
            ) : (
              <Illustration variant="dark" />
            )}
          </div>
        ))}

        <div className="spotlight__top container">
          <span className="spotlight__counter">
            {active + 1} / {total}
          </span>
        </div>

        <div className="spotlight__overlay">
          <div className="spotlight__content container">
            <span className="spotlight__badge">{slide.tag}</span>
            <h2>{slide.title}</h2>
            <p>{slide.excerpt}</p>
            <Link className="spotlight__link" to={`/blog/${slide.slug}`}>
              {ui.readOnBlog}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="spotlight__arrow spotlight__arrow--prev"
          aria-label={ui.prevStory}
          onClick={goPrev}
        >
          ‹
        </button>
        <button
          type="button"
          className="spotlight__arrow spotlight__arrow--next"
          aria-label={ui.nextStory}
          onClick={goNext}
        >
          ›
        </button>

        <div className="spotlight__dots">
          {items.map((item, i) => (
            <button
              key={item.title}
              className={`spotlight__dot ${i === active ? 'spotlight__dot--active' : ''}`}
              aria-label={`${ui.viewStory}: ${item.title}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Featured
