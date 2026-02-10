import { useState, useEffect } from 'react'
import { currencyService } from '../services/currencies.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useCurrencies = () => {
    const { t } = useTranslation()
    const [currencies, setCurrencies] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCurrencies()
    }, [])

    const fetchCurrencies = async () => {
        setLoading(true)
        try {
            const res = await currencyService.getAll()
            setCurrencies(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createCurrency = async (data: any) => {
        try {
            await currencyService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchCurrencies()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateCurrency = async (id: number, data: any) => {
        try {
            await currencyService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchCurrencies()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteCurrency = async (id: number) => {
        try {
            await currencyService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchCurrencies()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    const assignRate = async (id: number, data: any) => {
        try {
            await currencyService.assignRate(id, data)
            Swal.fire(t('success'), t('assign.success'), 'success')
            fetchCurrencies()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('assign.error'), 'error')
        }
    }

    return {
        currencies,
        loading,
        createCurrency,
        updateCurrency,
        deleteCurrency,
        assignRate,
    }
}