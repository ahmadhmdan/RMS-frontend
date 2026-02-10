import { useEffect, useState } from 'react';
import { getCostAnalysisById } from '../services/costAnalysis.service';

export const useCostAnalysisDetails = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getCostAnalysisById(id);
                setData(res.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    return { data, loading, error };
};