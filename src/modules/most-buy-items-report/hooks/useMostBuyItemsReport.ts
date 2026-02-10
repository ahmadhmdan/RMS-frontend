import { useState, useEffect } from 'react';
import { mostBuyItemsReportService } from '../services/mostBuyItemsReport.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useMostBuyItemsReport = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchItems();
    }, [page]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await mostBuyItemsReportService.getAll(page, pageSize);
            setItems(res.data.data);
            setTotal(res.data.meta?.total || res.data.pagination?.total || 0);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        items,
        loading,
        page,
        total,
        pageSize,
        setPage,
        fetchItems,
    };
};