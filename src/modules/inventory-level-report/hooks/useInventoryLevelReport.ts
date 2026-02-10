import { useState, useEffect } from 'react'
import { inventoryLevelReportService } from '../services/InventoryLevelReport.service'
import { getCategories } from '../../../core/api/categories.api'
import { getInventories } from '../../../core/api/inventories.api'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'

export const useInventoryLevelReport = () => {
    const { t } = useTranslation()
    const [data, setData] = useState<any[]>([])
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    })
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState({
        item_name: '',
        category_id: '',
        inventory_id: '',
        page: 1,
        per_page: 10,
    })

    const [categories, setCategories] = useState<any[]>([])
    const [inventories, setInventories] = useState<any[]>([])

    useEffect(() => {
        fetchFiltersData()
    }, [])

    useEffect(() => {
        fetchReport()
    }, [filters])

    const fetchFiltersData = async () => {
        try {
            const [catRes, invRes] = await Promise.all([
                getCategories(),
                getInventories(),
            ])
            setCategories(catRes.data.data || [])
            setInventories(invRes.data.data || [])
        } catch (err) {
            console.error('Failed to load filters')
        }
    }

    const fetchReport = async () => {
        setLoading(true)
        try {
            const res = await inventoryLevelReportService.getReport({
                page: filters.page,
                per_page: filters.per_page,
                item_name: filters.item_name || undefined,
                category_id: filters.category_id ? Number(filters.category_id) : undefined,
                inventory_id: filters.inventory_id ? Number(filters.inventory_id) : undefined,
            })

            setData(res.data.data || [])
            setPagination(res.data.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
            })
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const manufactureNegative = async (inventory_id?: number) => {
        try {
            await inventoryLevelReportService.manufactureNegativeItems(inventory_id)
            Swal.fire(t('success'), t('manufacture.success'), 'success')
            fetchReport()
        } catch (error) {
            Swal.fire(t('error'), t('manufacture.error'), 'error')
        }
    }

    const getFullData = async () => {
        try {
            const res = await inventoryLevelReportService.getReport({
                page: 1,
                per_page: pagination.total || 10000,
                item_name: filters.item_name || undefined,
                category_id: filters.category_id ? Number(filters.category_id) : undefined,
                inventory_id: filters.inventory_id ? Number(filters.inventory_id) : undefined,
            })
            return res.data.data || []
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
            return []
        }
    }

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }))
    }

    const handlePageSizeChange = (size: number) => {
        const newSize = size < 0 ? (pagination.total || 10000) : size
        setFilters(prev => ({ ...prev, per_page: newSize, page: 1 }))
    }

    const resetFilters = () => {
        setFilters({
            item_name: '',
            category_id: '',
            inventory_id: '',
            page: 1,
            per_page: 10,
        })
    }

    return {
        data,
        pagination,
        loading,
        filters,
        setFilters,
        categories,
        inventories,
        handlePageChange,
        handlePageSizeChange,
        refetch: fetchReport,
        resetFilters,
        getFullData,
        manufactureNegative,
    }
}