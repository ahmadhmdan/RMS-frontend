import { useState, useEffect } from 'react'
import { itemMovementReportService } from '../services/itemMovementReport.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { getCategories } from '../../../core/api/categories.api'
import { getItemGroups } from '../../../core/api/item-groups.api'

export const useItemMovementReport = () => {
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
        item_group_id: '',
        date_from: '',
        date_to: '',
        page: 1,
        per_page: 10,
    })

    const [categories, setCategories] = useState<any[]>([])
    const [itemGroups, setItemGroups] = useState<any[]>([])

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [catRes, groupRes] = await Promise.all([
                    getCategories(),
                    getItemGroups(),
                ])
                setCategories(catRes.data.data || [])
                setItemGroups(groupRes.data.data || [])
            } catch (err) {
                console.error('Failed to load filters')
            }
        }
        fetchFiltersData()
    }, [])

    useEffect(() => {
        fetchReport()
    }, [filters])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const res = await itemMovementReportService.getAll(filters.page, filters.per_page, {
                item_name: filters.item_name || undefined,
                category_id: filters.category_id || undefined,
                item_group_id: filters.item_group_id || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
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

    const getFullData = async () => {
        try {
            const res = await itemMovementReportService.getAll(1, pagination.total || 10000, {
                item_name: filters.item_name || undefined,
                category_id: filters.category_id || undefined,
                item_group_id: filters.item_group_id || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
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

    return {
        data,
        pagination,
        loading,
        filters,
        setFilters,
        categories,
        itemGroups,
        handlePageChange,
        handlePageSizeChange,
        refetch: fetchReport,
        getFullData,
    }
}