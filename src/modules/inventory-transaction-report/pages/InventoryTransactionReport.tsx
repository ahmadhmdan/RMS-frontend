import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useInventoryTransactionReport } from '../hooks/useInventoryTransactionReport';
import * as XLSX from 'xlsx';

interface Transaction {
    created_at?: string;
    inventory_name: string;
    item_name: string;
    unit_name?: string;
    quantity: number;
    affects_stock: string;
    transaction_type_name: string;
    invoice_number?: string;
}

const InventoryTransactionReport = () => {
    const { t } = useTranslation();
    const {
        transactions,
        loading,
        page,
        total,
        pageSize,
        setPage,
        filters,
        setFilters,
        inventories,
        items,
        getFullData,
    } = useInventoryTransactionReport();

    const columns = [
        {
            key: 'inventory_name',
            header: t('inventory'),
            render: (row: any) => (
                <span className="fw-bold">{row.inventory_name}</span>
            ),
        },
        {
            key: 'item_name',
            header: t('item'),
            render: (row: any) => (
                <span className="fw-bold">{row.item_name}</span>
            ),
        },
        {
            key: 'quantity',
            header: t('quantity'),
            render: (row: any) => (
                <span className={`badge badge-light-${row.affects_stock === 'داخل' ? 'success' : 'danger'} fs-6`}>
                    {row.affects_stock === 'داخل' ? '+' : '-'}{row.quantity}
                </span>
            ),
        },
        {
            key: 'unit_name',
            header: t('unit'),
            render: (row: any) => row.unit_name || '—',
        },
        {
            key: 'transaction_type_name',
            header: t('transaction_type'),
        },
        {
            key: 'affects_stock',
            header: t('movement'),
            render: (row: any) => (
                <span className={`badge badge-${row.affects_stock === 'داخل' ? 'success' : 'danger'} fs-8`}>
                    {row.affects_stock}
                </span>
            ),
        },
        {
            key: 'invoice_number',
            header: t('invoice_number'),
            render: (row: any) => row.invoice_number || '—',
        },
        {
            key: 'created_at',
            header: t('date'),
            render: (row: any) => row.created_at || '—',
        },
    ];

    const filtersUI = (
        <div className="row">
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
                <label className="fs-6 mb-1">{t('item')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.item_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, item_id: e.target.value }))}
                >
                    <option value="">{t('all_items')}</option>
                    {items.map(it => (
                        <option key={it.id} value={it.id}>
                            {it.name}
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

            {(filters.inventory_id || filters.item_id || filters.date_from || filters.date_to) && (
                <div className="col-md-12 fv-row mb-4">
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({
                            inventory_id: '',
                            item_id: '',
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

    const handleExport = async () => {
        const fullData = await getFullData();
        const exportData = fullData.map((row: Transaction) => ({
            [t('date')]: row.created_at || '—',
            [t('inventory')]: row.inventory_name || '—',
            [t('item')]: row.item_name || '—',
            [t('unit')]: row.unit_name || '—',
            [t('quantity')]: `${row.affects_stock === 'داخل' ? '+' : '-'}${row.quantity}`,
            [t('transaction_type')]: row.transaction_type_name || '—',
            [t('movement')]: row.affects_stock || '—',
            [t('invoice_number')]: row.invoice_number || '—',
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory Transactions');
        XLSX.writeFile(wb, `Inventory_Transaction_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <DataTable
            columns={columns}
            data={transactions}
            title={t('inventory_transaction_report')}
            onCreate={() => { }}
            onEdit={() => { }}
            showCreate={false}
            showEdit={false}
            showDelete={false}
            showView={false}
            showAction={false}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            loading={loading}
            filters={filtersUI}
            onExport={handleExport}
        />
    );
};

export default InventoryTransactionReport;