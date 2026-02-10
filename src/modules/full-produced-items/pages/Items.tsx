import { useNavigate } from 'react-router-dom'
import DataTable from '../../../core/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useItems } from '../hooks/useItems';
import { ROUTES } from '../../../core/utils/constants'

const FullProducedItems = () => {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const { items, loading, page, total, pageSize, setPage, setPageSize, categories, itemGroups, search, setSearch, categoryId, setCategoryId, itemGroupId, setItemGroupId, deleteItem } = useItems();

    const columns = [
        {
            key: 'item_code',
            header: t('item_code'),
            render: (item: any) => item.item_code || '—',
        },
        {
            key: 'name',
            header: t('name'),
            render: (row: any) => (
                <span className="fw-bold">{row.name}</span>
            ),
        },
        {
            key: 'category_name',
            header: t('category'),
            render: (item: any) => item.category_name || '—',
        },
        {
            key: 'item_group_name',
            header: t('item_group_name'),
            render: (item: any) => item.item_group_name || '—',
        },
        {
            key: 'has_ingredients',
            header: t('has_ingredients'),
            render: (item: any) => (
                <span className={`badge badge-light-${item.has_ingredients === 'yes' ? 'success' : 'danger'} fs-7`}>
                    {item.has_ingredients === 'yes' ? t('yes') : t('no')}
                </span>
            ),
        },
        {
            key: 'limit',
            header: t('limit'),
            render: (item: any) => item.limit || '—',
        },
    ];

    const itemTransactions = (item: any) => (
        <button
            className="btn btn-icon btn-bg-light btn-active-color-info btn-sm"
            onClick={() => navigate(`${ROUTES.ITEMS_TRANSACTIONS}/${item.id}`)}
            title={t('view_transactions')}
        >
            <i className="ki-outline ki-arrow-right-left fs-2"></i>
        </button>
    );

    const filters = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('search')}</label>
                <input
                    type="text"
                    className="form-control form-control-solid"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('search_by_name')}
                />
            </div>
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('category')}</label>
                <select
                    className="form-select form-select-solid"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">{t('all_categories')}</option>
                    {categories.map((cat: any) => (
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
                    value={itemGroupId}
                    onChange={(e) => setItemGroupId(e.target.value)}
                >
                    <option value="">{t('all_item_groups')}</option>
                    {itemGroups.map((group: any) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <DataTable
            columns={columns}
            data={items}
            title={t('full_produced_items')}
            onCreate={() => navigate(`${ROUTES.CREATE_ITEM}/full-produced`)}
            onEdit={(item) => navigate(`${ROUTES.EDIT_ITEM}/${item.id}/full-produced`)}
            showEdit={true}
            showView={false}
            customActions={itemTransactions}
            onDelete={deleteItem}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            loading={loading}
            filters={filters}
        />
    );
};

export default FullProducedItems;