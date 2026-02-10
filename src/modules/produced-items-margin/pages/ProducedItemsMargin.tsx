import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useProducedItemsMargin } from '../hooks/useProducedItemsMargin';
import * as XLSX from 'xlsx';

interface ProducedItem {
    name: string;
    recipe_unit?: string;
    cost_price: number;
    indirect_cost_price: number;
    full_cost_price: number;
    sell_price: number;
    margin: number;
    margin_percentage: string;
    expected_margin: number;
    expected_margin_percentage: string;
    difference: number;
}

const ProducedItemsMargin = () => {
    const { t } = useTranslation();
    const { items, loading, page, total, pageSize, setPage, getFullData } = useProducedItemsMargin();

    const columns = [
        {
            key: 'name',
            header: t('item_name'),
            render: (row: any) => (
                <span className="fw-bold">{row.name}</span>
            ),
        },
        {
            key: 'recipe_unit',
            header: t('recipe_unit'),
            render: (item: any) => item.recipe_unit || '—',
        },
        {
            key: 'cost_price',
            header: t('cost_price'),
            render: (item: any) => Number(item.cost_price).toFixed(2),
        },
        {
            key: 'indirect_cost_price',
            header: t('indirect_cost'),
            render: (item: any) => Number(item.indirect_cost_price).toFixed(2),
        },
        {
            key: 'full_cost_price',
            header: t('full_cost_price'),
            render: (item: any) => Number(item.full_cost_price).toFixed(2),
        },
        {
            key: 'sell_price',
            header: t('sell_price'),
            render: (item: any) => Number(item.sell_price).toFixed(2),
        },
        {
            key: 'margin',
            header: t('margin'),
            render: (item: any) => Number(item.margin).toFixed(2),
        },
        {
            key: 'margin_percentage',
            header: t('margin_percentage'),
            render: (item: any) => `${item.margin_percentage}%`,
        },
        {
            key: 'expected_margin',
            header: t('expected_margin'),
            render: (item: any) => Number(item.expected_margin).toFixed(2),
        },
        {
            key: 'expected_margin_percentage',
            header: t('expected_margin_percentage'),
            render: (item: any) => `${item.expected_margin_percentage}%`,
        },
        {
            key: 'difference',
            header: t('difference'),
            render: (item: any) => (
                <span className={`badge badge-light-${Number(item.difference) >= 0 ? 'success' : 'danger'} fs-7`}>
                    {Number(item.difference).toFixed(2)}
                </span>
            ),
        },
    ];

    const handleExport = async () => {
        const fullData = await getFullData();
        const exportData = fullData.map((item: ProducedItem) => ({
            [t('item_name')]: item.name || '—',
            [t('recipe_unit')]: item.recipe_unit || '—',
            [t('cost_price')]: Number(item.cost_price).toFixed(2),
            [t('indirect_cost')]: Number(item.indirect_cost_price).toFixed(2),
            [t('full_cost_price')]: Number(item.full_cost_price).toFixed(2),
            [t('sell_price')]: Number(item.sell_price).toFixed(2),
            [t('margin')]: Number(item.margin).toFixed(2),
            [t('margin_percentage')]: `${item.margin_percentage}%`,
            [t('expected_margin')]: Number(item.expected_margin).toFixed(2),
            [t('expected_margin_percentage')]: `${item.expected_margin_percentage}%`,
            [t('difference')]: Number(item.difference).toFixed(2),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Produced Items Margin');
        XLSX.writeFile(wb, `Produced_Items_Margin_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <DataTable
            columns={columns}
            data={items}
            title={t('produced_items_margin')}
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
            onExport={handleExport}
        />
    );
};

export default ProducedItemsMargin;