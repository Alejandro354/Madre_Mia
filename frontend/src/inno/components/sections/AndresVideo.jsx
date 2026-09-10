import SectionHeader from '../ui/SectionHeader.jsx'
import { VideoCard } from './VideoShowcase.jsx'
import { useContent } from '../../data/useContent.js'
import './AndresVideo.css'

function AndresVideo() {
  const { andresVideo, ui } = useContent()

  return (
    <section className="andres-video">
      <div className="container">
        <SectionHeader eyebrow={andresVideo.eyebrow} title={andresVideo.sectionTitle} align="center" />

        <div className="andres-video__wrap">
          <VideoCard item={andresVideo} ui={ui} />
        </div>
      </div>
    </section>
  )
}

export default AndresVideo
