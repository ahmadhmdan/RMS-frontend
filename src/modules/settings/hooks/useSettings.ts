import { useState, useEffect } from 'react'
import { settingsService } from '../services/settings.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useSettings = () => {
    const { t } = useTranslation()
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await settingsService.getAll()
            const settingsByCategory = res.data.data.settingsByCategory
            const allSettings = Object.values(settingsByCategory).flat()
            setSettings(allSettings)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (data: any) => {
        try {
            await settingsService.update(data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchSettings()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    return {
        settings,
        loading,
        updateSettings,
    }
}