import { useState, useEffect } from 'react'
import { transferInvoiceService } from '../services/transfer-invoices.service'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

export const useTransferInvoice = () => {
    const { t } = useTranslation()
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
    })

    useEffect(() => {
        setPage(1)
    }, [filters])

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const res = await transferInvoiceService.getAll(page, pageSize, filters)
            setInvoices(res.data.data)
            setTotal(res.data.meta.total)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [page, filters])

    const deleteInvoice = async (id: number) => {
        try {
            await transferInvoiceService.delete(id)
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
    }
}