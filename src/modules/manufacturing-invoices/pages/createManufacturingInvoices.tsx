import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FieldArray, FormikProvider, ErrorMessage } from 'formik';
import type { FormikErrors } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../../core/hooks/useTheme';
import { ROUTES } from '../../../core/utils/constants';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useInvoiceData } from '../hooks/useCreateManufacturing';
import { getInvoiceNumber, createInvoice } from '../services/manufacturing-invoices.service'
import '../../invoices/components/CreateInvoice.css';
import { ItemAutocomplete } from '../../../core/components/invoices/ItemAutocomplete';
import type { InvoiceLineItemBase, InventoryInvoiceFormValues } from '../../../core/types/invoice';

type ManufacturingItem = InvoiceLineItemBase;

type FormValues = InventoryInvoiceFormValues<ManufacturingItem>;

const CreateManufacturingInvoice: React.FC = () => {
    const rowRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
    const [focusAfterDelete, setFocusAfterDelete] = useState<{ row: number; field: number } | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { inventories, itemsList, unitsMap, fetchUnits, loading } = useInvoiceData();
    //
    useEffect(() => {
        const fetchInvoiceNo = async () => {
            try {
                const res = await getInvoiceNumber();
                if (res.success) {
                    setInvoiceNumber(res.invoice_no.toString());
                }
            } catch (err) {
                console.error('Failed to fetch invoice number', err);
            }
        };
        fetchInvoiceNo();
    }, []);

    const validationSchema = Yup.object().shape({
        inventory: Yup.string().required(t('inventory_is_required')),
        invoiceDate: Yup.date().required(t('invoice_date_is_required')),
        description: Yup.string().optional(),
        items: Yup.array().of(
            Yup.object().shape({
                item_id: Yup.string().required(t('required')),
                unit_id: Yup.string().required(t('required')),
                quantity: Yup.number().positive(t('quantity_must_be_positive')).required(t('required')),
            })
        ).min(1, 'At least one item is required'),
    });

    const formatNumber = (value: number | string, decimals: number = 2): string => {
        const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    };

    const formik = useFormik<FormValues>({
        initialValues: {
            inventory: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            description: '',
            items: [{ item_id: '', unit_id: '', quantity: 0 }],
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const payload = {
                invoice_type: 5,
                invoice_no: invoiceNumber,
                invoice_date: values.invoiceDate,
                inventory_id: values.inventory,
                invoice_description: values.description || null,
                ignore_quantity: true,
                invoice_details: values.items
                    .map((item) => ({
                        item_id: item.item_id,
                        unit_id: item.unit_id,
                        inventory_id: values.inventory,
                        quantity: item.quantity.toString(),
                    }))
                    .filter((detail) => detail.item_id),
            };
            try {
                await createInvoice(payload);
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('manufacturing_invoice_created_successfully'),
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => {
                    navigate(ROUTES.MANUFACTURING_INVOICE);
                });
            } catch (error: any) {
                console.error('Error creating manufacturing invoice:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: error.response?.data?.message || t('error_creating_invoice'),
                });
            }
        },
    });

    const { values, touched, errors } = formik;

    useEffect(() => {
        values.items.forEach((it, index) => {
            if (it.item_id && unitsMap[it.item_id]) {
                const units = unitsMap[it.item_id];
                const defaultUnit = units.find((u: any) => u.is_default);
                if (defaultUnit && !it.unit_id) {
                    formik.setFieldValue(`items.${index}.unit_id`, defaultUnit.id.toString());
                }
            }
        });
    }, [unitsMap, values.items]);

    useEffect(() => {
        const lastRowIndex = values.items.length - 1;
        rowRefs.current[lastRowIndex]?.[0]?.focus();
    }, [values.items.length]);

    // Refocus after row deletion
    useEffect(() => {
        if (focusAfterDelete !== null) {
            rowRefs.current[focusAfterDelete.row]?.[focusAfterDelete.field]?.focus();
            setFocusAfterDelete(null);
        }
    }, [focusAfterDelete, values.items]);

    const fieldsPerRow = 3;

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: ManufacturingItem) => void; remove: (index: number) => void }
    ) => {
        if (['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }

        const currentRowRefs = rowRefs.current[rowIndex];
        if (!currentRowRefs) return;

        // Handle Delete key for row deletion from any field
        if (e.key === 'Delete' && values.items.length > 1) {
            let targetRow = rowIndex;
            let targetField = fieldIndex;
            if (rowIndex === values.items.length - 1 && rowIndex > 0) {
                targetRow = rowIndex - 1;
                targetField = 0;
            }
            arrayHelpers.remove(rowIndex);
            setFocusAfterDelete({ row: targetRow, field: targetField });
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab') {
            if (fieldIndex < fieldsPerRow - 1) {
                // Move to next field in same row
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < values.items.length - 1) {
                // Move to first field of next row
                rowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                // Create new row at the end
                arrayHelpers.push({ item_id: '', unit_id: '', quantity: 0 });
            }
            return;
        }

        if (e.key === 'ArrowRight' && fieldIndex > 0) {
            currentRowRefs[fieldIndex - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && fieldIndex < fieldsPerRow - 1) {
            currentRowRefs[fieldIndex + 1]?.focus();
        }
    };

    if (loading) {
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
                    <h2 className="fw-bold fs-2 mb-0">{t('today_preparation')}</h2>
                    {invoiceNumber && <span className="fw-bold fs-3">{invoiceNumber}#</span>}
                </div>
                <div className="card-toolbar">
                    <button className="btn btn-light" onClick={() => navigate(-1)}>
                        <i className="ki-outline ki-arrow-left fs-2" style={{ paddingLeft: '0px' }}></i>
                    </button>
                </div>
            </div>
            <div className="card-body p-9">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row mb-7 g-4">
                            <div className="col-md-4 fv-row">
                                <label className="fs-6 fw-semibold mb-2">{t('inventory_warehouse')}</label>
                                <select
                                    className="form-select form-select-solid"
                                    name="inventory"
                                    value={values.inventory}
                                    onChange={formik.handleChange}
                                    required
                                >
                                    <option value="">{t('select_inventory')}</option>
                                    {inventories.map((inv: any) => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage name="inventory" component="div" className="text-danger fs-6 mt-1" />
                            </div>
                            <div className="col-md-4 fv-row">
                                <label className="fs-6 fw-semibold mb-2">{t('invoice_date')}</label>
                                <input
                                    type="date"
                                    className="form-control form-control-solid"
                                    name="invoiceDate"
                                    value={values.invoiceDate}
                                    onChange={formik.handleChange}
                                />
                                <ErrorMessage name="invoiceDate" component="div" className="text-danger fs-6 mt-1" />
                            </div>
                        </div>
                        <div className="row mb-7">
                            <div className="col-12 fv-row">
                                <label className="fs-6 fw-semibold mb-2">{t('description')}</label>
                                <textarea
                                    className="form-control form-control-solid"
                                    name="description"
                                    value={values.description}
                                    onChange={formik.handleChange}
                                    rows={2}
                                />
                                <ErrorMessage name="description" component="div" className="text-danger fs-6 mt-1" />
                            </div>
                        </div>
                        <div className="separator separator-dashed my-8"></div>
                        <div className="table-responsive">
                            <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                <thead>
                                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                        <th className="text-center" style={{ width: '35%' }}>{t('item')}</th>
                                        <th className="text-center" style={{ width: '30%' }}>{t('unit')}</th>
                                        <th className="text-center" style={{ width: '25%' }}>{t('qty')}</th>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <>
                                            <tbody>
                                                {values.items.map((item, index) => {
                                                    rowRefs.current[index] = rowRefs.current[index] || [];
                                                    const currentUnits = unitsMap[item.item_id] || [];
                                                    const itemErrors = Array.isArray(errors.items) ? errors.items[index] as FormikErrors<ManufacturingItem> : undefined;
                                                    const hasItemError = touched.items?.[index]?.item_id && !!itemErrors?.item_id;
                                                    const hasUnitError = touched.items?.[index]?.unit_id && !!itemErrors?.unit_id;
                                                    const hasQuantityError = touched.items?.[index]?.quantity && !!itemErrors?.quantity;
                                                    return (
                                                        <tr key={index}>
                                                            <td className="row-index" style={{ color: '#000000' }
                                                            }>
                                                                {index + 1}
                                                            </td>
                                                            <td>
                                                                <ItemAutocomplete
                                                                    value={item.item_id}
                                                                    onChange={(id) => {
                                                                        formik.setFieldValue(`items.${index}.item_id`, id);
                                                                        if (id) {
                                                                            fetchUnits(id);
                                                                        }
                                                                    }}
                                                                    itemsList={itemsList}
                                                                    onKeyDown={(e) => handleKeyDown(e, index, 0, { push, remove })}
                                                                    inputRef={(el: HTMLInputElement | null) => { rowRefs.current[index][0] = el }}
                                                                    hasError={hasItemError}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className={`form-select ${hasUnitError ? 'is-invalid' : ''}`}
                                                                    name={`items.${index}.unit_id`}
                                                                    value={item.unit_id}
                                                                    onChange={formik.handleChange}
                                                                    onKeyDown={(e) => handleKeyDown(e, index, 1, { push, remove })}
                                                                    ref={(el) => { rowRefs.current[index][1] = el }}
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
                                                                    name={`items.${index}.quantity`}
                                                                    value={item.quantity || ''}
                                                                    onChange={formik.handleChange}
                                                                    onKeyDown={(e) => handleKeyDown(e, index, 2, { push, remove })}
                                                                    ref={(el) => { rowRefs.current[index][2] = el }}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                {values.items.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-icon btn-active-color-danger btn-sm"
                                                                        onClick={() => {
                                                                            let targetRow = index;
                                                                            let targetField = 0;
                                                                            if (index === values.items.length - 1 && index > 0) {
                                                                                targetRow = index - 1;
                                                                            }
                                                                            remove(index);
                                                                            setFocusAfterDelete({ row: targetRow, field: targetField });
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
                                                    <td colSpan={5} className="p-3 text-start">
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-sm"
                                                            onClick={() => push({ item_id: '', unit_id: '', quantity: 0 })}
                                                        >
                                                            <i className="ki-outline ki-plus fs-2" style={{ paddingLeft: '0px' }} ></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </>
                                    )}
                                </FieldArray>
                            </table>
                            <ErrorMessage name="items">
                                {(errorMessage) => (
                                    typeof errorMessage === 'string' ? (
                                        <div className="text-danger fs-6 mt-1">{errorMessage}</div>
                                    ) : null
                                )}
                            </ErrorMessage>
                        </div>
                        <div className="separator separator-dashed my-8"></div>
                        {/* preparation Summary */}
                        <div className="row justify-content-end mt-8">
                            <div className="col-lg-6 col-xl-6">
                                <div className="bg-light rounded-4 p-6 shadow-sm">
                                    <h3 className="fw-bold text-dark mb-6">{t("preparation_summary")}</h3>
                                    <div className="d-flex justify-content-between align-items-center mb-5">
                                        <span className="fs-4 fw-semibold text-gray-700">{t("total_items")}</span>
                                        <span className="fs-3 fw-bold text-dark">
                                            {formatNumber(values.items.filter(item => item.item_id && item.quantity > 0).length)}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-7">
                                        <span className="fs-4 fw-semibold text-gray-700">{t("total_quantity")}</span>
                                        <span className="fs-3 fw-bold text-dark">
                                            {formatNumber(values.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0).toFixed(2))}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center pt-5 border-top border-4 border-primary">
                                        <h3 className="mb-0 fw-bolder text-dark">{t("total_produced")}</h3>
                                        <h2 className="mb-0 fw-bolder text-primary">
                                            {formatNumber(values.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0).toFixed(2))}
                                            <span className="fs-4 text-gray-600 ms-2">{t("units")}</span>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-start mt-12">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={formik.isSubmitting}>
                                {formik.isSubmitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </FormikProvider>
            </div>
        </div>
    );
};

export default CreateManufacturingInvoice;