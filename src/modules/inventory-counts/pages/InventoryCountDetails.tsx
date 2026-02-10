import { useNavigate } from 'react-router-dom';
import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useInventoryCountDetails } from '../hooks/useInventoryCountDetails';
import { ROUTES } from '../../../core/utils/constants';

const InventoryCountDetails = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { count, items, loading, isInProgress } = useInventoryCountDetails();

    const columns = [
        {
            key: 'item_name',
            header: t('item_name'),
            render: (item: any) => item.item_name || '—',
        },
        {
            key: 'unit_name',
            header: t('unit'),
            render: (item: any) => item.unit_name || '—',
        },
        {
            key: 'calculated_quantity',
            header: t('calculated_quantity'),
            render: (item: any) => <span className="fw-bold">{item.calculated_quantity}</span>,
        },
        {
            key: 'actual_quantity',
            header: t('actual_quantity'),
            render: (item: any) => (
                <span className={item.difference !== 0 ? 'text-danger fw-bold' : 'fw-bold'}>
                    {item.actual_quantity}
                </span>
            ),
        },
        {
            key: 'difference',
            header: t('difference'),
            render: (item: any) => {
                if (item.difference === 0) return <span className="text-muted">0</span>;
                const isPositive = item.difference > 0;
                return (
                    <span className={`fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{item.difference}
                    </span>
                );
            },
        },
        {
            key: 'price',
            header: t('price'),
            render: (item: any) => item.price || '0',
        },
        {
            key: 'is_settled',
            header: t('settled'),
            render: (item: any) => (
                <span
                    className={`badge badge-light-${item.is_settled === 'true' ? 'success' : 'warning'} fs-7`}
                >
                    {item.is_settled === 'true' ? t('yes') : t('no')}
                </span>
            ),
        },
    ];

    return (
        <>
            {count && (
                <div className="card mb-5">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="mb-3">{count.inventory_name}</h3>
                            <p className="text-muted">
                                {t('created_by')}: <strong>{count.created_user}</strong>
                            </p>
                        </div>
                        <span
                            className={`badge badge-lg badge-light-${count.status === 'completed' ? 'success' : 'warning'} fs-5 px-4 py-3`}
                        >
                            {t(count.status)}
                        </span>
                    </div>
                </div>
            )}

            <DataTable
                columns={columns}
                data={items}
                title={t('count_details')}
                onCreate={() => { }}
                onEdit={() => { }}
                loading={loading}
                showAction={false}
                showId={true}
                customHeaderAction={
                    isInProgress && count ? (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                                localStorage.setItem('adjustmentInventoryId', String(count.inventory_id));
                                navigate(`${ROUTES.INVENTORY_ADJUSTMENT}/${count.id}`, {
                                    state: { inventory_id: count.inventory_id },
                                });
                            }}
                        >
                            <i className="ki-outline ki-pencil fs-2"></i>
                            {t('matching')}
                        </button>
                    ) : null
                }
                total={items.length}
            />

        </>
    );
};

export default InventoryCountDetails;