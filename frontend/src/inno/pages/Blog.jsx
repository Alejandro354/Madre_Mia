import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import BlogHero from '../components/sections/BlogHero.jsx'
import News from '../components/sections/News.jsx'

function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <BlogHero />
        <News />
      </main>
      <Footer />
    </>
  )
}

export default Blog
