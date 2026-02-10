import { useNavigate } from 'react-router-dom'
import DataTable from '../../../core/components/DataTable'
import { useTranslation } from 'react-i18next'
import { useWasteInvoices } from '../hooks/useWasteInvoices'
import { formatDate } from '../../../core/utils/formatDate'
import { ROUTES } from '../../../core/utils/constants'

const WasteInvoices = () => {
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
    } = useWasteInvoices()

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
        {
            key: 'invoice_description',
            header: t('description'),
            render: (item: any) => item.invoice_description || '—',
        },
    ]

    const handleView = (invoice: any) => {
        navigate(`${ROUTES.WASTE_INVOICE_DETAILS}/${invoice.id}`)
    }

    const filtersUI = (
        <div className="row">
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

            {(filters.date_from || filters.date_to) && (
                <div className="col-md-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({
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
            title={t('waste_invoices')}
            onCreate={() => navigate(ROUTES.CREATE_WASTE_INVOICE)}
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

export default WasteInvoices