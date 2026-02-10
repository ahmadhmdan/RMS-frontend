import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { formatDate } from '../../../core/utils/formatDate';
import DataTable from '../../../core/components/DataTable';
import { useSupplierTransactions } from '../hooks/useSupplierTransactions';
import type { Transaction } from '../hooks/useSupplierTransactions';
import * as XLSX from 'xlsx';

const formatCurrency = (value: number | string, symbol: string = '$'): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `0.00 ${symbol}`;
    return `${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${symbol || ''}`.trim();
};

const SupplierTransactions = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        transactions,
        summary,
        filtersInfo,
        loading,
        page,
        total,
        pageSize,
        setPage,
        filters,
        setFilters,
        suppliers,
        inventories,
        transactionTypes,
        categories,
        itemGroups,
        fetchAllTransactions,
    } = useSupplierTransactions();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const supplierId = params.get('supplier_id');
        if (supplierId) {
            setFilters(prev => ({ ...prev, supplier_id: supplierId }));
        }
    }, [location.search]);

    const columns = [
        {
            key: 'item_name',
            header: t('item_name'),
            render: (row: Transaction) => (
                <span className="fw-bold">{row.item_name}</span>
            ),
        },
        {
            key: 'invoice_no',
            header: t('invoice_no'),
            render: (tx: Transaction) => `#${tx.invoice_no}`,
        },
        {
            key: 'quantity',
            header: t('quantity'),
            render: (tx: Transaction) => {
                const qty = Number(tx.quantity).toFixed(2);
                const isIn = tx.affects_stock === 'increase';
                return (
                    <span className={isIn ? 'text-success' : 'text-danger'}>
                        {isIn ? '+' : '-'}{qty}
                    </span>
                );
            },
        },
        { key: 'unit_name', header: t('unit') },
        {
            key: 'unit_price',
            header: t('price_per_unit'),
            render: (tx: Transaction) =>
                formatCurrency(tx.unit_price, tx.unit_price_currency_symbol),
        },
        {
            key: 'total_price',
            header: t('total_price'),
            render: (tx: Transaction) =>
                formatCurrency(tx.total_price, tx.total_price_currency_symbol),
        },
        {
            key: 'transaction_type_name',
            header: t('type'),
            render: (tx: Transaction) => (
                <span
                    className={`badge badge-light-${tx.affects_stock === 'increase' ? 'success' : 'danger'
                        }`}
                >
                    {tx.transaction_type_name}
                </span>
            ),
        },
        { key: 'inventory_name', header: t('inventory_warehouse') },
        {
            key: 'invoice_date',
            header: t('date'),
            render: (tx: Transaction) => formatDate(tx.invoice_date),
        },
    ];

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
                    {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>
                            {sup.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('category')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.category_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, item_group_id: e.target.value }))}
                >
                    <option value="">{t('all_item_groups')}</option>
                    {itemGroups.map(ig => (
                        <option key={ig.id} value={ig.id}>
                            {ig.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('item_name')}</label>
                <input
                    type="text"
                    className="form-control form-control-solid"
                    placeholder={t('search_by_item_name')}
                    value={filters.item_name}
                    onChange={(e) => setFilters(prev => ({ ...prev, item_name: e.target.value }))}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('inventory')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.inventory_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, inventory_id: e.target.value }))}
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
                <label className="fs-6 mb-1">{t('transaction_type')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.transaction_type_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, transaction_type_id: e.target.value }))}
                >
                    <option value="">{t('all_transaction_types')}</option>
                    {transactionTypes.map(tt => (
                        <option key={tt.id} value={tt.id}>
                            {tt.name}
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

            {(filters.supplier_id || filters.inventory_id || filters.transaction_type_id || filters.category_id || filters.item_group_id || filters.item_name || filters.date_from || filters.date_to) && (
                <div className="col-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({
                            supplier_id: '',
                            inventory_id: '',
                            transaction_type_id: '',
                            category_id: '',
                            item_group_id: '',
                            item_name: '',
                            date_from: '',
                            date_to: '',
                        })}
                    >
                        {t('reset')}
                    </button>
                </div>
            )}
        </div>
    );

    const getHeaderTitle = () => {
        let parts = [t('supplier_transactions')];

        if (filtersInfo?.supplier?.name) {
            parts.push(`- ${filtersInfo.supplier.name}`);
        }
        if (filtersInfo?.inventory?.name) {
            parts.push(`- ${filtersInfo.inventory.name}`);
        }
        if (filtersInfo?.transaction_type?.name) {
            parts.push(`- ${filtersInfo.transaction_type.name}`);
        }
        if (filtersInfo?.category?.name) {
            parts.push(`- ${filtersInfo.category.name}`);
        }
        if (filtersInfo?.item_group?.name) {
            parts.push(`- ${filtersInfo.item_group.name}`);
        }
        if (filtersInfo?.item?.name) {
            parts.push(`- ${filtersInfo.item.name}`);
        }
        if (filtersInfo?.date_from || filtersInfo?.date_to) {
            parts.push(`(${filtersInfo?.date_from || '...'} → ${filtersInfo?.date_to || '...'})`);
        }

        return parts.join(' ');
    };

    const handleExport = async () => {
        const allTransactions = await fetchAllTransactions();
        if (!allTransactions.length) {
            return;
        }

        const exportData = allTransactions.map((tx: Transaction) => ({
            [t('id')]: tx.id,
            [t('item_name')]: tx.item_name,
            [t('invoice_no')]: `#${tx.invoice_no}`,
            [t('quantity')]: tx.affects_stock === 'increase' ? `+${Number(tx.quantity).toFixed(2)}` : `-${Number(tx.quantity).toFixed(2)}`,
            [t('unit')]: tx.unit_name,
            [t('price_per_unit')]: formatCurrency(tx.unit_price, tx.unit_price_currency_symbol),
            [t('total_price')]: formatCurrency(tx.total_price, tx.total_price_currency_symbol),
            [t('type')]: tx.transaction_type_name,
            [t('inventory_warehouse')]: tx.inventory_name,
            [t('date')]: formatDate(tx.invoice_date),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('supplier_transactions'));
        XLSX.writeFile(workbook, `${getHeaderTitle()}.xlsx`);
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-8 pb-6">
                <div className="card-title">
                    <h2 className="fw-bolder">{getHeaderTitle()}</h2>
                </div>
                <div className="card-toolbar">
                    <button className="btn btn-sm btn-light" onClick={() => navigate(-1)}>
                        <i className="ki-outline ki-arrow-left fs-2"></i>
                    </button>
                </div>
            </div>

            <div className="card-body p-10">
                {summary && (
                    <div className="row g-8 mb-10">
                        <div className="col-lg-6">
                            <div className="bg-light rounded-3 p-6 h-100">
                                <h4 className="fw-bold text-primary mb-6">{t('summary')}</h4>
                                <div className="d-flex flex-column gap-4 fs-5">
                                    <div>
                                        <span className="text-gray-600 me-3">{t('total_transactions')}:</span>
                                        <span className="fw-bold">{summary.total_transactions}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('total_quantity_in')}:</span>
                                        <span className="fw-bold text-success">{summary.total_quantity_in.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('total_quantity_out')}:</span>
                                        <span className="fw-bold text-danger">{summary.total_quantity_out.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 me-3">{t('net_value')}:</span>
                                        <span className="fw-bold">{formatCurrency(summary.net_value)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="bg-light-primary rounded-3 p-6 h-100">
                                <h4 className="fw-bold text-primary mb-6">{t('filter_information')}</h4>
                                <div className="d-flex flex-column gap-3 fs-5">
                                    {filtersInfo?.supplier?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('supplier')}:</span>
                                            <span className="fw-bold">{filtersInfo.supplier.name}</span>
                                        </div>
                                    )}
                                    {filtersInfo?.inventory?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('inventory')}:</span>
                                            <span className="fw-bold">{filtersInfo.inventory.name}</span>
                                        </div>
                                    )}
                                    {filtersInfo?.transaction_type?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('transaction_type')}:</span>
                                            <span className="fw-bold">{filtersInfo.transaction_type.name}</span>
                                        </div>
                                    )}
                                    {filtersInfo?.category?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('category')}:</span>
                                            <span className="fw-bold">{filtersInfo.category.name}</span>
                                        </div>
                                    )}
                                    {filtersInfo?.item_group?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('item_group')}:</span>
                                            <span className="fw-bold">{filtersInfo.item_group.name}</span>
                                        </div>
                                    )}
                                    {filtersInfo?.item?.name && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('item')}:</span>
                                            <span className="fw-bold">{filtersInfo.item.name}</span>
                                        </div>
                                    )}
                                    {(filtersInfo?.date_from || filtersInfo?.date_to) && (
                                        <div>
                                            <span className="text-gray-600 me-3">{t('date')}:</span>
                                            <span className="fw-bold">
                                                {filtersInfo?.date_from || '—'} → {filtersInfo?.date_to || '—'}
                                            </span>
                                        </div>
                                    )}
                                    {!filtersInfo?.supplier?.name && !filtersInfo?.inventory?.name && !filtersInfo?.transaction_type?.name && !filtersInfo?.category?.name && !filtersInfo?.item_group?.name && !filtersInfo?.item?.name && !filtersInfo?.date_from && !filtersInfo?.date_to && (
                                        <div className="text-gray-600">{t('no_specific_filters_applied')}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="separator separator-dashed my-10"></div>

                <DataTable
                    columns={columns}
                    data={transactions}
                    title={t('transactions_list')}
                    onCreate={() => { }}
                    onEdit={() => { }}
                    showCreate={false}
                    showEdit={false}
                    showAction={false}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    loading={loading}
                    filters={filtersUI}
                    onExport={handleExport}
                />
            </div>
        </div>
    );
};

export default SupplierTransactions;