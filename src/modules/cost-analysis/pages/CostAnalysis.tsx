import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FormikProvider } from 'formik';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useCostAnalysis } from '../hooks/useCostAnalysis';
import { saveCostAnalysis } from '../services/costAnalysis.service';
import AccountsTable from '../components/AccountsTable';
import ItemsTable from '../components/ItemsTable';
import SummaryCard from '../components/SummaryCard';

const CostAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { accountsList, itemsList, loading, error } = useCostAnalysis();
    const [priceMode, setPriceMode] = useState<'avg' | 'last'>('avg');

    const accountsRowRefs = useRef<(HTMLSelectElement | HTMLInputElement | null)[][]>([]);
    const [focusAfterDeleteAccounts, setFocusAfterDeleteAccounts] = useState<{ row: number; field: number } | null>(null);

    const formatLargeNumber = (value: string | number, decimals: number = 0): string => {
        const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const formik = useFormik({
        initialValues: {
            accounts: [{ account_id: '', cost: 0 }],
            items: itemsList,
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            const accountsTotal = values.accounts.reduce((sum: number, a: any) => sum + (a.cost || 0), 0);
            const itemsGrandTotal = values.items.reduce((sum: number, i: any) => sum + i.total, 0);

            const payload = {
                price_mode: priceMode,
                accounts_total: accountsTotal,
                items_grand_total: itemsGrandTotal,
                accounts: values.accounts
                    .filter((a: any) => a.account_id && a.cost > 0)
                    .map((a: any) => ({ account_id: Number(a.account_id), cost: a.cost })),
                items: values.items.map((i: any) => ({
                    item_id: i.item_id,
                    item_name: i.item_name,
                    avg_cost_price: Number(i.avg_cost_price),
                    last_cost_price: Number(i.last_cost_price),
                    quantity_sold: i.quantity_sold,
                    total: i.total,
                })),
            };

            try {
                await saveCostAnalysis(payload);
                Swal.fire({
                    icon: 'success',
                    title: t('success'),
                    text: t('saved_successfully'),
                    timer: 1500,
                    showConfirmButton: true,
                }).then(() => navigate(-1));
            } catch (err: any) {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: err.response?.data?.message || t('error_saving_cost_analysis'),
                });
            }
        },
    });

    useEffect(() => {
        const recalculated = itemsList.map(item => {
            const price = priceMode === 'avg' ? Number(item.avg_cost_price) : Number(item.last_cost_price);
            const total = price * (item.quantity_sold || 0);
            return { ...item, total };
        });
        formik.setFieldValue('items', recalculated);
    }, [priceMode, itemsList]);

    const handleQuantityChange = (index: number, value: number) => {
        const price = priceMode === 'avg'
            ? Number(formik.values.items[index].avg_cost_price)
            : Number(formik.values.items[index].last_cost_price);
        formik.setFieldValue(`items.${index}.quantity_sold`, value);
        formik.setFieldValue(`items.${index}.total`, price * value);
    };

    const handleAccountsKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number
    ) => {
        if (['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }

        const currentRowRefs = accountsRowRefs.current[rowIndex];
        if (!currentRowRefs) return;

        if (e.key === 'Delete' && formik.values.accounts.length > 1) {
            let targetRow = rowIndex;
            let targetField = fieldIndex;
            if (rowIndex === formik.values.accounts.length - 1 && rowIndex > 0) {
                targetRow = rowIndex - 1;
                targetField = 0;
            }
            const newAccounts = formik.values.accounts.filter((_: any, i: number) => i !== rowIndex);
            formik.setFieldValue('accounts', newAccounts.length === 0 ? [{ account_id: '', cost: 0 }] : newAccounts);
            setFocusAfterDeleteAccounts({ row: targetRow, field: targetField });
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab') {
            if (fieldIndex < 1) {
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < formik.values.accounts.length - 1) {
                accountsRowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                formik.setFieldValue('accounts', [...formik.values.accounts, { account_id: '', cost: 0 }]);
            }
            return;
        }

        if (e.key === 'ArrowLeft' && fieldIndex < 1) {
            currentRowRefs[fieldIndex + 1]?.focus();
        } else if (e.key === 'ArrowRight' && fieldIndex > 0) {
            currentRowRefs[fieldIndex - 1]?.focus();
        }
    };

    useEffect(() => {
        if (focusAfterDeleteAccounts !== null) {
            accountsRowRefs.current[focusAfterDeleteAccounts.row]?.[focusAfterDeleteAccounts.field]?.focus();
            setFocusAfterDeleteAccounts(null);
        }
    }, [focusAfterDeleteAccounts, formik.values.accounts]);

    useEffect(() => {
        const lastRowIndex = formik.values.accounts.length - 1;
        accountsRowRefs.current[lastRowIndex]?.[0]?.focus();
    }, [formik.values.accounts.length]);

    const accountsTotal = formik.values.accounts.reduce((sum: number, a: any) => sum + (a.cost || 0), 0);
    const itemsGrandTotal = formik.values.items.reduce((sum: number, i: any) => sum + i.total, 0);
    const percentage = accountsTotal > 0 ? (itemsGrandTotal / accountsTotal) * 100 : 0;

    const formattedAccountsTotal = formatLargeNumber(accountsTotal);
    const formattedItemsGrandTotal = formatLargeNumber(itemsGrandTotal);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{t('failed_to_load_data')}</div>;
    }

    return (
        <div className="d-flex flex-column flex-lg-row gap-6">
            <div className="flex-grow-1">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title d-flex align-items-center gap-4">
                            <h2 className="fw-bold fs-2 mb-0">{t('cost_analysis')}</h2>
                        </div>
                        <div className="card-toolbar">
                            <button className="btn btn-light" onClick={() => navigate(-1)}>
                                <i className="ki-outline ki-arrow-left fs-2"></i>
                            </button>
                        </div>
                    </div>
                    <div className="separator my-8"></div>
                    <div className="card-body p-9">
                        <FormikProvider value={formik}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="position-relative mb-10">
                                    <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-primary"></div>
                                    <h3 className="fw-bold mb-6 ps-4">{t('accounts_costs')}</h3>
                                </div>

                                <AccountsTable
                                    formik={formik}
                                    accountsList={accountsList}
                                    accountsRowRefs={accountsRowRefs}
                                    handleAccountsKeyDown={handleAccountsKeyDown}
                                    setFocusAfterDelete={setFocusAfterDeleteAccounts}
                                    mode={mode}
                                    t={t}
                                />

                                <div className="position-relative ps-4 mb-10">
                                    <div className="position-absolute start-0 top-0 w-4px h-100 bg-success rounded-2"></div>
                                    <div className="d-flex align-items-center gap-6 mb-6">
                                        <h3 className="fw-bold mb-0">{t('items_sold')}</h3>
                                        <div className="form-check form-check-custom form-check-solid">
                                            <input className="form-check-input" type="radio" id="average" checked={priceMode === 'avg'} onChange={() => setPriceMode('avg')} />
                                            <label className="form-check-label" htmlFor="average">{t('average_price')}</label>
                                        </div>
                                        <div className="form-check form-check-custom form-check-solid">
                                            <input className="form-check-input" type="radio" id="last" checked={priceMode === 'last'} onChange={() => setPriceMode('last')} />
                                            <label className="form-check-label" htmlFor="last">{t('last_buy_price')}</label>
                                        </div>
                                    </div>
                                </div>

                                <ItemsTable
                                    items={formik.values.items}
                                    priceMode={priceMode}
                                    onQuantityChange={handleQuantityChange}
                                    grandTotal={itemsGrandTotal}
                                    mode={mode}
                                    t={t}
                                    formatLargeNumber={formatLargeNumber}
                                />

                                <div className="d-flex justify-content-start mt-12">
                                    <button type="submit" className="btn btn-primary btn-lg">{t('save')}</button>
                                </div>
                            </form>
                        </FormikProvider>
                    </div>
                </div>
            </div>

            <div className="d-none d-lg-block position-sticky flex-shrink-0" style={{ top: '20px', alignSelf: 'flex-start', width: '380px' }}>
                <SummaryCard
                    accountsTotal={formattedAccountsTotal}
                    itemsGrandTotal={formattedItemsGrandTotal}
                    percentage={percentage.toFixed(2)}
                    t={t}
                />
            </div>
        </div>
    );
};

export default CostAnalysis;