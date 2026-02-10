import DataTable from '../../../core/components/DataTable'
import { useMinimumQuantity } from '../hooks/useMinimumQuantity'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'

interface MinimumQuantityItem {
    item_id: number
    item_name: string
    unit_id: number
    unit_name: string
    quantity: number
    limit: number
    limit_unit_id: number
    limit_unit_name: string
    inventory_id: number | null
    inventory_name: string | null
}

const MinimumQuantity = () => {
    const { t } = useTranslation()
    const {
        data,
        loading,
        filters,
        setFilters,
        inventories,
        categories,
        itemGroups,
        getFullData,
    } = useMinimumQuantity()

    const columns = [
        {
            key: 'item_id',
            header: 'item_id',
            render: (item: MinimumQuantityItem) => item.item_id || '—',
        },
        {
            key: 'item_name',
            header: t('item_name'),
            render: (item: MinimumQuantityItem) => (
                <span className="fw-bold">{item.item_name}</span>
            ),
        },
        {
            key: 'inventory_name',
            header: t('inventory'),
            render: (item: MinimumQuantityItem) => item.inventory_name || t('-'),
        },
        {
            key: 'quantity',
            header: t('current_quantity'),
            render: (item: MinimumQuantityItem) => (
                <span className="badge badge-light-danger">
                    {item.quantity} {item.unit_name}
                </span>
            ),
        },
        {
            key: 'limit',
            header: t('minimum_limit'),
            render: (item: MinimumQuantityItem) => (
                <span className="badge badge-light-warning">
                    {item.limit} {item.limit_unit_name}
                </span>
            ),
        },
    ]

    const handleExport = async () => {
        const fullData = await getFullData()
        const exportData = fullData.map((item: MinimumQuantityItem) => ({
            [t('item_id')]: item.item_id,
            [t('item_name')]: item.item_name,
            [t('inventory')]: item.inventory_name || t('all_inventories'),
            [t('current_quantity')]: `${item.quantity} ${item.unit_name}`,
            [t('minimum_limit')]: `${item.limit} ${item.limit_unit_name}`,
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Minimum Quantity Report')
        XLSX.writeFile(wb, `Minimum_Quantity_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_inventory')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.inventory_id}
                    onChange={(e) => setFilters({ ...filters, inventory_id: e.target.value })}
                >
                    <option value="">{t('all_inventories')}</option>
                    {inventories.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                            {inv.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('category')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                >
                    <option value="">{t('all_categories')}</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('item_group')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.item_group_id}
                    onChange={(e) => setFilters({ ...filters, item_group_id: e.target.value })}
                >
                    <option value="">{t('all_item_groups')}</option>
                    {itemGroups.map((ig) => (
                        <option key={ig.id} value={ig.id}>
                            {ig.name}
                        </option>
                    ))}
                </select>
            </div>

            {(filters.inventory_id || filters.category_id || filters.item_group_id) && (
                <div className="col-md-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({ inventory_id: '', category_id: '', item_group_id: '' })}
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
                title={t('minimum_quantity_items_report')}
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

export default MinimumQuantity