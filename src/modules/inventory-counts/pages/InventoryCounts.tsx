import { useNavigate } from 'react-router-dom';
import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useInventoryCounts } from '../hooks/useInventoryCounts';
import { ROUTES } from '../../../core/utils/constants';

const InventoryCounts = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { counts, loading, page, total, pageSize, setPage } = useInventoryCounts();

    const columns = [
        {
            key: 'inventory_name',
            header: t('inventory_name'),
            render: (item: any) => item.inventory_name || '—',
        },
        {
            key: 'created_user',
            header: t('created_by'),
            render: (item: any) => item.created_user || '—',
        },
        {
            key: 'items_count',
            header: t('items_count'),
            render: (item: any) => (
                <span className="fw-bold">{item.items_count}</span>
            ),
        },
        {
            key: 'status',
            header: t('status'),
            render: (item: any) => {
                const isCompleted = item.status === 'completed';
                return (
                    <span
                        className={`badge badge-light-${isCompleted ? 'success' : 'warning'} fs-7`}
                    >
                        {t(item.status)}
                    </span>
                );
            },
        },
        {
            key: 'created_at',
            header: t('created_at'),
            render: (item: any) => new Date(item.created_at).toLocaleDateString(),
        },
    ];

    const handleView = (item: any) => {
        navigate(`${ROUTES.INVENTORY_COUNT_DETAILS}/${item.id}`)
    }

    return (
        <DataTable
            columns={columns}
            data={counts}
            title={t('inventory_counts')}
            onCreate={() => navigate(ROUTES.CREATE_INVENTORY_COUNT)}
            onEdit={() => { }}
            showEdit={false}
            showDelete={false}
            onView={handleView}
            showView={true}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            loading={loading}
        />
    );
};

export default InventoryCounts;