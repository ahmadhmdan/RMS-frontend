import React from 'react';
import { FieldArray, ErrorMessage } from 'formik';
import type { FormikErrors } from 'formik';
import ItemAutocomplete from './ItemAutocomplete';

interface IngredientItem {
    ingredient_id: string;
    unit_id: string;
    quantity: number;
    default_inventory_id: string;
    unit_price?: number;
}

interface Props {
    formik: any;
    itemsList: any[];
    unitsMap: any;
    inventories: any[];
    mode: string;
    priceType: 'average' | 'last';
    setPriceType: (type: 'average' | 'last') => void;
    t: (key: string) => string;
    ingredientsRowRefs: React.MutableRefObject<(HTMLInputElement | HTMLSelectElement | null)[][]>;
    handleIngredientsKeyDown: (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: IngredientItem) => void; remove: (index: number) => void }
    ) => void;
    setFocusAfterDeleteIngredients: (value: { row: number; field: number } | null) => void;
    handleUnitChange: (e: React.ChangeEvent<HTMLSelectElement>, index: number) => void;
    fetchUnits: (id: string) => void;
}

const ItemIngredientsTable: React.FC<Props> = ({
    formik,
    itemsList,
    unitsMap,
    inventories,
    mode,
    priceType,
    setPriceType,
    t,
    ingredientsRowRefs,
    handleIngredientsKeyDown,
    setFocusAfterDeleteIngredients,
    handleUnitChange,
    fetchUnits
}) => {
    return (
        <>
            <div className="position-relative ps-4">
                <div className="position-absolute start-0 top-0 w-4px h-100 bg-success rounded-2"></div>
                <div className="d-flex align-items-center gap-4 mb-6">
                    <h3 className="fw-bold mb-0">{t('item_ingredients')}</h3>
                    <div className="form-check form-check-custom form-check-solid">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="priceType"
                            id="average"
                            checked={priceType === 'average'}
                            onChange={() => setPriceType('average')}
                        />
                        <label className="form-check-label" htmlFor="average">
                            {t('average_price')}
                        </label>
                    </div>
                    <div className="form-check form-check-custom form-check-solid">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="priceType"
                            id="last"
                            checked={priceType === 'last'}
                            onChange={() => setPriceType('last')}
                        />
                        <label className="form-check-label" htmlFor="last">
                            {t('last_buy_price')}
                        </label>
                    </div>
                </div>
            </div>
            <div className="table-responsive mb-7">
                <table className={`table table-bordered excel-like-table-2 ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                    <thead>
                        <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                            <th className="text-center" style={{ width: '5%' }}></th>
                            <th className="text-center" style={{ width: '25%' }}>{t('ingredient')}</th>
                            <th className="text-center" style={{ width: '15%' }}>{t('unit')}</th>
                            <th className="text-center" style={{ width: '15%' }}>{t('quantity')}</th>
                            <th className="text-center" style={{ width: '15%' }}>{t('unit_price')}</th>
                            <th className="text-center" style={{ width: '20%' }}>{t('inventory')}</th>
                            <th className="text-center" style={{ width: '5%' }}></th>
                        </tr>
                    </thead>
                    <FieldArray name="ingredients">
                        {({ push, remove }) => (
                            <>
                                <tbody>
                                    {formik.values.ingredients.map((ingredient: IngredientItem, index: number) => {
                                        ingredientsRowRefs.current[index] = ingredientsRowRefs.current[index] || [];
                                        const currentUnits = unitsMap[ingredient.ingredient_id] || [];
                                        const ingredientErrors = Array.isArray(formik.errors.ingredients) ? formik.errors.ingredients[index] as FormikErrors<IngredientItem> : undefined;
                                        const hasIngredientError = formik.touched.ingredients?.[index]?.ingredient_id && !!ingredientErrors?.ingredient_id;
                                        const hasUnitError = formik.touched.ingredients?.[index]?.unit_id && !!ingredientErrors?.unit_id;
                                        const hasQuantityError = formik.touched.ingredients?.[index]?.quantity && !!ingredientErrors?.quantity;
                                        return (
                                            <tr key={index}>
                                                <td className="row-index" style={{ color: '#000000' }}>
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <ItemAutocomplete
                                                        value={ingredient.ingredient_id}
                                                        onChange={(id, selectedItem) => {
                                                            formik.setFieldValue(`ingredients.${index}.ingredient_id`, id);
                                                            formik.setFieldValue(`ingredients.${index}.default_inventory_id`, selectedItem?.default_inventory_id?.toString() || '');
                                                            if (id) {
                                                                fetchUnits(id);
                                                            }
                                                        }}
                                                        itemsList={itemsList}
                                                        onKeyDown={(e) => handleIngredientsKeyDown(e, index, 0, { push, remove })}
                                                        inputRef={(el: HTMLInputElement | null) => { ingredientsRowRefs.current[index][0] = el }}
                                                        hasError={hasIngredientError}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className={`form-select ${hasUnitError ? 'is-invalid' : ''}`}
                                                        name={`ingredients.${index}.unit_id`}
                                                        value={ingredient.unit_id}
                                                        onChange={(e) => handleUnitChange(e, index)}
                                                        onKeyDown={(e) => handleIngredientsKeyDown(e, index, 1, { push, remove })}
                                                        ref={(el) => { ingredientsRowRefs.current[index][1] = el }}
                                                    >
                                                        <option value="">{t('select_unit')}</option>
                                                        {currentUnits.map((u: any) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className={`form-control text-end ${hasQuantityError ? 'is-invalid' : ''}`}
                                                        name={`ingredients.${index}.quantity`}
                                                        value={ingredient.quantity || ''}
                                                        onChange={formik.handleChange}
                                                        onKeyDown={(e) => handleIngredientsKeyDown(e, index, 2, { push, remove })}
                                                        ref={(el) => { ingredientsRowRefs.current[index][2] = el }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control text-end"
                                                        value={ingredient.unit_price ?? 0}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        name={`ingredients.${index}.default_inventory_id`}
                                                        value={ingredient.default_inventory_id}
                                                        onChange={formik.handleChange}
                                                        onKeyDown={(e) => handleIngredientsKeyDown(e, index, 3, { push, remove })}
                                                        ref={(el) => { ingredientsRowRefs.current[index][3] = el }}
                                                    >
                                                        <option value="">{t('select_inventory')}</option>
                                                        {inventories.map(inv => (
                                                            <option key={inv.id} value={inv.id}>
                                                                {inv.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="text-center">
                                                    {formik.values.ingredients.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-active-color-danger btn-sm"
                                                            onClick={() => {
                                                                let targetRow = index;
                                                                let targetField = 0;
                                                                if (index === formik.values.ingredients.length - 1 && index > 0) {
                                                                    targetRow = index - 1;
                                                                }
                                                                remove(index);
                                                                setFocusAfterDeleteIngredients({ row: targetRow, field: targetField });
                                                            }}
                                                        >
                                                            <i className="ki-outline ki-trash fs-2"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={7} className="p-3 text-start">
                                            <button
                                                type="button"
                                                className="btn btn-light btn-sm"
                                                onClick={() => push({ ingredient_id: '', unit_id: '', quantity: 0, default_inventory_id: '' })}
                                            >
                                                <i className="ki-outline ki-plus fs-2" style={{ paddingLeft: '0px' }}></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </>
                        )}
                    </FieldArray>
                </table>
                <ErrorMessage name="ingredients">
                    {(errorMessage) => (
                        typeof errorMessage === 'string' ? (
                            <div className="text-danger fs-6 mt-1">{errorMessage}</div>
                        ) : null
                    )}
                </ErrorMessage>
            </div>
        </>
    );
};

export default ItemIngredientsTable;