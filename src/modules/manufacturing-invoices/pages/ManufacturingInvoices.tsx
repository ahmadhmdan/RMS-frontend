import { useNavigate } from 'react-router-dom'
import DataTable from '../../../core/components/DataTable'
import { useManufacturingInvoices } from '../hooks/useManufacturingInvoices'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../core/utils/formatDate'
import { ROUTES } from '../../../core/utils/constants'
//import { PAYMENT_METHOD } from '../../../core/utils/constants'

const ManufacturingInvoices = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const {
        invoices,
        loading,
        page,
        total,
        pageSize,
        setPage,
        deleteInvoice,
        filters,
        setFilters,
        // suppliers,
    } = useManufacturingInvoices()

    const columns = [
        {
            key: 'invoice_no',
            header: t('invoice_no'),
            render: (item: any) => <span className="fw-bold">{item.invoice_no}#</span>,
        },
        { key: 'inventory_name', header: t('inventory_name') },
        {
            key: 'invoice_date',
            header: t('invoice_date'),
            render: (item: any) => formatDate(item.invoice_date),
        },
        { key: 'manufactured_item_name', header: t('manufactured_item_name') },
        { key: 'manufactured_item_quantity', header: t('quantity') },
        { key: 'manufactured_item_unit', header: t('manufactured_item_unit') },
        {
            key: 'invoice_description',
            header: t('description'),
            render: (item: any) => item.invoice_description || '—',
        },
    ]

    const handleView = (invoice: any) => {
        navigate(`${ROUTES.MANUFACTURING_INVOICE_DETAILS}/${invoice.id}`)
    }

    const filtersUI = (
        <div className="row">
            {/* <div className="col-md-12 fv-row mb-4">
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
            </div> */}

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
        <DataTable
            columns={columns}
            data={invoices}
            title={t('manufacturing_invoices')}
            onCreate={() => navigate(ROUTES.CREATE_MANUFACTURING_INVOICE)}
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
    )
}

export default ManufacturingInvoices