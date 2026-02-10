import { useState, useEffect } from 'react'
import { expiryItemsService } from '../services/ExpiryItems.service'
import { getInventories } from '../../../core/api/inventories.api'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'

export const useExpiryItems = () => {
    const { t } = useTranslation()
    const [data, setData] = useState<any[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState({
        inventory_id: '',
    })

    const [inventories, setInventories] = useState<any[]>([])

    useEffect(() => {
        fetchFiltersData()
    }, [])

    useEffect(() => {
        fetchReport()
    }, [filters])

    const fetchFiltersData = async () => {
        try {
            const invRes = await getInventories()
            setInventories(invRes.data.data || [])
        } catch (err) {
            console.error('Failed to load inventories for filters')
        }
    }

    const fetchReport = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filters.inventory_id) {
                params.inventory_id = Number(filters.inventory_id)
            }

            const res = await expiryItemsService.getReport(params)
            setData(res.data.data.items || [])
            setTotalItems(res.data.data.total_items || 0)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
            setData([])
            setTotalItems(0)
        } finally {
            setLoading(false)
        }
    }

    const getFullData = async () => {
        try {
            const params: any = {}
            if (filters.inventory_id) {
                params.inventory_id = Number(filters.inventory_id)
            }
            const res = await expiryItemsService.getReport(params)
            return res.data.data.items || []
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
            return []
        }
    }

    const resetFilters = () => {
        setFilters({ inventory_id: '' })
    }

    return {
        data,
        totalItems,
        loading,
        filters,
        setFilters,
        inventories,
        refetch: fetchReport,
        resetFilters,
        getFullData,
    }
}