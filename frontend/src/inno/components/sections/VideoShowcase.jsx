import { useRef, useState } from 'react'
import SectionHeader from '../ui/SectionHeader.jsx'
import { useContent } from '../../data/useContent.js'
import './VideoShowcase.css'

export function VideoCard({ item, ui }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className={`video-card ${item.video ? '' : 'video-card--soon'}`}>
      <div className="video-card__media-wrap">
        {item.video ? (
          <video
            ref={videoRef}
            className="video-card__media"
            src={item.video}
            poster={item.poster}
            playsInline
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <img className="video-card__media" src={item.poster} alt="" />
        )}

        {item.video && (
          <button
            type="button"
            className={`video-card__play ${isPlaying ? 'video-card__play--hidden' : ''}`}
            aria-label={isPlaying ? ui.pauseVideo : ui.playVideo}
            onClick={togglePlay}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M8 5v14l11-7-11-7Z" />
            </svg>
          </button>
        )}
      </div>

      <div className="video-card__caption">
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
      </div>
    </div>
  )
}

function VideoShowcase() {
  const { videoShowcase, ui } = useContent()

  return (
    <section className="video-showcase">
      <div className="container">
        <SectionHeader eyebrow={videoShowcase.eyebrow} title={videoShowcase.title} align="center" />

        <div className="video-showcase__grid">
          {videoShowcase.items.map((item, i) => (
            <VideoCard key={i} item={item} ui={ui} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default VideoShowcase
