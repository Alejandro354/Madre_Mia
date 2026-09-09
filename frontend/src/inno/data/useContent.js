import { useLanguage } from '../context/LanguageContext.jsx'
import * as es from './content.es.js'
import * as en from './content.en.js'

const dictionaries = { es, en }

export function useContent() {
  const { language } = useLanguage()
  return dictionaries[language]
}
