import { useMemo, useState } from 'react'
import Illustration from '../ui/Illustration.jsx'
import { useContent } from '../../data/useContent.js'
import { useBlogPosts } from '../../hooks/useBlogPosts.js'
import './News.css'

function News() {
  const { news, ui } = useContent()
  const { posts } = useBlogPosts()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const allItems = useMemo(() => [...posts, ...news.items], [posts, news.items])

  const categories = useMemo(() => {
    const unique = [...new Set(allItems.map((item) => item.tag).filter(Boolean))]
    return unique.sort((a, b) => a.localeCompare(b))
  }, [allItems])

  const items = useMemo(() => {
    const term = search.trim().toLowerCase()
    return allItems.filter((item) => {
      if (activeCategory !== 'all' && item.tag !== activeCategory) return false
      if (!term) return true
      return (
        item.title?.toLowerCase().includes(term) ||
        item.excerpt?.toLowerCase().includes(term) ||
        item.tag?.toLowerCase().includes(term)
      )
    })
  }, [allItems, search, activeCategory])

  return (
    <section className="news">
      <div className="container">
        <div className="news__filters">
          <div className="news__search-wrap">
            <svg className="news__search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              className="news__search"
              placeholder={ui.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={ui.searchPlaceholder}
            />
          </div>

          {categories.length > 0 && (
            <div className="news__categories">
              <button
                type="button"
                className={`news__category ${activeCategory === 'all' ? 'news__category--active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                {ui.allCategories}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`news__category ${activeCategory === category ? 'news__category--active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="news__empty">{ui.noResults}</p>
        ) : (
          <div className="news__grid">
            {items.map((item) => (
              <article key={item.slug} id={item.slug} className="news-card">
                <a href={`#/blog/${item.slug}`} className="news-card__link">
                  <div className="news-card__thumb">
                    {item.image ? (
                      <img
                        className="news-card__image"
                        src={item.image}
                        alt={item.title}
                        style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                      />
                    ) : (
                      <Illustration />
                    )}
                  </div>
                  <div className="news-card__body">
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    {item.tag && (
                      <span className="news-card__pill">{item.tag}</span>
                    )}
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default News
