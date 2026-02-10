import React from 'react';

interface Props {
    pricingData: any;
    t: (key: string) => string;
    getItemName: (id: number) => string;
}

const PricingCalculation: React.FC<Props> = ({ pricingData, t, getItemName }) => {
    return (
        <div className="card border-0">
            <div className="card-header border-0 bg-transparent px-6 py-4">
                <h3 className="card-title fw-bold text-dark mb-0 fs-4">
                    {t('quick_info')}
                </h3>
            </div>

            <div className="card-body pt-2 px-6">
                {pricingData ? (
                    <>
                        <div className="d-flex flex-column gap-4 mb-7">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-gray-600 fw-bold">{t('cost_price')}</span>
                                <span className="fw-bold text-dark fs-3">{pricingData.cost_price}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-gray-600 fw-bold">{t('indirect_costs')}</span>
                                <span className="fw-bold text-dark fs-3">{pricingData.indirect_costs}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-gray-600 fw-bold">{t('expected_margin_percentage')}</span>
                                <span className="fw-bold text-dark fs-3">{pricingData.expected_margin_percentage}%</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-gray-600 fw-bold">{t('recipe_quantity')}</span>
                                <span className="fw-bold text-dark fs-3">{pricingData.recipe_quantity}</span>
                            </div>
                        </div>

                        <div className="separator separator-dashed mb-6"></div>
                        <div className="d-flex justify-content-between align-items-center bg-light-primary rounded px-6 py-4">
                            <div>
                                <div className="fw-bold text-gray-700">{t('suggested_selling_price')}</div>
                            </div>
                            <div className={`fs-2hx fw-bold ${pricingData.issue_detected ? 'text-danger' : 'text-success'}`}>
                                {pricingData.suggested_selling_price}
                            </div>
                        </div>

                        <div className="row g-5 mt-2">
                            <div className="col-4">
                                <div className="text-center">
                                    <div className="fs-2 fw-bold text-success">{pricingData.real_profit_percentage}%</div>
                                    <div className="text-gray-600 fw-medium mt-1">{t('real_profit_percentage')}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="text-center">
                                    <div className="fs-2 fw-bold text-primary">{pricingData.cost_percentage}%</div>
                                    <div className="text-gray-600 fw-medium mt-1">{t('cost_percentage')}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="text-center">
                                    <div className="fs-2 fw-bold text-warning">{pricingData.indirect_costs_percentage}%</div>
                                    <div className="text-gray-600 fw-medium mt-1">{t('indirect_costs_percentage')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="fw-bold text-dark mb-4">{t('ingredients_details')}</h4>
                            <div className="table-responsive">
                                <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                                    <thead>
                                        <tr className="fw-bold text-muted bg-light">
                                            <th className="ps-4 min-w-145px">{t('ingredient')}</th>
                                            <th className="text-center min-w-120px">{t('unit_cost')}</th>
                                            <th className="text-center pe-4 min-w-120px">{t('total_cost')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pricingData.item_ingredients.map((ing: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <span className="text-dark fw-semibold d-block">
                                                        {getItemName(ing.ingredient_id)}
                                                    </span>
                                                </td>
                                                <td className="text-center fw-medium fs-4">{ing.unit_cost}</td>
                                                <td className="text-center pe-4">
                                                    <span className="text-dark fw-bold fs-4">{ing.total_cost}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="alert alert-info bg-light-primary rounded border-0 d-flex align-items-center p-5">
                        <i className="ki-outline ki-information fs-2tx text-primary me-4"></i>
                        <div className="d-flex flex-column">
                            <span className="text-gray-900 fw-semibold">{t('no_data_available')}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingCalculation;