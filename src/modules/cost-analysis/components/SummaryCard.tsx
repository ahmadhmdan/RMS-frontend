import React from 'react';

interface Props {
    accountsTotal: string;
    itemsGrandTotal: string;
    percentage: string;
    t: (key: string) => string;
}

const SummaryCard: React.FC<Props> = ({ accountsTotal, itemsGrandTotal, percentage, t }) => {
    return (
        <div className="card border-0">
            <div className="card-header border-0 bg-transparent px-6 py-4">
                <h3 className="card-title fw-bold text-dark mb-0 fs-4">{t('summary')}</h3>
            </div>
            <div className="card-body pt-2 px-6">
                <div className="d-flex flex-column gap-5">
                    <div className="d-flex justify-content-between">
                        <span className="text-gray-600 fw-bold">{t('total_accounts_cost')}</span>
                        <span className="fw-bold fs-3 text-danger">{accountsTotal}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-gray-600 fw-bold">{t('total_items_revenue')}</span>
                        <span className="fw-bold fs-3 text-success">{itemsGrandTotal}</span>
                    </div>
                    <div className="separator separator-dashed my-4"></div>
                    <div className="d-flex justify-content-between align-items-center bg-light-warning rounded px-6 py-5">
                        <div className="fw-bold text-gray-800 fs-4">{t('coverage_percentage')}</div>
                        <div className="fs-2hx fw-bold text-warning">{percentage}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;