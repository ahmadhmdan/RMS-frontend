import { useState, useEffect } from 'react'
import { countryService } from '../services/Country.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useCountries = () => {
    const { t } = useTranslation()
    const [countries, setCountries] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCountries()
    }, [])

    const fetchCountries = async () => {
        setLoading(true)
        try {
            const res = await countryService.getAll()
            setCountries(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createCountry = async (data: any) => {
        try {
            await countryService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchCountries()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateCountry = async (id: number, data: any) => {
        try {
            await countryService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchCountries()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteCountry = async (id: number) => {
        try {
            await countryService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchCountries()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        countries,
        loading,
        createCountry,
        updateCountry,
        deleteCountry,
    }
}