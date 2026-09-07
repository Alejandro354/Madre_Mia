import Home from './pages/Home.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Historia from './pages/Historia.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Admin from './pages/Admin.jsx'
import PracticaYa from './pages/practicaya/PracticaYa.jsx'
import ScrollFab from './components/ui/ScrollFab.jsx'
import { useHashRoute } from './hooks/useHashRoute.js'

function App() {
  const path = useHashRoute()

  const page = (() => {
    if (path.startsWith('/practicaya')) {
      return <PracticaYa path={path} />
    }

    if (path.startsWith('/admin')) {
      return <Admin />
    }

    if (path.startsWith('/nosotros')) {
      return <Nosotros />
    }

    if (path.startsWith('/historia')) {
      return <Historia />
    }

    if (path.startsWith('/blog/')) {
      return <BlogPost slug={path.slice('/blog/'.length)} />
    }

    if (path.startsWith('/blog')) {
      return <Blog />
    }

    return <Home />
  })()

  return (
    <>
      {page}
      <ScrollFab />
    </>
  )
}

export default App
