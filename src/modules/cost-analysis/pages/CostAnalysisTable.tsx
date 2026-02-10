import DataTable from '../../../core/components/DataTable'
import { useCostAnalysisList } from '../hooks/useCostAnalysisList';
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../core/utils/constants'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../../core/utils/formatDate';

const formatLargeNumber = (value: string | number, decimals: number = 0): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const costAnalysisTable = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { costAnalysisdata, loading } = useCostAnalysisList()

    const columns = [
        { key: 'price_mode', header: 'price_mode', render: (item: any) => item.price_mode || '-' },
        { key: 'accounts_total', header: 'total_accounting_costs', render: (item: any) => formatLargeNumber(item.accounts_total) || '-' },
        { key: 'items_grand_total', header: 'items_grand_total', render: (item: any) => formatLargeNumber(item.items_grand_total) || '-' },
        { key: 'created_at', header: 'created_at', render: (item: any) => formatDate(item.created_at) || '-' },
    ]

    const handleView = (item: any) => {
        navigate(`${ROUTES.COST_ANALYSIS_DETAILS}/${item.id}`)
    }

    return (
        <div>
            <DataTable
                columns={columns}
                data={costAnalysisdata}
                title={t('cost_analysis')}
                onCreate={() => navigate(`${ROUTES.COST_ANALYSIS}`)}
                onEdit={() => { }}
                onDelete={() => { }}
                showEdit={false}
                onView={handleView}
                showView={true}
                showDelete={false}
                loading={loading}
            />

        </div>
    )
}

export default costAnalysisTable