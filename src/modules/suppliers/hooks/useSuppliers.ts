import { useState, useEffect } from 'react'
import { supplierService } from '../services/suppliers.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

export const useSuppliers = (filters: { search_name: string; type: string }) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSuppliers()
    }, [filters])

    const invalidateInvoiceCache = () => {
        queryClient.invalidateQueries({
            queryKey: ['invoiceData'],
            exact: false,
        })
    }

    const fetchSuppliers = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filters.search_name) params.name = filters.search_name
            if (filters.type) params.type = filters.type
            const res = await supplierService.getAll(params)
            setSuppliers(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const createSupplier = async (data: any) => {
        try {
            await supplierService.create(data)
            Swal.fire(t('success'), t('create.success'), 'success')
            fetchSuppliers()
            invalidateInvoiceCache()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error')
        }
    }

    const updateSupplier = async (id: number, data: any) => {
        try {
            await supplierService.update(id, data)
            Swal.fire(t('success'), t('update.success'), 'success')
            fetchSuppliers()
            invalidateInvoiceCache()
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error')
        }
    }

    const deleteSupplier = async (id: number) => {
        try {
            await supplierService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchSuppliers()
            invalidateInvoiceCache()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        suppliers,
        loading,
        createSupplier,
        updateSupplier,
        deleteSupplier,
    }
}