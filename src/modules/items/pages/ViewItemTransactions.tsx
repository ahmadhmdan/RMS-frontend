import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../core/utils/formatDate';
import DataTable from '../../../core/components/DataTable';
import { useItemTransactions } from '../hooks/useItemTransactions';

const formatCurrency = (value: number | string, symbol: string = ''): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `0.00 ${symbol}`;
    return `${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${symbol || ''}`.trim();
};

const ViewItemTransactions = () => {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        item,
        summary,
        transactions,
        loading,
        page,
        total,
        pageSize,
        setPage,
        filters,
        setFilters,
        inventories,
        suppliers,
        transactionTypes,
    } = useItemTransactions(itemId);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-500px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }

    if (!item || !summary) {
        return (
            <div className="text-center py-20">
                <h3>{t('item_not_found')}</h3>
                <button className="btn btn-primary mt-4" onClick={() => navigate(-1)}>
                    {t('back')}
                </button>
            </div>
        );
    }

    const columns = [
        {
            key: 'invoice_no',
            header: t('invoice_no'),
            render: (tx: any) => `#${tx.invoice_no}`,
        },
        {
            key: 'invoice_date',
            header: t('date'),
            render: (tx: any) => formatDate(tx.invoice_date),
        },
        {
            key: 'transaction_type_name',
            header: t('transaction_type'),
            render: (tx: any) => tx.transaction_type_name || '—',
        },
        {
            key: 'quantity',
            header: t('quantity'),
            render: (tx: any) => {
                const qty = parseFloat(String(tx.quantity)).toFixed(0);
                const isIncrease = tx.affects_stock === 'increase';
                const sign = isIncrease ? '+' : '-';
                return (
                    <span className={isIncrease ? 'text-success' : 'text-danger'}>
                        {sign}{qty}
                    </span>
                );
            },
        },
        {
            key: 'unit_name',
            header: t('unit'),
            render: (tx: any) => tx.unit_name || '—',
        },
        {
            key: 'unit_price',
            header: t('unit_price'),
            render: (tx: any) =>
                formatCurrency(tx.unit_price, tx.currency_symbol || undefined),
        },
        {
            key: 'total_price',
            header: t('total_price'),
            render: (tx: any) =>
                formatCurrency(tx.total_price, tx.currency_symbol || undefined),
        },
        {
            key: 'inventory_name',
            header: t('inventory'),
            render: (tx: any) => tx.inventory_name || '—',
        },
        {
            key: 'supplier_name',
            header: t('supplier'),
            render: (tx: any) => tx.supplier_name || '—',
        },
    ];

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_inventory')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.inventory_id}
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, inventory_id: e.target.value }));
                        setPage(1);
                    }}
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
                <label className="fs-6 mb-1">{t('choose_supplier')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.supplier_id}
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, supplier_id: e.target.value }));
                        setPage(1);
                    }}
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
                <label className="fs-6 mb-1">{t('choose_transaction_type')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.transaction_type_id}
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, transaction_type_id: e.target.value }));
                        setPage(1);
                    }}
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
                    value={filters.from_date}
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, from_date: e.target.value }));
                        setPage(1);
                    }}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('to_date')}</label>
                <input
                    type="date"
                    className="form-control form-control-solid"
                    value={filters.to_date}
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, to_date: e.target.value }));
                        setPage(1);
                    }}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                {(filters.inventory_id || filters.supplier_id || filters.transaction_type_id || filters.from_date || filters.to_date) && (
                    <button className="btn btn-sm btn-light" onClick={() => {
                        setFilters({ inventory_id: '', supplier_id: '', transaction_type_id: '', from_date: '', to_date: '' });
                        setPage(1);
                    }}>
                        {t('reset')}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="card">
            <div className="card-header border-0 pt-8 pb-6">
                <div className="card-title">
                    <h2 className="fw-bolder">
                        {t('item_transactions')} #{item.code || item.id} - {item.name}
                    </h2>
                </div>
                <div className="card-toolbar">
                    <button className="btn btn-sm btn-light" onClick={() => navigate(-1)}>
                        <i className="ki-outline ki-arrow-left fs-2"></i>
                    </button>
                </div>
            </div>

            <div className="card-body p-10">
                <div className="row g-8 mb-10">
                    <div className="col-lg-6">
                        <div className="bg-light rounded-3 p-6 h-100">
                            <h4 className="fw-bold text-primary mb-6">{t('item_info')}</h4>
                            <div className="d-flex flex-column gap-4 fs-5">
                                <div>
                                    <span className="text-gray-600 me-3">{t('item_code')}:</span>
                                    <span className="fw-bold">{item.code || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 me-3">{t('item_name')}:</span>
                                    <span className="fw-bold">{item.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 me-3">{t('total_transactions')}:</span>
                                    <span className="fw-bold">{summary.total_transactions}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="bg-light-primary rounded-3 p-6 h-100">
                            <div className="row text-center pt-9">
                                <div className="col-6 border-end">
                                    <h4 className="fw-bold text-primary mb-2">{t('net_quantity')}</h4>
                                    <div className="fs-2x fw-bolder text-primary">
                                        {summary.net_quantity_from_transactions.toFixed(2)} {summary.primary_unit_name}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <h4 className="fw-bold text-primary mb-2">{t('net_value')}</h4>
                                    <div className="fs-2x fw-bolder text-primary">
                                        {formatCurrency(summary.net_value)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h5 className="fw-bold text-primary mb-3 text-center">{t('current_stock_in_all_units')}</h5>
                                <div className="d-flex flex-column gap-2 px-12">
                                    {summary.current_stock_in_all_units.map((stock: any) => (
                                        <div key={stock.unit_id} className="d-flex justify-content-between px-4">
                                            <span>{stock.unit_name} {stock.is_primary ? `(${t('primary')})` : ''}</span>
                                            <span className="fw-bold">{stock.quantity.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="separator separator-dashed my-10"></div>

                <DataTable
                    columns={columns}
                    data={transactions}
                    title={t('transactions_history')}
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
                />
            </div>
        </div>
    );
};

export default ViewItemTransactions;