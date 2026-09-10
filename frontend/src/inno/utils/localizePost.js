function localizeParagraph(paragraph, translated) {
  if (!translated) return paragraph
  const enText = typeof translated === 'string' ? translated : translated.text
  if (!enText) return paragraph
  const enHeading = typeof translated === 'object' ? translated.heading : undefined

  if (typeof paragraph === 'string') {
    return enHeading ? { text: enText, heading: enHeading } : enText
  }
  return { ...paragraph, text: enText, heading: enHeading || paragraph.heading }
}

// Los posts dinámicos del blog guardan el español como versión principal y
// los campos *En como traducción opcional. Esto arma la versión a mostrar
// según el idioma activo, cayendo de vuelta al español donde falte texto.
export function localizePost(post, language) {
  if (!post || language !== 'en') return post

  const contentEn = post.contentEn
  const content = Array.isArray(contentEn) && contentEn.length && Array.isArray(post.content)
    ? post.content.map((paragraph, i) => localizeParagraph(paragraph, contentEn[i]))
    : post.content

  return {
    ...post,
    title: post.titleEn || post.title,
    excerpt: post.excerptEn || post.excerpt,
    tag: post.tagEn || post.tag,
    quote: post.quoteEn || post.quote,
    content,
  }
}

export function localizePosts(posts, language) {
  return posts.map((post) => localizePost(post, language))
}
