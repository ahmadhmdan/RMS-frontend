import { useState, useEffect } from 'react'
import { manufacturingInvoicesService } from '../services/manufacturing-invoices.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { getSuppliers } from '../../../core/api/suppliers.api'

export interface ManufacturingInvoice {
    id: number
    invoice_no: number
    inventory_name: string
    invoice_date: string
    manufactured_item_name: string
    manufactured_item_quantity: number
    manufactured_item_unit: string
    invoice_description: string
}

export const useManufacturingInvoices = () => {
    const { t } = useTranslation()
    const [invoices, setInvoices] = useState<ManufacturingInvoice[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    const [suppliers, setSuppliers] = useState<any[]>([])

    const [filters, setFilters] = useState({
        supplier_id: '',
        pay_method: '',
        date_from: '',
        date_to: '',
    })

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const res = await getSuppliers()
                setSuppliers(res.data.data || [])
            } catch { }
        }
        loadSuppliers()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [filters])

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const res = await manufacturingInvoicesService.getAll(page, pageSize, filters)
            setInvoices(res.data.data)
            setTotal(res.data.meta?.total ?? 0)
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message ?? t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [page, filters])

    const deleteInvoice = async (id: number) => {
        try {
            await manufacturingInvoicesService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchInvoices()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        invoices,
        loading,
        page,
        total,
        pageSize,
        setPage,
        fetchInvoices,
        deleteInvoice,
        filters,
        setFilters,
        suppliers,
    }
}