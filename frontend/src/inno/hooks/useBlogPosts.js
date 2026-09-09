import { useCallback, useEffect, useState } from 'react'

export const BLOG_POST_CREATED_EVENT = 'cdn:blog-post-created'

export function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(BLOG_POST_CREATED_EVENT, refresh)
    return () => window.removeEventListener(BLOG_POST_CREATED_EVENT, refresh)
  }, [refresh])

  return { posts, loading, refresh }
}

export function notifyBlogPostCreated() {
  window.dispatchEvent(new CustomEvent(BLOG_POST_CREATED_EVENT))
}
