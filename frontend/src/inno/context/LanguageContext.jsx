import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext(null)

function getInitialLanguage() {
  try {
    const stored = window.localStorage.getItem('cdn-language')
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    // localStorage unavailable — fall back to default
  }
  return 'es'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem('cdn-language', language)
    } catch {
      // ignore write failures (private browsing, etc.)
    }
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
