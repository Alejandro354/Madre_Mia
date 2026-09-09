import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import PageHeader from '../components/sections/PageHeader.jsx'
import MissionVision from '../components/sections/MissionVision.jsx'
import { useContent } from '../data/useContent.js'
import monicaImg from '../assets/MonicaSanin.jpeg'

function Nosotros() {
  const { aboutPage } = useContent()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          titleLines={aboutPage.titleLines}
          tagline={aboutPage.tagline}
          description={aboutPage.description}
          image={monicaImg}
          imageAlt="Mónica Sanín"
        />
        <MissionVision />
      </main>
      <Footer />
    </>
  )
}

export default Nosotros
