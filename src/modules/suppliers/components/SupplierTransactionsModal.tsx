import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from '../../../core/components/DataTable'
import { useTranslation } from 'react-i18next'
import { supplierService } from '../services/suppliers.service'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../core/utils/constants'
import { formatDate } from '../../../core/utils/formatDate'

const formatCurrency = (value: number | string, symbol: string = '$'): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `0.00 ${symbol}`;
    return `${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${symbol || ''}`.trim();
};

const SupplierTransactionsModal = ({ show, onHide, supplier }: { show: boolean; onHide: () => void; supplier: any | null }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (show && supplier) {
            fetchTransactions()
        }
    }, [show, supplier])

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const res = await supplierService.getInvoices(supplier.id)
            setTransactions(res.data.data)
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleView = (data: any) => {
        let route = ''
        switch (data.transaction_type_name) {
            case 'purchase':
                route = `${ROUTES.PURCHASE_INVOICE_DETAILS}/${data.id}`
                break
            case 'manufacturing':
                route = `${ROUTES.MANUFACTURING_INVOICE_DETAILS}/${data.id}`
                break
            case 'transfer':
                route = `${ROUTES.TRANSFER_INVOICE_DETAILS}/${data.id}`
                break
            case 'goods':
                route = `${ROUTES.GOODS_INVOICE_DETAILS}/${data.id}`
                break
            case 'sell':
                route = `${ROUTES.SELL_INVOICE_DETAILS}/${data.id}`
                break
            case 'waste':
                route = `${ROUTES.WASTE_INVOICE_DETAILS}/${data.id}`
                break
            case 'consumption':
                route = `${ROUTES.CONSUMPTION_INVOICE_DETAILS}/${data.id}`
                break
            case 'return':
                route = `${ROUTES.RETURN_INVOICE_DETAILS}/${data.id}`
                break
            default:
                return // or show error
        }
        onHide() // Close modal before navigate
        navigate(route)
    }

    const columns = [
        {
            key: 'invoice_no',
            header: 'invoice_no',
            render: (tx: any) => `#${tx.invoice_no}`,
        },
        {
            key: 'created_at',
            header: 'date',
            render: (tx: any) => formatDate(tx.created_at),
        },
        {
            key: 'transaction_type_name',
            header: 'transaction_type',
            render: (tx: any) => t(tx.transaction_type_name || 'unknown'),
        },
        {
            key: 'quantity',
            header: 'quantity',
            render: (tx: any) => {
                const qty = parseFloat(String(tx.quantity)).toFixed(0)
                const isIncrease = tx.affects_stock === 'increase'
                const sign = isIncrease ? '+' : '-'
                return (
                    <span className={isIncrease ? 'text-success' : 'text-danger'}>
                        {sign}{qty}
                    </span>
                )
            },
        },
        {
            key: 'total_price',
            header: 'total_price',
            render: (tx: any) => formatCurrency(tx.total_price),
        },
    ]

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('supplier_transactions')} - {supplier?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <DataTable
                    columns={columns}
                    data={transactions}
                    title={t('transactions')}
                    onCreate={() => { }}
                    onEdit={() => { }}
                    showCreate={false}
                    showEdit={false}
                    showDelete={false}
                    embedded={true}
                    onView={handleView}
                    showView={true}
                    showAction={true}
                    loading={loading}
                />
            </Modal.Body>
        </Modal>
    )
}

export default SupplierTransactionsModal