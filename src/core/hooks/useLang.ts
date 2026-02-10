import { useTranslation } from 'react-i18next'

export const useLang = () => {
    const { i18n } = useTranslation()
    const lang = i18n.language as 'en' | 'ar'

    const get = (obj: { en?: string; ar?: string } | string): string => {
        if (typeof obj === 'string') return obj
        return obj[lang] || obj.en || ''
    }

    return { lang, get }
}