import { useEffect, useMemo, useState } from 'react'
import Illustration from '../ui/Illustration.jsx'
import SmartLink from '../ui/SmartLink.jsx'
import { useContent } from '../../data/useContent.js'
import { useBlogPosts } from '../../hooks/useBlogPosts.js'
import './News.css'

const PAGE_SIZE = 5
const GRID_SIZE = 3

const TAG_PALETTE = [
  { bg: '#FFE2E5', text: '#E11D48' },
  { bg: '#DBEAFE', text: '#2563EB' },
  { bg: '#FCE7F3', text: '#DB2777' },
  { bg: '#EDE9FE', text: '#7C3AED' },
  { bg: '#D1FAE5', text: '#059669' },
  { bg: '#FEF3C7', text: '#B45309' },
]

function tagColor(tag = '') {
  let hash = 0
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0
  }
  return TAG_PALETTE[hash % TAG_PALETTE.length]
}

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

function NewsCardThumb({ item, color }) {
  return (
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
      {item.tag && (
        <span className="news-card__pill" style={{ background: color.bg, color: color.text }}>
          {item.tag}
        </span>
      )}
    </div>
  )
}

function NewsCardMeta({ item }) {
  if (!item.date) return null
  return (
    <div className="news-card__meta">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <span>{item.date}</span>
    </div>
  )
}

function NewsCard({ item, ui }) {
  const color = tagColor(item.tag)
  return (
    <article id={item.slug} className="news-card">
      <SmartLink href={`/blog/${item.slug}`} className="news-card__link">
        <NewsCardThumb item={item} color={color} />
        <div className="news-card__body">
          <NewsCardMeta item={item} />
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
          <span className="news-card__more">
            {ui.readMore}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </SmartLink>
    </article>
  )
}

function NewsCardWide({ item, ui, reverse }) {
  const color = tagColor(item.tag)
  return (
    <article id={item.slug} className={`news-card news-card--wide ${reverse ? 'news-card--wide-reverse' : ''}`}>
      <SmartLink href={`/blog/${item.slug}`} className="news-card__link news-card__link--wide">
        <NewsCardThumb item={item} color={color} />
        <div className="news-card__body news-card__body--wide">
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
          <div className="news-card__footer">
            <NewsCardMeta item={item} />
            <span className="news-card__more">
              {ui.readMore}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </SmartLink>
    </article>
  )
}

function News() {
  const { news, ui } = useContent()
  const { posts } = useBlogPosts()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [page, setPage] = useState(1)

  const allItems = useMemo(() => [...posts, ...news.items], [posts, news.items])
  const listItems = allItems.slice(1)

  const categories = useMemo(() => {
    const unique = [...new Set(allItems.map((item) => item.tag).filter(Boolean))]
    return unique.sort((a, b) => a.localeCompare(b))
  }, [allItems])

  const items = useMemo(() => {
    const term = search.trim().toLowerCase()
    return listItems.filter((item) => {
      if (activeCategory !== 'all' && item.tag !== activeCategory) return false
      if (!term) return true
      return (
        item.title?.toLowerCase().includes(term) ||
        item.excerpt?.toLowerCase().includes(term) ||
        item.tag?.toLowerCase().includes(term)
      )
    })
  }, [listItems, search, activeCategory])

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const gridItems = pageItems.slice(0, GRID_SIZE)
  const wideItems = pageItems.slice(GRID_SIZE)
  const pageList = buildPageList(currentPage, totalPages)

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
          <>
            <div className="news__grid">
              {gridItems.map((item) => (
                <NewsCard key={item.slug} item={item} ui={ui} />
              ))}
            </div>

            {wideItems.length > 0 && (
              <div className="news__wide-row">
                {wideItems.map((item, i) => (
                  <NewsCardWide key={item.slug} item={item} ui={ui} reverse={i === 1} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="news__pagination" aria-label="Paginación">
                <button
                  type="button"
                  className="news__page-arrow"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label={ui.prevPage}
                >
                  ‹
                </button>
                {pageList.map((p, i) => {
                  const prev = pageList[i - 1]
                  const showEllipsis = prev !== undefined && p - prev > 1
                  return (
                    <span key={p} className="news__page-item">
                      {showEllipsis && <span className="news__page-ellipsis">…</span>}
                      <button
                        type="button"
                        className={`news__page-number ${p === currentPage ? 'news__page-number--active' : ''}`}
                        onClick={() => setPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}
                <button
                  type="button"
                  className="news__page-arrow"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label={ui.nextPage}
                >
                  ›
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default News
