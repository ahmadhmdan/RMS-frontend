import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import AppRoutes from './routes/AppRoutes'
import i18n from './i18n'
import { initMetronic } from './utils/metronic'
import { availableLanguages } from './i18n'

const MetronicInit = () => {
  const { pathname } = useLocation()
  const lang = i18n.language as 'en' | 'ar'

  useEffect(() => {
    // Wait for DOM + React render
    const timer = setTimeout(() => {
      initMetronic(lang)
      if (window.KTComponents?.reinitialization) {
        window.KTComponents.reinitialization()
      }

      const asideEl = document.getElementById('kt_aside')
      if (asideEl && window.KTDrawer) {
        const existing = window.KTDrawer.getInstance(asideEl)
        if (existing?.destroy) existing.destroy()
        new window.KTDrawer(asideEl, {
          overlay: true,
          toggleBy: '#kt_aside_mobile_toggle',
          width: '250px'
        })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname, lang])

  return null
}

function App() {
  useEffect(() => {
    const onLangChange = () => {
      document.documentElement.dir = i18n.dir()
      document.documentElement.lang = i18n.language
    }
    onLangChange()
    i18n.on('languageChanged', onLangChange)
    return () => i18n.off('languageChanged', onLangChange)
  }, [])

  useEffect(() => {
    if (!availableLanguages.includes(i18n.language as 'en' | 'ar')) {
      i18n.changeLanguage(availableLanguages[0])
    }
  }, [])

  return (
    <AppProvider>
      <BrowserRouter>
        <MetronicInit />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App