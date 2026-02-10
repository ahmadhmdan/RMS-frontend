import { useState, useEffect } from 'react'
import { inventoryService } from '../services/Inventories.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useInventories = () => {
    const { t } = useTranslation()
    const [inventories, setInventories] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchInventories()
    }, [])

    const fetchInventories = async () => {
        setLoading(true)
        try {
            const res = await inventoryService.getAll()
            setInventories(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createInventory = async (data: any) => {
        try {
            await inventoryService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchInventories()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateInventory = async (id: number, data: any) => {
        try {
            await inventoryService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchInventories()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteInventory = async (id: number) => {
        try {
            await inventoryService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchInventories()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        inventories,
        loading,
        createInventory,
        updateInventory,
        deleteInventory,
    }
}