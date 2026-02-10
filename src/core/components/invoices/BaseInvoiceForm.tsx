import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import '../../../modules/invoices/components/CreateInvoice.css';

interface BaseItem {
    item_id: string;
    unit_id: string;
}

interface BaseInvoiceFormProps<T extends BaseItem> {
    title: string;
    successMessage: string;
    navigateRoute: string;
    initialValues: any;
    itemSchema: T;
    fieldsPerRow: number;

    // Form sections
    renderTopSection: (formik: any) => React.ReactNode;
    renderSummary: (formik: any) => React.ReactNode;

    // Table column definitions
    columns: Array<{
        key: string;
        width: string;
        header: string;
        render: (params: {
            item: T;
            index: number;
            formik: any;
            handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
            arrayHelpers: any;
            inputRef: React.Ref<HTMLElement>;
            fieldIndex: number;
        }) => React.ReactNode;
    }>;

    // Data and services
    useDataHook: () => any;
    getInvoiceNumberService: () => Promise<any>;
    createInvoiceService: (payload: any) => Promise<any>;
    transformPayload: (values: any, invoiceNumber: string) => any;
}

export function BaseInvoiceForm<T extends BaseItem>({
    title,
    successMessage,
    navigateRoute,
    initialValues,
    itemSchema,
    fieldsPerRow,
    renderTopSection,
    renderSummary,
    columns,
    useDataHook,
    getInvoiceNumberService,
    createInvoiceService,
    transformPayload,
}: BaseInvoiceFormProps<T>) {
    const rowRefs = useRef<(HTMLElement | null)[][]>([]);
    const [focusAfterDelete, setFocusAfterDelete] = useState<{ row: number; field: number } | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();

    const data = useDataHook();
    const { unitsMap, fetchUnits, loading, itemsMap, currencies } = data;

    useEffect(() => {
        getInvoiceNumberService().then(res => {
            if (res.success) setInvoiceNumber(res.invoice_no.toString());
        }).catch(console.error);
    }, []);

    const formik = useFormik({
        initialValues,
        onSubmit: async (values) => {
            try {
                const payload = transformPayload(values, invoiceNumber);
                await createInvoiceService(payload);
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: successMessage,
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => navigate(navigateRoute));
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: error.response?.data?.message || t('error_creating_invoice'),
                });
            }
        },
    });

    useEffect(() => {
        if (currencies?.length > 0 && !formik.values.currency_id) {
            const primary = currencies.find((c: any) => c.is_primary);
            if (primary) {
                formik.setFieldValue('currency_id', primary.id.toString());
                formik.setFieldValue('exchange', primary.exchange_rate);
            }
        }
    }, [currencies, formik]);

    useEffect(() => {
        formik.values.items.forEach((it: T) => {
            if (it.item_id && !unitsMap[it.item_id]) {
                fetchUnits(it.item_id);
            }
        });
    }, [formik.values.items, unitsMap, fetchUnits]);

    useEffect(() => {
        formik.values.items.forEach((it: T, idx: number) => {
            if (it.item_id && unitsMap[it.item_id] && !it.unit_id) {
                const units = unitsMap[it.item_id];
                const defaultUnit = units.find((u: any) => u.is_default);
                if (defaultUnit) {
                    formik.setFieldValue(`items.${idx}.unit_id`, defaultUnit.id.toString());
                    const item = itemsMap?.[it.item_id];
                    if (item) {
                        const adjustedPrice = (item.last_price || 0) / (defaultUnit.fold || 1);
                        formik.setFieldValue(`items.${idx}.unit_price`, adjustedPrice);
                    }
                }
            }
        });
    }, [formik.values.items, unitsMap, itemsMap, formik]);

    useEffect(() => {
        const lastRowIndex = formik.values.items.length - 1;
        rowRefs.current[lastRowIndex]?.[0]?.focus();
    }, [formik.values.items.length]);

    useEffect(() => {
        if (focusAfterDelete !== null) {
            rowRefs.current[focusAfterDelete.row]?.[focusAfterDelete.field]?.focus();
            setFocusAfterDelete(null);
        }
    }, [focusAfterDelete, formik.values.items]);

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: T) => void; remove: (index: number) => void }
    ) => {
        if (['Enter', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }

        const currentRowRefs = rowRefs.current[rowIndex];
        if (!currentRowRefs) return;

        if (e.key === 'Delete' && formik.values.items.length > 1) {
            const targetField = fieldIndex;
            let targetRow = rowIndex;
            if (rowIndex === formik.values.items.length - 1) targetRow--;
            arrayHelpers.remove(rowIndex);
            setFocusAfterDelete({ row: targetRow, field: targetField });
            return;
        }

        if (e.key === 'ArrowRight' && fieldIndex > 0) {
            currentRowRefs[fieldIndex - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && fieldIndex < fieldsPerRow - 1) {
            currentRowRefs[fieldIndex + 1]?.focus();
        } else if (e.key === 'Enter') {
            if (fieldIndex < fieldsPerRow - 1) {
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < formik.values.items.length - 1) {
                rowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                arrayHelpers.push({ ...itemSchema });
            }
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
                    <h2 className="fw-bold fs-2 mb-0">{title}</h2>
                    {invoiceNumber && <span className="fw-bold fs-3">{invoiceNumber}#</span>}
                </div>
            </div>
            <div className="card-body p-9">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit}>
                        {renderTopSection(formik)}

                        <div className="separator separator-dashed my-8"></div>

                        <div className="table-responsive">
                            <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                <thead>
                                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                        {columns.map(col => (
                                            <th key={col.key} className="text-center" style={{ width: col.width }}>
                                                {col.header}
                                            </th>
                                        ))}
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <FieldArray name="items">
                                    {({ push, remove }) => {
                                        const arrayHelpers = { push, remove };
                                        return (
                                            <>
                                                <tbody>
                                                    {formik.values.items.map((item: T, index: number) => {
                                                        rowRefs.current[index] = rowRefs.current[index] || [];
                                                        return (
                                                            <tr key={index}>
                                                                <td className="row-index" style={{ color: '#000000' }}>
                                                                    {index + 1}
                                                                </td>
                                                                {columns.map((col, fieldIndex) => (
                                                                    <td key={col.key}>
                                                                        {col.render({
                                                                            item,
                                                                            index,
                                                                            formik,
                                                                            handleKeyDown: (e) => handleKeyDown(e, index, fieldIndex, arrayHelpers),
                                                                            arrayHelpers,
                                                                            inputRef: (el) => { rowRefs.current[index][fieldIndex] = el; },
                                                                            fieldIndex,
                                                                        })}
                                                                    </td>
                                                                ))}
                                                                <td className="text-center">
                                                                    {formik.values.items.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-icon btn-active-color-danger btn-sm"
                                                                            onClick={() => {
                                                                                let targetRow = index;
                                                                                let targetField = 0;
                                                                                if (index === formik.values.items.length - 1 && index > 0) {
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
                                                        <td colSpan={columns.length + 2} className="p-3 text-start">
                                                            <button
                                                                type="button"
                                                                className="btn btn-light-primary btn-sm"
                                                                onClick={() => push({ ...itemSchema })}
                                                            >
                                                                <i className="ki-outline ki-plus fs-3"></i>
                                                                {t('add')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </>
                                        );
                                    }}
                                </FieldArray>
                            </table>
                        </div>

                        <div className="separator separator-dashed my-8"></div>

                        {renderSummary(formik)}

                        <div className="d-flex justify-content-start mt-12">
                            <button type="submit" className="btn btn-primary btn-lg">
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </FormikProvider>
            </div>
        </div>
    );
}