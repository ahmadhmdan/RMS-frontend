import { useState, useEffect } from 'react'
import { invoicesService } from '../services/SellInvoices.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { getSuppliers } from '../../../core/api/suppliers.api'
import { SUPPLIER_TYPE } from '../../../core/utils/constants'

export interface PurchaseInvoice {
    id: number
    invoice_no: number
    supplier_name: string
    inventory_name: string
    invoice_date: string
    total_price: string
    currency_name: string
    currency_symbol: string
    pay_method: string
    invoice_description: string
}

export const useSellInvoices = () => {
    const { t } = useTranslation()
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
    const [summary, setSummary] = useState<any>(null)
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
                const filtered = (res.data.data || []).filter((sup: any) =>
                    sup.type === SUPPLIER_TYPE.CUSTOMER || sup.type === SUPPLIER_TYPE.BOTH
                )
                setSuppliers(filtered)
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
            const res = await invoicesService.getAll(page, pageSize, filters)
            setInvoices(res.data.data)
            setSummary(res.data.summary || null)
            setTotal(res.data.meta?.total ?? res.data.pagination?.total ?? 0)
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
            await invoicesService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchInvoices()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        invoices,
        summary,
        loading,
        page,
        total,
        pageSize,
        setPage,
        refetch: fetchInvoices,
        deleteInvoice,
        filters,
        setFilters,
        suppliers,
    }
}