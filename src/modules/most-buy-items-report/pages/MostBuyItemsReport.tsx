import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useMostBuyItemsReport } from '../hooks/useMostBuyItemsReport';

const MostBuyItemsReport = () => {
    const { t } = useTranslation();
    const { items, loading, page, total, pageSize, setPage } = useMostBuyItemsReport();

    const columns = [
        {
            key: 'Item_name',
            header: t('item_name'),
            render: (row: any) => (
                <span className="fw-bold">{row.Item_name}</span>
            ),
        },
        {
            key: 'Inventory_name',
            header: t('inventory'),
            render: (row: any) => row.Inventory_name || '—',
        },
        {
            key: 'Quantity',
            header: t('total_quantity'),
            render: (row: any) => Number(row.Quantity).toLocaleString(),
        },
        {
            key: 'Last_Price',
            header: t('last_buy_price'),
            render: (row: any) => Number(row.Last_Price).toFixed(2),
        },
        // {
        //     key: 'Created_at',
        //     header: t('last_purchase_date'),
        //     render: (row: any) => row.Created_at || '—',
        // },
    ];

    return (
        <DataTable
            columns={columns}
            data={items}
            title={t('most_buy_items_report')}
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
        />
    );
};

export default MostBuyItemsReport;