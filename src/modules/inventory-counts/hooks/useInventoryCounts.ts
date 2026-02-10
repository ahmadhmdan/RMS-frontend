import { useState, useEffect } from 'react';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useInventoryCounts = () => {
    const { t } = useTranslation();
    const [counts, setCounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchCounts();
    }, [page]);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const res = await inventoryCountsService.getAll(page, pageSize);
            setCounts(res.data.data);
            setTotal(res.data.pagination?.total || 0);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        counts,
        loading,
        page,
        total,
        pageSize,
        setPage,
        fetchCounts,
    };
};