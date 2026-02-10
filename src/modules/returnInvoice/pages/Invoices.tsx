import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../../core/components/DataTable'
import { useInvoices } from '../hooks/useInvoices'
import { ROUTES } from '../../../core/utils/constants'
import { formatDate } from '../../../core/utils/formatDate'
import { PAYMENT_METHOD } from '../../../core/utils/constants'

const ReturnInvoices = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const {
        invoices,
        summary,
        loading,
        page,
        total,
        pageSize,
        setPage,
        deleteInvoice,
        filters,
        setFilters,
        suppliers,
    } = useInvoices()

    const columns = [
        {
            key: 'invoice_no',
            header: t('invoice_no'),
            render: (item: any) => <span className="fw-bold">{item.invoice_no}#</span>,
        },
        {
            key: 'supplier_name',
            header: t('supplier'),
            render: (item: any) => item.supplier_name || '—',
        },
        {
            key: 'inventory_name',
            header: t('inventory'),
        },
        {
            key: 'invoice_date',
            header: t('invoice_date'),
            render: (item: any) => formatDate(item.invoice_date),
        },
        {
            key: 'total_price',
            header: t('total_price'),
            render: (item: any) => (
                <span dir="ltr" className="d-inline-block">
                    {item.total_price} {item.currency_symbol}
                </span>
            ),
        },
        {
            key: 'pay_method',
            header: t('payment_method'),
            render: (item: any) => t(item.pay_method.toLowerCase()),
        },
        {
            key: 'invoice_description',
            header: t('description'),
            render: (item: any) => item.invoice_description || '—',
        },
    ]

    const handleView = (invoice: any) => {
        navigate(`${ROUTES.RETURN_INVOICE_DETAILS}/${invoice.id}`)
    }

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('supplier')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.supplier_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, supplier_id: e.target.value }))}
                >
                    <option value="">{t('all_suppliers')}</option>
                    {suppliers.map((sup: any) => (
                        <option key={sup.id} value={sup.id}>
                            {sup.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('payment_method')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.pay_method}
                    onChange={(e) => setFilters(prev => ({ ...prev, pay_method: e.target.value }))}
                >
                    <option value="">{t('all_methods')}</option>
                    <option value={PAYMENT_METHOD.CASH}>{t('cash')}</option>
                    <option value={PAYMENT_METHOD.CREDIT}>{t('credit')}</option>
                    <option value={PAYMENT_METHOD.BANK_TRANSFER}>{t('bank_transfer')}</option>
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('from_date')}</label>
                <input
                    type="date"
                    className="form-control form-control-solid"
                    value={filters.date_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('to_date')}</label>
                <input
                    type="date"
                    className="form-control form-control-solid"
                    value={filters.date_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                />
            </div>

            {(filters.supplier_id || filters.pay_method || filters.date_from || filters.date_to) && (
                <div className="col-md-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({
                            supplier_id: '',
                            pay_method: '',
                            date_from: '',
                            date_to: '',
                        })}
                    >
                        {t('reset')}
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div className="card">
            <div className="card-body p-5">
                {summary && (
                    <div className="row g-5 mb-5">
                        <div className="col-lg-6">
                            <div className="bg-light rounded-3 p-4 h-100">
                                <h4 className="fw-bold fs-3 text-primary mb-3">{t('summary')}</h4>
                                <div className="d-flex flex-column gap-2 fs-4">
                                    <div>
                                        <span className="text-gray-600 me-3">{t('total_invoices')}:</span>
                                        <span className="fw-bold">{summary.counts.total_invoices}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('total_invoice_details')}:</span>
                                        <span className="fw-bold">{summary.counts.total_invoice_details}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('suppliers')}:</span>
                                        <span className="fw-bold">{summary.counts.unique_suppliers}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('currencies_used')}:</span>
                                        <span className="fw-bold">{summary.counts.currencies_used}</span>
                                    </div>
                                    {Object.keys(summary.payment_methods).map((method) => (
                                        <div key={method}>
                                            <span className="text-gray-600 me-3"> {t('invoices')} {t(method.toLowerCase())}:</span>
                                            <span className="fw-bold">{summary.payment_methods[method].count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="bg-light-primary rounded-3 p-4 h-100">
                                <h4 className="fw-bold fs-3 text-primary mb-3">{t('totals')}</h4>
                                <div className="d-flex flex-column gap-2 fs-4">
                                    <div className="fw-bold mb-1">{t('totals_by_original_currency')}:</div>
                                    {summary.totals_by_original_currency.map((curr: any, idx: number) => (
                                        <div key={idx}>
                                            <span className="text-gray-600 me-3">{curr.currency_name} ({curr.currency_symbol}):</span>
                                            <span className="fw-bold">{curr.total_amount.toLocaleString()} ({curr.invoice_count} {t('invoices')})</span>
                                        </div>
                                    ))}
                                    <div className="separator my-2"></div>
                                    <div className="fw-bold mb-1">{t('totals_converted')}:</div>
                                    {summary.totals_converted_to_each_currency.map((curr: any, idx: number) => (
                                        <div key={idx}>
                                            <span className="text-gray-600 me-3">{curr.currency_name} ({curr.currency_symbol}):</span>
                                            <span className="fw-bold">{curr.total_amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="separator my-2"></div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('date_range')}:</span>
                                        <span className="fw-bold">
                                            {formatDate(summary.date_range.from)} → {formatDate(summary.date_range.to)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="separator separator-dashed my-10"></div>
        <DataTable
            columns={columns}
            data={invoices}
            title={t('return_invoices')}
            onCreate={() => navigate(ROUTES.CREATE_RETURN_INVOICES)}
            showCreate={true}
            onEdit={() => { }}
            showEdit={false}
            onDelete={deleteInvoice}
            onView={handleView}
            showView={true}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            loading={loading}
            filters={filtersUI}
        />
        </div>
    </div>
    )
}

export default ReturnInvoices