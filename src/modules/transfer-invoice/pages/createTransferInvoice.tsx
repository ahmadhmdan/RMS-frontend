import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FieldArray, FormikProvider, ErrorMessage } from 'formik';
import type { FormikErrors } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../../core/hooks/useTheme';
import { ROUTES } from '../../../core/utils/constants';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useInvoiceData } from '../hooks/useCreateTransfer';
import { getInvoiceNumber, createInvoice, getItemsByInventory } from '../services/transfer-invoices.service'
import '../../invoices/components/CreateInvoice.css';

interface TransferItem {
    item_id: string;
    unit_id: string;
    quantity: number;
}

interface FormValues {
    fromInventory: string;
    toInventory: string;
    invoiceDate: string;
    description: string;
    items: TransferItem[];
}

interface ItemAutocompleteProps {
    value: string;
    onChange: (id: string) => void;
    itemsList: any[];
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    inputRef: React.Ref<HTMLInputElement>;
    hasError?: boolean;
}

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({ value, onChange, itemsList, onKeyDown, inputRef, hasError }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selected = itemsList.find(it => it.id === value);
        if (selected) {
            setSearchTerm(selected.name);
        } else {
            setSearchTerm('');
        }
    }, [value, itemsList]);

    const filteredItems = itemsList.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        // Open when user starts typing
        if (term.length > 0) {
            setIsOpen(true);
            setHighlightedIndex(0);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (id: string, name: string) => {
        onChange(id);
        setSearchTerm(name);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputClick = () => {
        setIsOpen(true);
        setHighlightedIndex(0);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle left/right arrow keys - pass to parent for navigation and close dropdown
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        // Handle Delete key - pass to parent for row deletion
        if (e.key === 'Delete') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        // Handle Tab key - pass to parent for navigation (will create new row if at end)
        if (e.key === 'Tab') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                // Always open with ArrowDown key when focused
                setIsOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
                return;
            } else if (e.key === 'ArrowUp') {
                // Also allow opening with ArrowUp for consistency
                setIsOpen(true);
                setHighlightedIndex(filteredItems.length - 1); // Start from bottom
                e.preventDefault();
                return;
            }
            // For other keys when dropdown is closed, pass to parent
            onKeyDown(e);
            return;
        }

        // Handle keys when dropdown is open
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < filteredItems.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev > 0 ? prev - 1 : filteredItems.length - 1
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                const selectedItem = filteredItems[highlightedIndex];
                handleSelect(selectedItem.id, selectedItem.name);
            } else {
                setIsOpen(false);
            }
            // After selecting with Enter, pass to parent for potential navigation
            onKeyDown(e);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setHighlightedIndex(-1);
        } else {
            // For other keys, pass to parent but keep dropdown open
            onKeyDown(e);
        }
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0) {
            const dropdown = dropdownRef.current;
            if (dropdown) {
                const items = dropdown.querySelectorAll('li');
                if (items[highlightedIndex]) {
                    items[highlightedIndex].scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="position-relative" ref={dropdownRef}>
            <input
                type="text"
                className={`form-control ${hasError ? 'is-invalid' : ''}`}
                value={searchTerm}
                onChange={handleInputChange}
                onClick={handleInputClick}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                placeholder={t('select_item')}
            />
            {isOpen && filteredItems.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        cursor: 'pointer'
                    }}
                >
                    {filteredItems.map((it, idx) => (
                        <li
                            key={it.id}
                            className={`list-group-item ${idx === highlightedIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(it.id, it.name)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            {it.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const CreateTransferInvoice: React.FC = () => {
    const rowRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
    const [focusAfterDelete, setFocusAfterDelete] = useState<{ row: number; field: number } | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [itemsList, setItemsList] = useState<any[]>([]);
    const prevFromInventory = useRef<string>('');
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { inventories, unitsMap, fetchUnits, loading } = useInvoiceData();
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
        fromInventory: Yup.string().required(t('from_inventory_is_required')),
        toInventory: Yup.string().required(t('to_inventory_is_required')),
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
            fromInventory: '',
            toInventory: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            description: '',
            items: [{ item_id: '', unit_id: '', quantity: 0 }],
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const payload = {
                invoice_type: 3,
                invoice_no: invoiceNumber,
                invoice_date: values.invoiceDate,
                from_inventory_id: values.fromInventory,
                to_inventory_id: values.toInventory,
                invoice_description: values.description || null,
                ignore_quantity: true,
                invoice_details: values.items
                    .map((item) => ({
                        item_id: item.item_id,
                        unit_id: item.unit_id,
                        inventory_id: values.fromInventory,
                        quantity: item.quantity.toString(),
                    }))
                    .filter((detail) => detail.item_id),
            };
            try {
                await createInvoice(payload);
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('transfer_invoice_created_successfully'),
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => {
                    navigate(ROUTES.TRANSFER_INVOICE);
                });
            } catch (error: any) {
                console.error('Error creating transfer invoice:', error);
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
        if (values.fromInventory && values.fromInventory !== prevFromInventory.current) {
            formik.setFieldValue('items', [{ item_id: '', unit_id: '', quantity: 0 }]);
            prevFromInventory.current = values.fromInventory;
            const fetchItems = async () => {
                try {
                    const res = await getItemsByInventory(Number(values.fromInventory));
                    setItemsList(res.items.map((item: any) => ({ id: item.item_id.toString(), name: item.name })));
                } catch (err) {
                    console.error('Failed to fetch items', err);
                }
            };
            fetchItems();
        } else if (!values.fromInventory) {
            setItemsList([]);
            formik.setFieldValue('items', [{ item_id: '', unit_id: '', quantity: 0 }]);
        }
    }, [values.fromInventory]);

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
        arrayHelpers: { push: (obj: TransferItem) => void; remove: (index: number) => void }
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
                    <h2 className="fw-bold fs-2 mb-0">{t('transfer_invoice')}</h2>
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
                                <label className="fs-6 fw-semibold mb-2">{t('from_inventory_warehouse')}</label>
                                <select
                                    className="form-select form-select-solid"
                                    name="fromInventory"
                                    value={values.fromInventory}
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
                                <ErrorMessage name="fromInventory" component="div" className="text-danger fs-6 mt-1" />
                            </div>
                            <div className="col-md-4 fv-row">
                                <label className="fs-6 fw-semibold mb-2">{t('to_inventory_warehouse')}</label>
                                <select
                                    className="form-select form-select-solid"
                                    name="toInventory"
                                    value={values.toInventory}
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
                                <ErrorMessage name="toInventory" component="div" className="text-danger fs-6 mt-1" />
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
                                                    const itemErrors = Array.isArray(errors.items) ? errors.items[index] as FormikErrors<TransferItem> : undefined;
                                                    const hasItemError = touched.items?.[index]?.item_id && !!itemErrors?.item_id;
                                                    const hasUnitError = touched.items?.[index]?.unit_id && !!itemErrors?.unit_id;
                                                    const hasQuantityError = touched.items?.[index]?.quantity && !!itemErrors?.quantity;
                                                    return (
                                                        <tr key={index}>
                                                            <td className="row-index" style={{ color: '#000000' }}>
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
                        {/* Transfer Summary */}
                        <div className="row justify-content-end mt-8">
                            <div className="col-lg-6 col-xl-6">
                                <div className="bg-light rounded-4 p-6 shadow-sm">
                                    <h3 className="fw-bold text-dark mb-6">{t("transfer_summary")}</h3>
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
                                        <h3 className="mb-0 fw-bolder text-dark">{t("total")}</h3>
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

export default CreateTransferInvoice;