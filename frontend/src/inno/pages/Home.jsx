import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import Services from '../components/sections/Services.jsx'
import Featured from '../components/sections/Featured.jsx'

function Home() {
  return (
    <>
      <Navbar />
      <main id="inicio">
        <Featured />
        <Services />
      </main>
      <Footer />
    </>
  )
}

export default Home
