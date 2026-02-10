import { useState, useEffect } from 'react'
import { cityService } from '../services/City.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useCities = () => {
    const { t } = useTranslation()
    const [cities, setCities] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCities()
    }, [])

    const fetchCities = async () => {
        setLoading(true)
        try {
            const res = await cityService.getAll()
            setCities(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createCity = async (data: any) => {
        try {
            await cityService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchCities()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateCity = async (id: number, data: any) => {
        try {
            await cityService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchCities()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteCity = async (id: number) => {
        try {
            await cityService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchCities()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        cities,
        loading,
        createCity,
        updateCity,
        deleteCity,
    }
}