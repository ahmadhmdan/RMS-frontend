import DataTable from '../../../core/components/DataTable'
import { useExpiryItems } from '../hooks/useExpiryItems'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'

interface ExpiryItem {
    item_id: number
    item_name: string
    unit_id: number
    unit_name: string
    quantity: number
    inventory_id: number | null
    inventory_name: string | null
    expiration_date: string
}

const ExpiryItems = () => {
    const { t } = useTranslation()
    const {
        data,
        loading,
        filters,
        setFilters,
        inventories,
        getFullData,
    } = useExpiryItems()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() // Adjust locale if needed
    }

    const columns = [
        {
            key: 'item_id',
            header: 'item_id',
            render: (item: ExpiryItem) => item.item_id || '—',
        },
        {
            key: 'item_name',
            header: t('item_name'),
            render: (item: ExpiryItem) => (
                <span className="fw-bold">{item.item_name}</span>
            ),
        },
        {
            key: 'inventory_name',
            header: t('inventory'),
            render: (item: ExpiryItem) => item.inventory_name || t('-'),
        },
        {
            key: 'quantity',
            header: t('quantity'),
            render: (item: ExpiryItem) => (
                <span className="badge badge-light-warning">
                    {item.quantity} {item.unit_name}
                </span>
            ),
        },
        {
            key: 'expiration_date',
            header: t('expiration_date'),
            render: (item: ExpiryItem) => (
                <span className="badge badge-light-danger">
                    {formatDate(item.expiration_date)}
                </span>
            ),
        },
    ]

    const handleExport = async () => {
        const fullData = await getFullData()
        const exportData = fullData.map((item: ExpiryItem) => ({
            [t('item_id')]: item.item_id,
            [t('item_name')]: item.item_name,
            [t('inventory')]: item.inventory_name || t('all_inventories'),
            [t('quantity')]: `${item.quantity} ${item.unit_name}`,
            [t('expiration_date')]: formatDate(item.expiration_date),
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Expiry Report')
        XLSX.writeFile(wb, `Expiry_Items_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_inventory')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.inventory_id}
                    onChange={(e) => setFilters({ inventory_id: e.target.value })}
                >
                    <option value="">{t('all_inventories')}</option>
                    {inventories.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                            {inv.name}
                        </option>
                    ))}
                </select>
            </div>

            {filters.inventory_id && (
                <div className="col-md-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({ inventory_id: '' })}
                    >
                        {t('reset')}
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div>
            <DataTable
                columns={columns}
                data={data}
                title={t('expiry_items_report')}
                onCreate={() => { }}
                onEdit={() => { }}
                onDelete={() => { }}
                showCreate={false}
                showEdit={false}
                showView={false}
                showDelete={false}
                showAction={false}
                showId={false}
                filters={filtersUI}
                onExport={handleExport}
                loading={loading}
            />
        </div>
    )
}

export default ExpiryItems