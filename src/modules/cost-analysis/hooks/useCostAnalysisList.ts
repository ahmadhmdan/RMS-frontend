import { useEffect, useState } from 'react';
import { costAnalysisService } from '../services/costAnalysis.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useCostAnalysisList = () => {
    const { t } = useTranslation();
    const [costAnalysisdata, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await costAnalysisService.getAll();
            setData(res.data.data || []);
        } catch (err: any) {
            setError(err);
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [t]);

    return { costAnalysisdata, loading, error, refetch: fetchData };
};