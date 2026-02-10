import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FieldArray, FormikProvider, ErrorMessage } from 'formik';
import type { FormikErrors } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../../core/hooks/useTheme';
import { ROUTES } from '../../../core/utils/constants'
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useInvoiceData } from '../hooks/useCreateSellInvoices';
import { createInvoice, getInvoiceNumber } from '../services/createSellInvoices.service';
import '../components/CreateInvoice.css';

interface InvoiceItem {
    item_id: string;
    unit_id: string;
    quantity: number;
    unit_price: number;
}

interface FormValues {
    supplier: string;
    invoiceDate: string;
    inventory: string;
    discountPercent: number;
    discountAmount: number;
    items: InvoiceItem[];
    pay_method: string;
    description: string;
    currency_id: string;
    exchange: number;
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
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        if (e.key === 'Delete') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        if (e.key === 'Tab') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
                return;
            } else if (e.key === 'ArrowUp') {
                setIsOpen(true);
                setHighlightedIndex(filteredItems.length - 1);
                e.preventDefault();
                return;
            }
            onKeyDown(e);
            return;
        }

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
            onKeyDown(e);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setHighlightedIndex(-1);
        } else {
            onKeyDown(e);
        }
    };

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

const SellInvoice: React.FC = () => {
    const rowRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
    const [focusAfterDelete, setFocusAfterDelete] = useState<{ row: number; field: number } | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [lastDiscountType, setLastDiscountType] = useState<'percent' | 'amount' | null>(null);
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { suppliers, inventories, itemsList, itemsMap, currencies, unitsMap, fetchUnits, loading } = useInvoiceData();
    const payMethods = ['Debit', 'Credit', 'Bank Transfer', 'Credit Card'];

    const validationSchema = Yup.object().shape({
        supplier: Yup.string().when('pay_method', {
            is: (value: string) => value === 'Debit',
            then: (schema) => schema.required(t('supplier_is_required')),
            otherwise: (schema) => schema.optional().nullable(),
        }),
        invoiceDate: Yup.date().required(t('invoice_date_is_required')),
        inventory: Yup.string().required(t('inventory_is_required')),
        pay_method: Yup.string().required(t('payment_method_is_required')),
        currency_id: Yup.string().required(t('currency_is_required')),
        exchange: Yup.number().positive(t('exchange_rate_must_be_positive')).required(t('exchange_rate_is_required')),
        description: Yup.string().optional(),
        discountPercent: Yup.number().optional(),
        discountAmount: Yup.number().optional(),
        items: Yup.array().of(
            Yup.object().shape({
                item_id: Yup.string().required(t('required')),
                unit_id: Yup.string().required(t('required')),
                quantity: Yup.number().positive(t('quantity_must_be_positive')).required(t('required')),
                // unit_price: Yup.number().positive(t('price_must_be_positive')).required(t('required')),
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

    const formik = useFormik<FormValues>({
        initialValues: {
            supplier: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            inventory: '',
            discountPercent: 0,
            discountAmount: 0,
            items: [{ item_id: '', unit_id: '', quantity: 0, unit_price: 0 }],
            pay_method: 'Cash',
            description: '',
            currency_id: '',
            exchange: 1,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const subtotal = values.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0), 0);
            const discountAmount = values.discountAmount || 0;
            const finalPrice = subtotal - discountAmount;
            const payload = {
                invoice_type: 2,
                invoice_no: invoiceNumber,
                invoice_date: values.invoiceDate,
                supplier_id: values.supplier,
                inventory_id: values.inventory,
                discount_amount: values.discountAmount,
                discount_percent: values.discountPercent,
                pay_method: values.pay_method,
                invoice_description: values.description || null,
                invoice_currency_id: values.currency_id,
                invoice_currency_exchange: values.exchange.toString(),
                invoice_total_price: subtotal.toFixed(2),
                invoice_final_price: finalPrice.toFixed(2),
                invoice_details: values.items
                    .map((item) => ({
                        item_id: item.item_id,
                        unit_id: item.unit_id,
                        unit_price: (item.unit_price || 0).toFixed(2),
                        quantity: (item.quantity || 0).toString(),
                        total_price: ((item.quantity || 0) * (item.unit_price || 0)).toFixed(2),
                        unit_currency_id: values.currency_id,
                        unit_currency_exchange_rate: values.exchange.toString(),
                    }))
                    .filter((detail) => detail.item_id),
            };
            try {
                await createInvoice(payload);

                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('invoice_created_successfully'),
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => {
                    navigate(ROUTES.SELL_INVOICES);
                });
            } catch (error: any) {
                console.error('Error creating invoice:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: error.response?.data?.message
                });
            }
        },
    });

    const { values, touched, errors } = formik;

    useEffect(() => {
        if (currencies.length > 0) {
            const primary = currencies.find((c: any) => c.is_primary);
            if (primary) {
                formik.setFieldValue('currency_id', primary.id.toString());
                formik.setFieldValue('exchange', primary.exchange_rate);
            }
        }
    }, [currencies]);

    useEffect(() => {
        const lastRowIndex = values.items.length - 1;
        rowRefs.current[lastRowIndex]?.[0]?.focus();
    }, [values.items.length]);

    useEffect(() => {
        if (focusAfterDelete !== null) {
            rowRefs.current[focusAfterDelete.row]?.[focusAfterDelete.field]?.focus();
            setFocusAfterDelete(null);
        }
    }, [focusAfterDelete, values.items]);

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

    const handleItemChange = (id: string, index: number) => {
        formik.setFieldValue(`items.${index}.item_id`, id);
        if (id) {
            fetchUnits(id);
            const item = itemsMap[id];
            if (item) {
                formik.setFieldValue(`items.${index}.unit_price`, item.sell_price || 0);
            }
        }
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        formik.handleChange(e);
        const unitId = e.target.value;
        const itemId = values.items[index].item_id;
        if (itemId && unitId) {
            const units = unitsMap[itemId] || [];
            const unit = units.find((u: any) => u.id == unitId);
            const item = itemsMap[itemId];
            if (unit && item) {
                const adjustedPrice = (item.last_price || 0) / (unit.fold || 1);
                formik.setFieldValue(`items.${index}.unit_price`, adjustedPrice);
            }
        }
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        formik.handleChange(e);
        const curId = e.target.value;
        const cur = currencies.find((c: any) => c.id == curId);
        if (cur) {
            formik.setFieldValue('exchange', cur.exchange_rate);
        }
    };
    const calculateSubtotal = () => values.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0), 0);
    const handleDiscountPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percent = parseFloat(e.target.value) || 0;
        formik.setFieldValue('discountPercent', percent);
        const subtotal = calculateSubtotal();
        const amount = subtotal * (percent / 100);
        formik.setFieldValue('discountAmount', amount);
        setLastDiscountType('percent');
    };
    const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        formik.setFieldValue('discountAmount', amount);

        const subtotal = calculateSubtotal();
        if (subtotal > 0) {
            const percent = Number(((amount / subtotal) * 100).toFixed(2));
            formik.setFieldValue('discountPercent', percent);
        } else {
            formik.setFieldValue('discountPercent', 0);
        }
        setLastDiscountType('amount');
    };
    useEffect(() => {
        const subtotal = calculateSubtotal();
        if (lastDiscountType === 'percent') {
            const amount = subtotal * (values.discountPercent / 100);
            formik.setFieldValue('discountAmount', amount);
        } else if (lastDiscountType === 'amount') {
            if (subtotal > 0) {
                const percent = Number(((values.discountAmount / subtotal) * 100).toFixed(2));
                formik.setFieldValue('discountPercent', percent);
            } else {
                formik.setFieldValue('discountPercent', 0);
            }
        }
    }, [values.items]);
    const fieldsPerRow = 4;
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: InvoiceItem) => void; remove: (index: number) => void }
    ) => {
        if (['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }

        const currentRowRefs = rowRefs.current[rowIndex];
        if (!currentRowRefs) return;

        if (e.key === 'Delete' && values.items.length > 1) {
            const targetField = fieldIndex;
            let targetRow = rowIndex;
            if (rowIndex === values.items.length - 1) targetRow--;
            arrayHelpers.remove(rowIndex);
            setFocusAfterDelete({ row: targetRow, field: targetField });
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab') {
            if (fieldIndex < fieldsPerRow - 1) {
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < values.items.length - 1) {
                rowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                arrayHelpers.push({ item_id: '', unit_id: '', quantity: 0, unit_price: 0 });
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
            <div className="d-flex justify-content-center align-items-center min-h-300px" >
                <div className="spinner-border text-primary" role="status" >
                    <span className="visually-hidden" > {t('Loading...')} </span>
                </div>
            </div>
        );
    }

    const selectedCurrency = currencies.find((c: any) => c.id == values.currency_id) || { symbol: '$' };

    return (
        <>
            <div className="card" >
                <div className="card-header border-0 pt-6" >
                    <div className="card-title d-flex align-items-center gap-4" >
                        <h2 className="fw-bold fs-2 mb-0" > {t("sell_invoice")} </h2>
                        {invoiceNumber && <span className="fw-bold fs-3" > {invoiceNumber}# </span>}
                    </div>
                    <div className="card-toolbar">
                        <button className="btn btn-light" onClick={() => navigate(-1)}>
                            <i className="ki-outline ki-arrow-left fs-2" style={{ paddingLeft: '0px' }}></i>
                        </button>
                    </div>
                </div>
                <div className="card-body p-9" >
                    <FormikProvider value={formik}>
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row mb-7 g-4" >
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("customer")} </label>
                                    <select
                                        className="form-select form-select-solid"
                                        name="supplier"
                                        value={values.supplier}
                                        onChange={formik.handleChange}
                                    >
                                        <option value="" > {t("select_customer")} </option>
                                        {
                                            suppliers.map((sup: any) => (
                                                <option key={sup.id} value={sup.id} >
                                                    {sup.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ErrorMessage name="supplier" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("invoice_date")} </label>
                                    <input
                                        type="date"
                                        className="form-control form-control-solid"
                                        name="invoiceDate"
                                        value={values.invoiceDate}
                                        onChange={formik.handleChange}
                                    />
                                    <ErrorMessage name="invoiceDate" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("inventory_warehouse")} </label>
                                    <select
                                        className="form-select form-select-solid"
                                        name="inventory"
                                        value={values.inventory}
                                        onChange={formik.handleChange}
                                    >
                                        <option value="" > {t("select_inventory")} </option>
                                        {
                                            inventories.map((inv: any) => (
                                                <option key={inv.id} value={inv.id} >
                                                    {inv.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ErrorMessage name="inventory" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("payment_method")} </label>
                                    <select
                                        className="form-select form-select-solid"
                                        name="pay_method"
                                        value={values.pay_method}
                                        onChange={formik.handleChange}
                                    >
                                        {
                                            payMethods.map((pm) => (
                                                <option key={pm} value={pm} >
                                                    {t(pm)}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ErrorMessage name="pay_method" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("currency")} </label>
                                    <select
                                        className="form-select form-select-solid"
                                        name="currency_id"
                                        value={values.currency_id}
                                        onChange={handleCurrencyChange}
                                    >
                                        {
                                            currencies.map((cur: any) => (
                                                <option key={cur.id} value={cur.id} >
                                                    {cur.name}({cur.symbol})
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ErrorMessage name="currency_id" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                                <div className="col-md-4 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("exchange_rate")} </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="form-control form-control-solid"
                                        name="exchange"
                                        value={values.exchange}
                                        onChange={formik.handleChange}
                                    />
                                    <ErrorMessage name="exchange" component="div" className="text-danger fs-6 mt-1" />
                                </div>
                            </div>
                            <div className="row mb-7 g-3" >
                            </div>
                            <div className="row mb-7" >
                                <div className="col-12 fv-row" >
                                    <label className="fs-6 fw-semibold mb-2" > {t("description")} </label>
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
                            <div className="separator separator-dashed my-8" > </div>
                            <div className="table-responsive" >
                                <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                    <thead>
                                        <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                            <th className="text-center" style={{ width: '5%' }}> </th>
                                            <th className="text-center" style={{ width: '25%' }}> {t("item")} </th>
                                            <th className="text-center" style={{ width: '15%' }}> {t("unit")} </th>
                                            <th className="text-center" style={{ width: '10%' }}> {t("qty")} </th>
                                            <th className="text-center" style={{ width: '15%' }}> {t("price")} </th>
                                            <th className="text-center" style={{ width: '15%' }}> {t("total")} </th>
                                            <th className="text-center" style={{ width: '5%' }}> </th>
                                        </tr>
                                    </thead>
                                    <FieldArray name="items" >
                                        {({ push, remove }) => (
                                            <>
                                                <tbody>
                                                    {
                                                        values.items.map((item, index) => {
                                                            rowRefs.current[index] = rowRefs.current[index] || [];
                                                            const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
                                                            const currentUnits = unitsMap[item.item_id] || [];
                                                            const itemErrors = Array.isArray(errors.items) ? errors.items[index] as FormikErrors<InvoiceItem> : undefined;
                                                            const hasItemError = touched.items?.[index]?.item_id && !!itemErrors?.item_id;
                                                            const hasUnitError = touched.items?.[index]?.unit_id && !!itemErrors?.unit_id;
                                                            const hasQuantityError = touched.items?.[index]?.quantity && !!itemErrors?.quantity;
                                                            const hasPriceError = touched.items?.[index]?.unit_price && !!itemErrors?.unit_price;
                                                            return (
                                                                <tr key={index} >
                                                                    <td className="row-index" style={{ color: '#000000' }}>
                                                                        {index + 1}
                                                                    </td>
                                                                    <td>
                                                                        <ItemAutocomplete
                                                                            value={item.item_id}
                                                                            onChange={(id) => handleItemChange(id, index)}
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
                                                                            onChange={(e) => handleUnitChange(e, index)}
                                                                            onKeyDown={(e) => handleKeyDown(e, index, 1, { push, remove })}
                                                                            ref={(el) => { rowRefs.current[index][1] = el }}
                                                                        >
                                                                            <option value="" > {t("select_unit")} </option>
                                                                            {
                                                                                currentUnits.map((u: any) => (
                                                                                    <option key={u.id} value={u.id} >
                                                                                        {u.name}
                                                                                    </option>
                                                                                ))
                                                                            }
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
                                                                    <td >
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className={`form-control text-end ${hasPriceError ? 'is-invalid' : ''}`}
                                                                            name={`items.${index}.unit_price`}
                                                                            value={item.unit_price || ''}
                                                                            onChange={formik.handleChange}
                                                                            onKeyDown={(e) => handleKeyDown(e, index, 3, { push, remove })}
                                                                            ref={(el) => { rowRefs.current[index][3] = el }}
                                                                        />
                                                                    </td>
                                                                    <td >
                                                                        <input
                                                                            type="text"
                                                                            className="form-control text-center bg-transparent"
                                                                            value={formatNumber(lineTotal)}
                                                                            readOnly
                                                                            tabIndex={-1}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            values.items.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-icon btn-active-color-danger btn-sm"
                                                                                    onClick={() => {
                                                                                        let targetRow = index;
                                                                                        let targetField = 0;
                                                                                        if (index === values.items.length - 1 && index > 0) targetRow = index - 1;
                                                                                        remove(index);
                                                                                        setFocusAfterDelete({ row: targetRow, field: targetField });
                                                                                    }
                                                                                    }
                                                                                    title={t("delete_this_row")}
                                                                                >
                                                                                    <i className="ki-outline ki-trash fs-2" > </i>
                                                                                </button>
                                                                            )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                                <tfoot >
                                                    <tr>
                                                        <td colSpan={7} className="p-3 text-start" >
                                                            <button
                                                                type="button"
                                                                className="btn btn-light btn-sm"
                                                                onClick={() =>
                                                                    push({ item_id: '', unit_id: '', quantity: 0, unit_price: 0 })
                                                                }
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
                            <div className="separator separator-dashed my-8" > </div>
                            <div className="row justify-content-end mt-8" >
                                <div className="col-lg-6 col-xl-6" >
                                    <div className="bg-light rounded-4 p-6 shadow-sm" >
                                        <h2 className="fw-bold text-dark mb-6" > {t("order_summary")} </h2>
                                        <div className="d-flex justify-content-between align-items-center mb-5" >
                                            <span className="fs-3 fw-semibold text-gray-700" > {t("subtotal")} </span>
                                            <span className="fs-1 fw-bold text-dark">
                                                {selectedCurrency.symbol}
                                                {formatNumber(
                                                    values.items.reduce((a, i) => a + (i.quantity || 0) * (i.unit_price || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-7" >
                                            <span className="fs-3 fw-semibold" > {t("discount_percent")} % </span>
                                            <div className="w-150px" >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    className="form-control form-control-solid text-end fs-4 fw-bold py-3 border-0 shadow-sm pe-5"
                                                    value={values.discountPercent || ''}
                                                    onChange={handleDiscountPercentChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <ErrorMessage name="discountPercent" component="div" className="text-danger fs-6 mt-1" />
                                        <div className="d-flex justify-content-between align-items-center mb-7" >
                                            <span className="fs-3 fw-semibold" > {t("discount_amount")} </span>
                                            <div className="w-150px" >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="form-control form-control-solid text-end fs-4 fw-bold py-3 border-0 shadow-sm"
                                                    value={values.discountAmount || ''}
                                                    onChange={handleDiscountAmountChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <ErrorMessage name="discountAmount" component="div" className="text-danger fs-6 mt-1" />
                                        <div className="d-flex justify-content-between align-items-center pt-5 border-top border-4 border-primary" >
                                            <h2 className="mb-0 fw-bolder text-dark" > {t("grand_total")} </h2>
                                            <h1 className="mb-0 fw-bolder text-primary">
                                                {selectedCurrency.symbol}
                                                {formatNumber(
                                                    (() => {
                                                        const subtotal = values.items.reduce(
                                                            (a, i) => a + (i.quantity || 0) * (i.unit_price || 0),
                                                            0
                                                        );
                                                        const discount = values.discountAmount || 0;
                                                        return subtotal - discount;
                                                    })()
                                                )}
                                            </h1>
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
        </>
    );
};

export default SellInvoice;