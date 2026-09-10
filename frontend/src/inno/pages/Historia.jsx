import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import PageHeader from '../components/sections/PageHeader.jsx'
import AboutHistory from '../components/sections/AboutHistory.jsx'
import VideoShowcase from '../components/sections/VideoShowcase.jsx'
import AndresVideo from '../components/sections/AndresVideo.jsx'
import { useContent } from '../data/useContent.js'

function Historia() {
  const { historyPage } = useContent()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <VideoShowcase />
        <PageHeader
          titleLines={historyPage.titleLines}
          tagline={historyPage.tagline}
        />
        <AboutHistory />
        <AndresVideo />
      </main>
      <Footer />
    </>
  )
}

export default Historia
