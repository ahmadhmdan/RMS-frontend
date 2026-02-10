import React from 'react';
import { ErrorMessage } from 'formik';

interface Props {
    formik: any;
    categories: any[];
    itemGroups: any[];
    unitsList: any[];
    inventories: any[];
    isProduced: boolean;
    t: (key: string) => string;
    type: string;
}

const BasicInformation: React.FC<Props> = ({ formik, categories, itemGroups, unitsList, inventories, isProduced, t, type }) => {
    return (
        <>
            <div className="position-relative">
                <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-danger"></div>
                <h3 className="fw-bold mb-6 ps-4">{t('basic_information')}</h3>
            </div>
            <div className="row g-4 mb-7">
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('item_code')}</label>
                    <input
                        type="text"
                        className="form-control form-control-solid"
                        name="item_code"
                        placeholder={t('(optional)_auto_generated')}
                        value={formik.values.item_code}
                        onChange={formik.handleChange}
                    />
                    <ErrorMessage name="item_code" component="div" className="text-danger fs-6 mt-1" />
                </div>
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('name')}</label>
                    <input
                        type="text"
                        className="form-control form-control-solid"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        required
                    />
                    <ErrorMessage name="name" component="div" className="text-danger fs-6 mt-1" />
                </div>
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('category')}</label>
                    <select
                        className="form-select form-select-solid"
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        required
                    >
                        <option value="">{t('choose_category')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <ErrorMessage name="category_id" component="div" className="text-danger fs-6 mt-1" />
                </div>
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('item_group')}</label>
                    <select
                        className={`form-select form-select-solid ${formik.touched.item_group_id && formik.errors.item_group_id ? 'is-invalid' : ''}`}
                        name="item_group_id"
                        value={formik.values.item_group_id}
                        onChange={formik.handleChange}
                        required
                    >
                        <option value="">{t('select_item_group')}</option>
                        {itemGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    <ErrorMessage name="item_group_id" component="div" className="text-danger fs-6 mt-1" />
                </div>
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('minimum_stock_level')}</label>
                    <input
                        type="number"
                        className="form-control form-control-solid"
                        name="limit"
                        value={formik.values.limit || ''}
                        onChange={formik.handleChange}
                    />
                    <ErrorMessage name="limit" component="div" className="text-danger fs-6 mt-1" />
                </div>
                <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('limit_unit')}</label>
                    <select
                        className="form-select form-select-solid"
                        name="limit_unit_id"
                        value={formik.values.limit_unit_id}
                        onChange={formik.handleChange}
                    >
                        <option value="">{t('select_unit')}</option>
                        {unitsList.map((u: any) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <ErrorMessage name="limit_unit_id" component="div" className="text-danger fs-6 mt-1" />
                </div>
                {(type === 'raw' || type === 'serviceable') && (
                    <div className="col-md-4 fv-row">
                        <label className="form-check form-check-custom form-check-solid me-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="hasSellPrice"
                                checked={formik.values.hasSellPrice}
                                onChange={formik.handleChange}
                            />
                            <span className="form-check-label fw-semibold text-gray-700 fs-6">{t('add_selling_price')}</span>
                        </label>
                        {formik.values.hasSellPrice && (
                            <div className="mt-2">
                                <label className="fs-6 fw-semibold mb-2">{t('selling_price')}</label>
                                <input
                                    type="number"
                                    className="form-control form-control-solid"
                                    name="sell_price"
                                    value={formik.values.sell_price || ''}
                                    onChange={formik.handleChange}
                                />
                                <ErrorMessage name="sell_price" component="div" className="text-danger fs-6 mt-1" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="row g-4 mb-7">
                {isProduced && (
                    <>
                        <div className="col-md-4 fv-row">
                            <label className="fs-6 fw-semibold mb-2">{t('recipe_unit')}</label>
                            <select
                                className="form-select form-select-solid"
                                name="recipe_unit_id"
                                value={formik.values.recipe_unit_id}
                                onChange={formik.handleChange}
                                required
                            >
                                <option value="">{t('select_unit')}</option>
                                {unitsList.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                            <ErrorMessage name="recipe_unit_id" component="div" className="text-danger fs-6 mt-1" />
                        </div>
                        <div className="col-md-4 fv-row">
                            <label className="fs-6 fw-semibold mb-2">{t('recipe_quantity')}</label>
                            <input
                                type="number"
                                className="form-control form-control-solid"
                                name="recipe_quantity"
                                value={formik.values.recipe_quantity || ''}
                                onChange={formik.handleChange}
                                required
                            />
                            <ErrorMessage name="recipe_quantity" component="div" className="text-danger fs-6 mt-1" />
                        </div>
                        <div className="col-md-4 fv-row">
                            <label className="fs-6 fw-semibold mb-2">{t('to_inventory_warehouse')}</label>
                            <select
                                className={`form-select form-select-solid ${formik.touched.inventory_id && formik.errors.inventory_id ? 'is-invalid' : ''}`}
                                name="inventory_id"
                                value={formik.values.inventory_id}
                                onChange={formik.handleChange}
                                required
                            >
                                <option value="">{t('select_inventory')}</option>
                                {inventories.map(inv => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.name}
                                    </option>
                                ))}
                            </select>
                            <ErrorMessage name="inventory_id" component="div" className="text-danger fs-6 mt-1" />
                        </div>
                    </>
                )}
            </div>
            <div className="row mb-7">
                <div className="col-12 fv-row">
                    <label className="fs-6 fw-semibold mb-2">{t('description')}</label>
                    <textarea
                        className="form-control form-control-solid"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        rows={2}
                    />
                    <ErrorMessage name="description" component="div" className="text-danger fs-6 mt-1" />
                </div>
            </div>
        </>
    );
};

export default BasicInformation;