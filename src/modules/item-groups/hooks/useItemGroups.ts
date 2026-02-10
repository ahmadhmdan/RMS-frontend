import { useState, useEffect } from 'react'
import { itemGroupService } from '../services/ItemGroups.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useItemGroups = () => {
    const { t } = useTranslation()
    const [itemGroups, setItemGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchItemGroups()
    }, [])

    const fetchItemGroups = async () => {
        setLoading(true)
        try {
            const res = await itemGroupService.getAll()
            setItemGroups(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createItemGroup = async (data: any) => {
        try {
            await itemGroupService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchItemGroups()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateItemGroup = async (id: number, data: any) => {
        try {
            await itemGroupService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchItemGroups()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteItemGroup = async (id: number) => {
        try {
            await itemGroupService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchItemGroups()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        itemGroups,
        loading,
        createItemGroup,
        updateItemGroup,
        deleteItemGroup,
    }
}