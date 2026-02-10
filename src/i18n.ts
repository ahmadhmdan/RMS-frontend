import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

export const availableLanguages = (import.meta.env.VITE_AVAILABLE_LANGUAGES?.split(',') ?? ['en', 'ar']) as ('en' | 'ar')[];

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: availableLanguages[0],
        supportedLngs: availableLanguages,
        debug: false,
        interpolation: { escapeValue: false },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    })

// Auto-switch RTL + dir
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = i18n.dir(lng)
    document.documentElement.lang = lng
    const isRtl = lng === 'ar'
    if (window.switchRtl) window.switchRtl(isRtl)
})

export default i18n