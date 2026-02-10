import { useState, useEffect } from 'react';
import { producedItemsMarginService } from '../services/producedItemsMargin.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

interface ProducedItem {
    name: string;
    recipe_unit?: string;
    cost_price: number;
    indirect_cost_price: number;
    full_cost_price: number;
    sell_price: number;
    margin: number;
    margin_percentage: string;
    expected_margin: number;
    expected_margin_percentage: string;
    difference: number;
}

export const useProducedItemsMargin = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<ProducedItem[]>([]);
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
            const res = await producedItemsMarginService.getAll(page, pageSize);
            setItems(res.data.data);
            setTotal(res.data.meta?.total || res.data.pagination?.total || 0);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const getFullData = async (): Promise<ProducedItem[]> => {
        try {
            const res = await producedItemsMarginService.getAll(1, total);
            return res.data.data || [];
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
            return [];
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
        getFullData,
    };
};