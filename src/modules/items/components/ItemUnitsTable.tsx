import React from 'react';
import { FieldArray, ErrorMessage } from 'formik';
import type { FormikErrors } from 'formik';

interface UnitItem {
    unit_id: string;
    fold: number;
    is_primary: boolean;
    is_default: boolean;
}

interface Props {
    formik: any;
    unitsList: any[];
    mode: string;
    t: (key: string) => string;
    handlePrimaryChange: (index: number, checked: boolean) => void;
    handleDefaultChange: (index: number, checked: boolean) => void;
    unitsRowRefs: React.MutableRefObject<(HTMLInputElement | HTMLSelectElement | null)[][]>;
    handleUnitsKeyDown: (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: UnitItem) => void; remove: (index: number) => void }
    ) => void;
    setFocusAfterDeleteUnits: (value: { row: number; field: number } | null) => void;
    setModalShow: (show: boolean) => void;
}

const ItemUnitsTable: React.FC<Props> = ({
    formik,
    unitsList,
    mode,
    t,
    handlePrimaryChange,
    handleDefaultChange,
    unitsRowRefs,
    handleUnitsKeyDown,
    setFocusAfterDeleteUnits,
    setModalShow
}) => {
    const formatNumber = (x: any) => x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
    return (
        <>
            <div className="position-relative">
                <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-primary"></div>
                <h3 className="fw-bold mb-6 ps-4">{t('item_units')}</h3>
            </div>
            <div className="table-responsive mb-7">
                <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                    <thead>
                        <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                            <th className="text-center" style={{ width: '5%' }}></th>
                            <th className="text-center" style={{ width: '40%' }}>{t('unit')}</th>
                            <th className="text-center" style={{ width: '20%' }}>{t('conversion')}</th>
                            <th className="text-center" style={{ width: '15%' }}>{t('primary')}</th>
                            <th className="text-center" style={{ width: '15%' }}>{t('default')}</th>
                            <th className="text-center" style={{ width: '5%' }}></th>
                        </tr>
                    </thead>
                    <FieldArray name="units">
                        {({ push, remove }) => (
                            <>
                                <tbody>
                                    {formik.values.units.map((unit: UnitItem, index: number) => {
                                        unitsRowRefs.current[index] = unitsRowRefs.current[index] || [];
                                        const unitErrors = Array.isArray(formik.errors.units) ? formik.errors.units[index] as FormikErrors<UnitItem> : undefined;
                                        const hasUnitError = formik.touched.units?.[index]?.unit_id && !!unitErrors?.unit_id;
                                        const hasFoldError = formik.touched.units?.[index]?.fold && !!unitErrors?.fold;
                                        return (
                                            <tr key={index}>
                                                <td className="row-index" style={{ color: '#000000' }}>
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <select
                                                        className={`form-select ${hasUnitError ? 'is-invalid' : ''}`}
                                                        name={`units.${index}.unit_id`}
                                                        value={unit.unit_id}
                                                        onChange={formik.handleChange}
                                                        onKeyDown={(e) => handleUnitsKeyDown(e, index, 0, { push, remove })}
                                                        ref={(el) => { unitsRowRefs.current[index][0] = el }}
                                                    >
                                                        <option value="">{t('select_unit')}</option>
                                                        {unitsList.map((u: any) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className={`form-control text-end ${hasFoldError ? 'is-invalid' : ''}`}
                                                        name={`units.${index}.fold`}
                                                        value={formatNumber(unit.fold)}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/,/g, '');
                                                            const num = parseFloat(rawValue);
                                                            formik.setFieldValue(`units.${index}.fold`, isNaN(num) ? '' : num);
                                                        }}
                                                        onKeyDown={(e) => handleUnitsKeyDown(e, index, 1, { push, remove })}
                                                        ref={(el) => { unitsRowRefs.current[index][1] = el }}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`units.${index}.is_primary`}
                                                        checked={unit.is_primary}
                                                        onChange={(e) => {
                                                            handlePrimaryChange(index, e.target.checked);
                                                            if (e.target.checked) {
                                                                formik.setFieldValue(`units.${index}.fold`, 1);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => handleUnitsKeyDown(e, index, 2, { push, remove })}
                                                        ref={(el) => { unitsRowRefs.current[index][2] = el }}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`units.${index}.is_default`}
                                                        checked={unit.is_default}
                                                        onChange={(e) => handleDefaultChange(index, e.target.checked)}
                                                        onKeyDown={(e) => handleUnitsKeyDown(e, index, 3, { push, remove })}
                                                        ref={(el) => { unitsRowRefs.current[index][3] = el }}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    {formik.values.units.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-active-color-danger btn-sm"
                                                            onClick={() => {
                                                                let targetRow = index;
                                                                let targetField = 0;
                                                                if (index === formik.values.units.length - 1 && index > 0) {
                                                                    targetRow = index - 1;
                                                                }
                                                                remove(index);
                                                                setFocusAfterDeleteUnits({ row: targetRow, field: targetField });
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
                                        <td colSpan={6} className="p-3 text-start">
                                            <button
                                                type="button"
                                                className="btn btn-light btn-sm"
                                                onClick={() => push({ unit_id: '', fold: 0, is_primary: false, is_default: false })}
                                            >
                                                <i className="ki-outline ki-plus fs-2" style={{ paddingLeft: '0px' }}></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-light btn-sm ms-2"
                                                onClick={() => setModalShow(true)}
                                            >
                                                <i className="ki-outline ki-plus-square fs-2" style={{ paddingLeft: '0px' }}></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </>
                        )}
                    </FieldArray>
                </table>
                <ErrorMessage name="units">
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

export default ItemUnitsTable;