import { useState, useEffect } from 'react'
import { categoryService } from '../services/category.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useCategories = () => {
    const { t } = useTranslation()
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await categoryService.getAll()
            setCategories(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createCategory = async (data: any) => {
        try {
            await categoryService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchCategories()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateCategory = async (id: number, data: any) => {
        try {
            await categoryService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchCategories()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteCategory = async (id: number) => {
        try {
            await categoryService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchCategories()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('delete.error'), 'error')
        }
    }

    return {
        categories,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
    }
}