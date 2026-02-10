import DataTable from '../../../core/components/DataTable'
import { useInventoryLevelReport } from '../hooks/useInventoryLevelReport'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'

interface Unit {
    unit_id: number;
    unit_name: string;
    inventory_id: number;
    inventory_name: string;
    inventory_parent_name: string;
    quantity: number;
    last_update: string;
    average_price: number | null;
    last_buy_price: number | null;
    last_buy_currency: string | null;
    last_buy_date: string | null;
}

interface InventoryItem {
    item_id: number;
    item_code: string;
    item_name: string;
    category_name: string;
    item_group_name: string;
    units: Unit[];
}

const InventoryLevelReport = () => {
    const { t } = useTranslation()
    const {
        data,
        pagination,
        loading,
        filters,
        setFilters,
        categories,
        inventories,
        handlePageChange,
        handlePageSizeChange,
        getFullData,
        manufactureNegative,
    } = useInventoryLevelReport()

    const formatLargeNumber = (value: string | number, decimals: number = 2): string => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '0.00';

        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const columns = [
        {
            key: 'item_id',
            header: 'item_id',
            render: (item: InventoryItem) => item.item_id || '—',
        },
        {
            key: 'item_code',
            header: 'item_code',
            render: (item: InventoryItem) => item.item_code || '—',
        },
        {
            key: 'item_name',
            header: 'item_name',
            render: (item: InventoryItem) => (
                <span className="fw-bold">{item.item_name}</span>
            ),
        },
        {
            key: 'item_group_name',
            header: 'item_group_name',
            render: (item: InventoryItem) => item.item_group_name || '—',
        },
        {
            key: 'category_name',
            header: 'category',
            render: (item: InventoryItem) => item.category_name || '—',
        },
        {
            key: 'inventory_name',
            header: 'inventory',
            render: (item: InventoryItem) => {
                const unit = item.units[0]
                return unit ? (
                    <div>
                        <div>{unit.inventory_name}</div>
                        {unit.inventory_parent_name && (
                            <small className="text-muted">{unit.inventory_parent_name}</small>
                        )}
                    </div>
                ) : '—'
            },
        },
        {
            key: 'quantity',
            header: 'quantity',
            render: (item: InventoryItem) => {
                if (!item.units || item.units.length === 0) return '—'

                return (
                    <div className="d-flex flex-column gap-1">
                        {item.units.map((unit: Unit, index: number) => {
                            const qty = unit.quantity ?? 0
                            const color =
                                qty < 0 ? 'danger' :
                                    qty === 0 ? 'warning' : 'success'

                            return (
                                <span
                                    key={index}
                                    className={`badge badge-light-${color} d-block text-center w-100`}
                                >
                                    {qty} {unit.unit_name}
                                </span>
                            )
                        })}
                    </div>
                )
            }
        },


        {
            key: 'average_price',
            header: t('average_price'),
            render: (item: InventoryItem) => {
                const unit = item.units[0]
                const avgPrice = unit?.average_price
                if (avgPrice === null || avgPrice === undefined) return '—'
                return <span className="text-end fw-semibold">{formatLargeNumber(avgPrice)}</span>
            },
        },
        {
            key: 'last_buy_price',
            header: t('last_buy_price'),
            render: (item: InventoryItem) => {
                const unit = item.units[0]
                const price = unit?.last_buy_price
                const currency = unit?.last_buy_currency || ''

                if (price === null || price === undefined) return '—'

                const formattedPrice = formatLargeNumber(price)
                return (
                    <span className="text-end fw-semibold">
                        {currency} {formattedPrice}
                    </span>
                )
            },
        },
    ]

    const handleExport = async () => {
        const fullData = await getFullData();
        const exportData = fullData.map((item: InventoryItem) => {
            const unit = item.units[0] || {}
            const price = unit.last_buy_price
            const currency = unit.last_buy_currency || ''

            return {
                [t('item_code')]: item.item_code || '—',
                [t('item_name')]: item.item_name,
                [t('category')]: item.category_name || '—',
                [t('inventory')]: unit.inventory_name || '—',
                [t('quantity')]: `${unit.quantity || 0} ${unit.unit_name || ''}`,
                [t('average_price')]: unit.average_price != null ? formatLargeNumber(unit.average_price) : '—',
                [t('last_buy_price')]: price != null
                    ? `${currency} ${formatLargeNumber(price)}`
                    : '—',
            }
        })

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory Levels')
        XLSX.writeFile(wb, `Inventory_Level_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('search_by_item_name')}</label>
                <input
                    type="text"
                    className="form-control form-control-solid"
                    placeholder={t('search')}
                    value={filters.item_name}
                    onChange={(e) => setFilters(prev => ({ ...prev, item_name: e.target.value, page: 1 }))}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_category')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.category_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value, page: 1 }))}
                >
                    <option value="">{t('all_categories')}</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

            </div>


            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_inventory')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.inventory_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, inventory_id: e.target.value, page: 1 }))}
                >
                    <option value="">{t('all_inventories')}</option>
                    {inventories.map(inv => (
                        <option key={inv.id} value={inv.id}>
                            {inv.name}
                        </option>
                    ))}
                </select>

            </div>
            <div className="col-md-12 fv-row mb-4">
                {(filters.item_name || filters.category_id || filters.inventory_id) && (
                    <button className="btn btn-sm btn-light" onClick={() => setFilters({ item_name: '', category_id: '', inventory_id: '', page: 1, per_page: 10 })}>
                        {t('reset')}
                    </button>
                )}
            </div>

        </div>
    )

    const customHeaderAction = (
        <button
            className='btn btn-sm btn-danger'
            disabled={!filters.inventory_id}
            onClick={() => {
                Swal.fire({
                    title: t('confirm_manufacture_title'),
                    text: t('confirm_manufacture_text'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: t('confirm'),
                    cancelButtonText: t('cancel'),
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-secondary',
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        manufactureNegative(Number(filters.inventory_id))
                    }
                })
            }}
        >
            <i className="fa-solid fa-circle-radiation fs-2"></i>
            {t('manufacture_negative_items')}
        </button>
    )

    return (
        <div>
            <DataTable
                columns={columns}
                data={data}
                title={t('inventory_level_report')}
                onCreate={() => { }}
                onEdit={() => { }}
                onDelete={() => { }}
                showCreate={false}
                showEdit={false}
                showView={false}
                showDelete={false}
                showAction={false}
                showId={false}
                total={pagination.total}
                page={pagination.current_page}
                pageSize={pagination.per_page}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                filters={filtersUI}
                onExport={handleExport}
                loading={loading}
                customHeaderAction={customHeaderAction}
            />
        </div>
    )
}

export default InventoryLevelReport