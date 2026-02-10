import { useState, useEffect } from 'react'
import { minimumQuantityService } from '../services/MinimumQuantity.service'
import { getInventories } from '../../../core/api/inventories.api'
import { getCategories } from '../../../core/api/categories.api'
import { getItemGroups } from '../../../core/api/item-groups.api'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'

interface Category {
    id: number
    name: string
}

interface ItemGroup {
    id: number
    name: string
}

export const useMinimumQuantity = () => {
    const { t } = useTranslation()
    const [data, setData] = useState<any[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState({
        inventory_id: '',
        category_id: '',
        item_group_id: '',
    })

    const [inventories, setInventories] = useState<any[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [itemGroups, setItemGroups] = useState<ItemGroup[]>([])

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
            const catRes = await getCategories()
            setCategories(catRes.data.data || [])
            const igRes = await getItemGroups()
            setItemGroups(igRes.data.data || [])
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
            if (filters.category_id) {
                params.category_id = Number(filters.category_id)
            }
            if (filters.item_group_id) {
                params.item_group_id = Number(filters.item_group_id)
            }

            const res = await minimumQuantityService.getReport(params)
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
            if (filters.category_id) {
                params.category_id = Number(filters.category_id)
            }
            if (filters.item_group_id) {
                params.item_group_id = Number(filters.item_group_id)
            }
            const res = await minimumQuantityService.getReport(params)
            return res.data.data.items || []
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
            return []
        }
    }

    const resetFilters = () => {
        setFilters({ inventory_id: '', category_id: '', item_group_id: '' })
    }

    return {
        data,
        totalItems,
        loading,
        filters,
        setFilters,
        inventories,
        categories,
        itemGroups,
        refetch: fetchReport,
        resetFilters,
        getFullData,
    }
}