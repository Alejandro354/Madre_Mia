import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import './ScrollFab.css'

function ScrollFab() {
  const [visible, setVisible] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      setVisible(scrollY > 240)
      setAtBottom(maxScroll > 0 && scrollY >= maxScroll - 40)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      className={`scroll-fab ${visible ? 'scroll-fab--visible' : ''}`}
      onClick={handleClick}
      aria-label={atBottom ? 'Subir al inicio' : 'Bajar al final'}
    >
      <span className={`scroll-fab__icon ${atBottom ? 'scroll-fab__icon--up' : 'scroll-fab__icon--down'}`}>
        <Icon name="chevron-down" size={20} />
      </span>
    </button>
  )
}

export default ScrollFab
