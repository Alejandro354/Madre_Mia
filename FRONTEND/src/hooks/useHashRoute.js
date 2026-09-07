import { useEffect, useState } from 'react'

function getPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useHashRoute() {
  const [path, setPath] = useState(getPath())

  useEffect(() => {
    const onHashChange = () => setPath(getPath())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return path
}
