import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useCreateInventoryCount } from '../hooks/useCreateInventoryCount';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import { ROUTES } from '../../../core/utils/constants';

const CreateInventoryCount: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const {
        categories,
        itemGroups,
        inventories,
        itemsOptions,
        loadingOptions,
        loadingItems,
        showTable,
        filters,
        updateFilter,
        applyFilters,
        items,
        // setItems,
    } = useCreateInventoryCount();

    const formik = useFormik({
        initialValues: {
            items: [],
        },
        onSubmit: async (values) => {
            const payload = {
                inventory_id: Number(filters.inventory_id),
                price_type: filters.price_type,
                items: values.items.map((item: any) => ({
                    id: item.id,
                    calculated_quantity: Number(item.calculated_quantity),
                    actual_quantity: Number(item.actual_quantity),
                    price: Number(item.price),
                })),
            };
            try {
                const res = await inventoryCountsService.create(payload);
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('saved_successfully'),
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => {
                    navigate(`${ROUTES.INVENTORY_ADJUSTMENT}/${res.data.id}`, {
                        state: { inventory_id: res.data.inventory_id }, // ← This is the key!
                    });
                });
            } catch (err: any) {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: err.response?.data?.message || t('error_saving'),
                });
            }
        },
    });

    useEffect(() => {
        formik.setFieldValue('items', items);
    }, [items]);

    const handleFieldChange = (index: number, field: string, value: number) => {
        formik.setFieldValue(`items.${index}.${field}`, value);
    };

    if (loadingOptions) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title d-flex align-items-center gap-4">
                    <h2 className="fw-bold fs-2 mb-0">{t('create_inventory_count')}</h2>
                </div>
                <div className="card-toolbar">
                    <button className="btn btn-light" onClick={() => navigate(-1)}>
                        <i className="ki-outline ki-arrow-left fs-2"></i>
                    </button>
                </div>
            </div>
            <div className="separator my-8"></div>
            <div className="card-body p-9">
                <form onSubmit={formik.handleSubmit}>
                    <div className="position-relative mb-10">
                        <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-primary"></div>
                        <h3 className="fw-bold mb-6 ps-4">{t('filter_options')}</h3>
                    </div>

                    <div className="row mb-10">
                        <div className="col-md-3 mb-4">
                            <label className="form-label required">{t('inventory')}</label>
                            <select
                                className="form-select form-select-solid"
                                value={filters.inventory_id}
                                onChange={(e) => updateFilter('inventory_id', e.target.value)}
                            >
                                <option value="">{t('choose_inventory')}</option>
                                {inventories.map((inv) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="form-label">{t('category')}</label>
                            <select
                                className="form-select form-select-solid"
                                value={filters.category_id}
                                onChange={(e) => updateFilter('category_id', e.target.value)}
                            >
                                <option value="">{t('choose_category')}</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="form-label">{t('item_group')}</label>
                            <select
                                className="form-select form-select-solid"
                                value={filters.item_group_id}
                                onChange={(e) => updateFilter('item_group_id', e.target.value)}
                            >
                                <option value="">{t('all_item_groups')}</option>
                                {itemGroups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="form-label">{t('item')}</label>
                            <select
                                className="form-select form-select-solid"
                                value={filters.item_id}
                                onChange={(e) => updateFilter('item_id', e.target.value)}
                            >
                                <option value="">{t('select_item')}</option>
                                {itemsOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 mb-4">
                            <label className="form-label required">{t('price_type')}</label>
                            <select
                                className="form-select form-select-solid"
                                value={filters.price_type}
                                onChange={(e) => updateFilter('price_type', e.target.value)}
                            >
                                <option value="avg">{t('average_price')}</option>
                                <option value="last">{t('last_buy_price')}</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end mb-4">
                            <button type="button" className="btn btn-primary" onClick={applyFilters}>
                                {t('apply')}
                            </button>
                        </div>
                    </div>

                    {loadingItems && (
                        <div className="d-flex justify-content-center py-10">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">{t('loading')}</span>
                            </div>
                        </div>
                    )}

                    {showTable && (
                        <>
                            <div className="position-relative mb-10">
                                <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-success"></div>
                                <h3 className="fw-bold mb-6 ps-4">{t('items')}</h3>
                            </div>

                            <div className="table-responsive mb-10">
                                <table className={`table table-bordered excel-like-table-2 ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                    <thead>
                                        <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                            <th className="text-center" style={{ width: '5%' }}></th>
                                            <th className="text-center" style={{ width: '30%' }}>{t('item_name')}</th>
                                            <th className="text-center" style={{ width: '15%' }}>{t('unit')}</th>
                                            <th className="text-center" style={{ width: '15%' }}>{t('calculated_quantity')}</th>
                                            <th className="text-center" style={{ width: '15%' }}>{t('actual_quantity')}</th>
                                            <th className="text-center" style={{ width: '15%' }}>{t('price')}</th>
                                            <th className="text-center" style={{ width: '5%' }}>{t('price_type')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formik.values.items.map((item: any, index: number) => (
                                            <tr key={item.id}>
                                                <td className="row-index">{index + 1}</td>
                                                <td className="px-3">{item.item_name || '—'}</td>
                                                <td className="px-3">{item.unit_name || '—'}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        value={item.calculated_quantity ?? ''}
                                                        onChange={(e) => handleFieldChange(index, 'calculated_quantity', Number(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        value={item.actual_quantity ?? ''}
                                                        onChange={(e) => handleFieldChange(index, 'actual_quantity', Number(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        value={item.price ?? ''}
                                                        onChange={(e) => handleFieldChange(index, 'price', Number(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control text-center bg-transparent border-0"
                                                        value={item.price_type || '—'}
                                                        readOnly
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-start mt-12">
                                <button type="submit" className="btn btn-primary btn-lg">
                                    {t('create')}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateInventoryCount;