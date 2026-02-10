import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useCostAnalysisDetails } from '../hooks/useCostAnalysisDetails';

const ViewCostAnalysisDetails: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useCostAnalysisDetails(id || '');

    const formatLargeNumber = (value: string | number, decimals: number = 0): string => {
        const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
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

    if (error || !data) {
        return <div className="alert alert-danger">{t('failed_to_load_data')}</div>;
    }

    const accountsTotal = parseFloat(data.accounts_total);
    const itemsGrandTotal = parseFloat(data.items_grand_total);
    const percentage = accountsTotal > 0 ? (itemsGrandTotal / accountsTotal) * 100 : 0;

    const formattedAccountsTotal = formatLargeNumber(accountsTotal);
    const formattedItemsGrandTotal = formatLargeNumber(itemsGrandTotal);

    return (
        <div className="d-flex flex-column flex-lg-row gap-6">
            <div className="flex-grow-1">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title d-flex align-items-center gap-4">
                            <h2 className="fw-bold fs-2 mb-0">{t('cost_analysis_details')}</h2>
                        </div>
                        <div className="card-toolbar">
                            <button className="btn btn-light" onClick={() => navigate(-1)}>
                                <i className="ki-outline ki-arrow-left fs-2"></i>
                            </button>
                        </div>
                    </div>
                    <div className="separator my-8"></div>
                    <div className="card-body p-9">
                        <div className="position-relative mb-10">
                            <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-primary"></div>
                            <h3 className="fw-bold mb-6 ps-4">{t('accounts_costs')}</h3>
                        </div>

                        <div className="table-responsive mb-10">
                            <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                <thead>
                                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                        <th className="text-start" style={{ width: '60%' }}>{t('account')}</th>
                                        <th className="text-center" style={{ width: '30%' }}>{t('cost')}</th>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.accounts.map((row: any, index: number) => (
                                        <tr key={row.id}>
                                            <td className="row-index" style={{ color: '#000000' }}>{index + 1}</td>
                                            <td className="px-3" style={{ color: '#000000' }}>
                                                {row.account_name || `${t('account')} ${row.account_id}`}
                                            </td>
                                            <td className="text-center fw-bold px-3" style={{ color: '#000000' }}>{formatLargeNumber(row.cost)}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="position-relative ps-4 mb-10">
                            <div className="position-absolute start-0 top-0 w-4px h-100 bg-success rounded-2"></div>
                            <div className="d-flex align-items-center gap-6 mb-6">
                                <h3 className="fw-bold mb-0">{t('items_sold')}</h3>
                                <div className="form-check form-check-custom form-check-solid">
                                    <input className="form-check-input" type="radio" id="average" checked={data.price_mode === 'avg'} disabled />
                                    <label className="form-check-label fw-bold" htmlFor="average">{t('average_price')}</label>
                                </div>
                                <div className="form-check form-check-custom form-check-solid">
                                    <input className="form-check-input" type="radio" id="last" checked={data.price_mode === 'last'} disabled />
                                    <label className="form-check-label fw-bold" htmlFor="last">{t('last_buy_price')}</label>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive mb-10">
                            <table className={`table table-bordered excel-like-table-2 ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                                <thead>
                                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                        <th className="text-center" style={{ width: '5%' }}></th>
                                        <th className="text-start" style={{ width: '40%' }}>{t('item')}</th>
                                        <th className="text-center" style={{ width: '20%' }}>{t('sell_price')}</th>
                                        <th className="text-center" style={{ width: '20%' }}>{t('quantity_sold')}</th>
                                        <th className="text-center" style={{ width: '15%' }}>{t('total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item: any, index: number) => {
                                        const price = data.price_mode === 'avg' ? Number(item.avg_cost_price) : Number(item.last_cost_price);
                                        return (
                                            <tr key={item.item_id}>
                                                <td className="row-index" style={{ color: '#000000' }}>{index + 1}</td>
                                                <td className="px-3" style={{ color: '#000000' }}>{item.item_name || `${t('item')} ${item.item_id}`}</td>
                                                <td className="text-center" style={{ color: '#000000' }}>{formatLargeNumber(price)}</td>
                                                <td className="text-center" style={{ color: '#000000' }}>{formatLargeNumber(item.quantity_sold)}</td>
                                                <td className="text-center fw-bold" style={{ color: '#000000' }}>{formatLargeNumber(item.total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-none d-lg-block position-sticky flex-shrink-0" style={{ top: '20px', alignSelf: 'flex-start', width: '380px' }}>
                <div className="card border-0">
                    <div className="card-header border-0 bg-transparent px-6 py-4">
                        <h3 className="card-title fw-bold text-dark mb-0 fs-4">{t('summary')}</h3>
                    </div>
                    <div className="card-body pt-2 px-6">
                        <div className="d-flex flex-column gap-5">
                            <div className="d-flex justify-content-between">
                                <span className="text-gray-600 fw-bold">{t('total_accounts_cost')}</span>
                                <span className="fw-bold fs-3 text-danger">{formattedAccountsTotal}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-gray-600 fw-bold">{t('total_items_revenue')}</span>
                                <span className="fw-bold fs-3 text-success">{formattedItemsGrandTotal}</span>
                            </div>
                            <div className="separator separator-dashed my-4"></div>
                            <div className="d-flex justify-content-between align-items-center bg-light-warning rounded px-6 py-5">
                                <div className="fw-bold text-gray-800 fs-4">{t('coverage_percentage')}</div>
                                <div className="fs-2hx fw-bold text-warning">{percentage}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCostAnalysisDetails;