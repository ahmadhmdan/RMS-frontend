import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { consumptionInvoicesService } from '../services/consumption-invoices.service'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../core/hooks/useTheme';
import { formatDate } from '../../../core/utils/formatDate'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';
import '../../invoices/components/CreateInvoice.css';

interface InvoiceItem {
    id: number
    item: { name: string }
    unit: { name: string }
    inventory: { name: string }
    quantity: string
    unit_price: string
    total_price: string
    unit_currency: {
        id: number | null
        name: string
        symbol: string
        exchange_rate: number
    }
}

interface InvoiceData {
    id: number
    invoice_no: number
    invoice_date: string
    inventory: { name: string }
    invoice_description: string | null
    invoice_details: InvoiceItem[]
    total_price: string
    currency: {
        symbol: string
    }
    created_at: string
}

const formatCurrency = (value: string | number, symbol: string = '$'): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return `0.00 ${symbol}`
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`
}

const ViewConsumptionInvoice = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { mode } = useTheme();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return
            try {
                const res = await consumptionInvoicesService.getById(Number(id))
                setInvoice(res.data.data)
            } catch (err: any) {
                Swal.fire(t('error'), err.response?.data?.message || t('failed_to_load_invoice'), 'error')
                navigate(-1)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoice()
    }, [id, navigate, t])

    const exportToExcel = () => {
        if (!invoice) return;

        const worksheetData: (string | number)[][] = [
            [t('invoice_no'), invoice.invoice_no],
            [t('invoice_date'), formatDate(invoice.invoice_date)],
            [t('inventory'), invoice.inventory.name],
            [t('description'), invoice.invoice_description || ''],
            [],
            ['', t('item'), t('unit'), t('quantity'), t('unit_price'), t('total'), t('inventory')]
        ];

        invoice.invoice_details.forEach((item, index) => {
            worksheetData.push([
                index + 1,
                item.item.name,
                item.unit.name,
                parseFloat(item.quantity).toFixed(3),
                formatCurrency(item.unit_price, item.unit_currency?.symbol || '$'),
                formatCurrency(item.total_price, item.unit_currency?.symbol || '$'),
                item.inventory.name
            ]);
        });

        const totalQty = invoice.invoice_details.reduce((sum, i) => sum + parseFloat(i.quantity || '0'), 0).toFixed(2)
        worksheetData.push([], [t('total_quantity'), '', '', totalQty, '', '', '']);

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('consumption_invoice'));
        XLSX.writeFile(workbook, `Consumption_Invoice_${invoice.invoice_no}.xlsx`);
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-500px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="text-center py-20">
                <h3>{t('invoice_not_found')}</h3>
                <button className="btn btn-primary mt-4" onClick={() => navigate(-1)}>{t('back')}</button>
            </div>
        )
    }

    const totalQuantity = invoice.invoice_details.reduce((sum, item) => sum + parseFloat(item.quantity || '0'), 0).toFixed(2)
    const fallbackSymbol = invoice.currency?.symbol || '$'

    return (
        <div className="card">
            <div className="card-header border-0 pt-8 pb-6">
                <div className="card-title">
                    <h2 className="fw-bolder">
                        {t('consumption_invoice')} #{invoice.invoice_no}
                    </h2>
                </div>
                <div className="card-toolbar">
                    <div className="btn-group me-3">
                        <button type="button" className="btn btn-sm btn-bg-light dropdown-toggle" data-bs-toggle="dropdown">
                            <i className="ki-solid ki-file-right fs-2"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={exportToExcel}>{t('export_to_excel')}</button></li>
                            <li><button className="dropdown-item" onClick={handlePrint}>{t('print')}</button></li>
                        </ul>
                    </div>
                    <button className="btn btn-sm btn-light" onClick={() => navigate(-1)}>
                        <i className="ki-outline ki-arrow-left fs-2"></i>
                    </button>
                </div>
            </div>

            <div className="card-body p-10">
                <div className="row g-8 mb-10">
                    <div className="col-lg-6">
                        <div className="bg-light rounded-3 p-6 h-100">
                            <h4 className="fw-bold text-primary mb-6">{t('invoice_info')}</h4>
                            <div className="d-flex flex-column gap-4 fs-5">
                                <div><span className="text-gray-600 me-3">{t('invoice_date')}:</span><span className="fw-bold">{formatDate(invoice.invoice_date)}</span></div>
                                <div><span className="text-gray-600 me-3">{t('inventory')}:</span><span className="fw-bold">{invoice.inventory.name}</span></div>
                                {invoice.invoice_description && (
                                    <div><span className="text-gray-600 me-3">{t('description')}:</span><span className="fw-bold">{invoice.invoice_description}</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="bg-light-warning rounded-3 p-6 h-100">
                            <div className="text-center">
                                <h4 className="fw-bold text-warning mb-8">{t('total')}</h4>
                                <div className="d-flex align-items-baseline justify-content-center gap-2">
                                    <span className="fs-2x fw-bolder text-warning">{totalQuantity}</span>
                                    <span className="text-gray-600 fs-4 fw-medium">{t('units')}</span>
                                </div>
                                <div className="mt-6">
                                    <h5 className="fw-bold text-warning mb-2">{t('total_cost')}</h5>
                                    <div className="fs-2x fw-bolder text-warning">
                                        {formatCurrency(invoice.total_price, fallbackSymbol)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="separator separator-dashed my-10"></div>

                <h3 className="mb-7 fw-bold text-gray-800">{t('items')}</h3>

                <div className="table-responsive">
                    <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                        <thead>
                            <tr className="bg-light text-center text-gray-700 fw-bold fs-6">
                                <th style={{ width: '5%' }}></th>
                                <th style={{ width: '25%' }}>{t('item')}</th>
                                <th style={{ width: '12%' }}>{t('unit')}</th>
                                <th style={{ width: '12%' }}>{t('quantity')}</th>
                                <th style={{ width: '15%' }}>{t('unit_price')}</th>
                                <th style={{ width: '15%' }}>{t('total')}</th>
                                <th style={{ width: '16%' }}>{t('inventory')}</th>
                            </tr>
                        </thead>
                        <tbody className="fs-6">
                            {invoice.invoice_details.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-500">{t('no_items_found')}</td></tr>
                            ) : (
                                invoice.invoice_details.map((item, index) => {
                                    const symbol = item.unit_currency?.symbol || fallbackSymbol
                                    return (
                                        <tr key={item.id} className="hover-highlight">
                                            <td className="row-index" style={{ color: '#000000' }}>{index + 1}</td>
                                            <td className="ps-4" style={{ color: '#000000' }}>{item.item.name}</td>
                                            <td className="text-center" style={{ color: '#000000' }}>{item.unit.name}</td>
                                            <td className="text-center fw-bold" style={{ color: '#000000' }}>{parseFloat(item.quantity).toFixed(2)}</td>
                                            <td className="text-center" style={{ color: '#000000' }}>{formatCurrency(item.unit_price, symbol)}</td>
                                            <td className="text-center fw-bold" style={{ color: '#000000' }}>{formatCurrency(item.total_price, symbol)}</td>
                                            <td className="text-center" style={{ color: '#000000' }}>{item.inventory.name}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                        {invoice.invoice_details.length > 0 && (
                            <tfoot>
                                <tr className="bg-light fw-bold">
                                    <td colSpan={3} className="text-end pe-6">{t('total_quantity')}</td>
                                    <td className="text-center fs-5 text-warning p-3">{totalQuantity}</td>
                                    <td colSpan={1}></td>
                                    <td className="text-center fs-5 text-warning">{formatCurrency(invoice.total_price, fallbackSymbol)}</td>
                                    <td colSpan={1}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ViewConsumptionInvoice