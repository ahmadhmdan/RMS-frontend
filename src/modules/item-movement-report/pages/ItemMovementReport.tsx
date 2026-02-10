import DataTable from '../../../core/components/DataTable'
import { useItemMovementReport } from '../hooks/useItemMovementReport'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { useState } from 'react'

const ItemMovementReport = () => {
    const { t } = useTranslation()
    const {
        data,
        pagination,
        loading,
        filters,
        setFilters,
        categories,
        itemGroups,
        handlePageChange,
        handlePageSizeChange,
        getFullData,
    } = useItemMovementReport()

    const [showConverted, setShowConverted] = useState<Record<string, boolean>>({})

    const areQuantitiesEqual = (a: any[], b: any[]) => {
        const sortedA = [...a].sort((x, y) => x.unit_id - y.unit_id)
        const sortedB = [...b].sort((x, y) => x.unit_id - y.unit_id)
        if (sortedA.length !== sortedB.length) return false
        for (let i = 0; i < sortedA.length; i++) {
            if (
                sortedA[i].unit_id !== sortedB[i].unit_id ||
                sortedA[i].quantity !== sortedB[i].quantity ||
                sortedA[i].unit_name !== sortedB[i].unit_name
            ) {
                return false
            }
        }
        return true
    }

    const areSameForItem = (item: any) => {
        const sameIn = areQuantitiesEqual(item.total_in.quantities_by_unit, item.total_in.quantities_converted)
        const sameOut = areQuantitiesEqual(item.total_out.quantities_by_unit, item.total_out.quantities_converted)
        return sameIn && sameOut
    }

    const columns = [
        {
            key: 'item_name',
            header: t('product_name'),
            render: (row: any) => (
                <span className="fw-bold">{row.item_name}</span>
            ),
        },
        {
            key: 'total_in',
            header: t('total_incoming_quantity'),
            render: (item: any) => {
                const { quantities_by_unit, quantities_converted } = item.total_in
                const isEmpty = quantities_by_unit.length === 0 && quantities_converted.length === 0
                if (isEmpty) {
                    return (
                        <div className="p-3 text-muted fst-italic">
                            {t('no_data_available')}
                        </div>
                    )
                }
                const show = showConverted[item.item_name] ?? false

                return (
                    <div className="p-3 bg-light bg-opacity-5 rounded border border-opacity-25">
                        {quantities_by_unit.length > 0 && (
                            <div className="mb-3">
                                <div className="text-success fw-semibold mb-2 small">
                                    {t('basic_units')}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {quantities_by_unit.map((u: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-pill fs-6 fw-medium text-center"
                                        >
                                            {u.quantity.toLocaleString()} {u.unit_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {show && quantities_converted.length > 0 && (
                            <div>
                                <div className="text-success fw-semibold mb-2 small">
                                    {t('converted_units')}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {quantities_converted.map((u: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-pill fs-6 fw-medium text-center"
                                        >
                                            {u.quantity.toLocaleString()} {u.unit_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'total_out',
            header: t('total_outgoing_quantity'),
            render: (item: any) => {
                const { quantities_by_unit, quantities_converted } = item.total_out
                const isEmpty = quantities_by_unit.length === 0 && quantities_converted.length === 0
                if (isEmpty) {
                    return (
                        <div className="p-3 text-muted fst-italic">
                            {t('no_data_available')}
                        </div>
                    )
                }
                const show = showConverted[item.item_name] ?? false

                return (
                    <div className="p-3 bg-light bg-opacity-5 rounded border border-opacity-25">
                        {quantities_by_unit.length > 0 && (
                            <div className="mb-3">
                                <div className="text-danger fw-semibold mb-2 small">
                                    {t('basic_units')}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {quantities_by_unit.map((u: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-1 bg-danger bg-opacity-10 text-danger rounded-pill fs-6 fw-medium text-center"
                                        >
                                            {u.quantity.toLocaleString()} {u.unit_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {show && quantities_converted.length > 0 && (
                            <div>
                                <div className="text-danger fw-semibold mb-2 small">
                                    {t('converted_units')}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {quantities_converted.map((u: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-1 bg-danger bg-opacity-10 text-danger rounded-pill fs-6 fw-medium text-center"
                                        >
                                            {u.quantity.toLocaleString()} {u.unit_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'current_stock',
            header: t('current_quantity_in_warehouse'),
            render: (item: any) => (
                <div className="p-3 bg-light rounded border">
                    <div className="d-flex flex-column gap-2">
                        {item.current_stock.map((u: any, idx: number) => {
                            const qty = u.quantity ?? 0
                            const variant =
                                qty < 0 ? 'danger' :
                                    qty === 0 ? 'warning' :
                                        'success'

                            return (
                                <div
                                    key={idx}
                                    className={`px-3 py-1 bg-${variant} bg-opacity-10 text-${variant} rounded-pill fs-6 fw-medium text-center`}
                                >
                                    {qty.toLocaleString()} {u.unit_name}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ),
        },
        {
            key: 'toggle',
            header: '',
            render: (item: any) => {
                const hasConvertedIn = item.total_in.quantities_converted.length > 0
                const hasConvertedOut = item.total_out.quantities_converted.length > 0
                const hasConverted = hasConvertedIn || hasConvertedOut
                const areSame = areSameForItem(item)
                if (!hasConverted || areSame) {
                    return null
                }
                const currentShow = showConverted[item.item_name] ?? false
                return (
                    <button
                        className="btn btn-sm btn-icon btn-light btn-active-light-primary"
                        onClick={() =>
                            setShowConverted((prev) => ({
                                ...prev,
                                [item.item_name]: !currentShow,
                            }))
                        }
                        title={currentShow ? t('hide_converted') : t('show_converted')}
                    >
                        <i className={`ki-outline ki-${currentShow ? 'minus' : 'plus'} fs-4`}></i>
                    </button>
                )
            },
        },
    ]

    const handleExport = async () => {
        const fullData = await getFullData()
        const exportData = fullData.map((item: any) => ({
            [t('product_name')]: item.item_name,
            [t('total_incoming_basic')]: item.total_in.quantities_by_unit.map((u: any) => `${u.quantity} ${u.unit_name}`).join(', '),
            [t('total_incoming_converted')]: item.total_in.quantities_converted.map((u: any) => `${u.quantity} ${u.unit_name}`).join(', '),
            [t('total_outgoing_basic')]: item.total_out.quantities_by_unit.map((u: any) => `${u.quantity} ${u.unit_name}`).join(', '),
            [t('total_outgoing_converted')]: item.total_out.quantities_converted.map((u: any) => `${u.quantity} ${u.unit_name}`).join(', '),
            [t('current_stock')]: item.current_stock.map((u: any) => `${u.quantity} ${u.unit_name}`).join(', '),
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Item Movement')
        XLSX.writeFile(wb, `Item_Movement_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
                <label className="fs-6 mb-1">{t('item_group')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.item_group_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, item_group_id: e.target.value, page: 1 }))}
                >
                    <option value="">{t('all_item_groups')}</option>
                    {itemGroups.map(group => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('from_date')}</label>
                <input
                    type="date"
                    className="form-control form-control-solid"
                    value={filters.date_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('to_date')}</label>
                <input
                    type="date"
                    className="form-control form-control-solid"
                    value={filters.date_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
                />
            </div>

            {(filters.item_name || filters.category_id || filters.item_group_id || filters.date_from || filters.date_to) && (
                <div className="col-md-12 fv-row mb-4">
                    <button className="btn btn-sm btn-light" onClick={() => setFilters({ item_name: '', category_id: '', item_group_id: '', date_from: '', date_to: '', page: 1, per_page: 10 })}>
                        {t('reset')}
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            title={t('item_movement_report')}
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
        />
    )
}

export default ItemMovementReport