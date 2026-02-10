import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useInventoryCountDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();

    const [count, setCount] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCountDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await inventoryCountsService.getById(id);
                setCount(res.data);
                setItems(res.data.items || []);
            } catch (error) {
                Swal.fire(t('error'), t('fetch.error'), 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchCountDetails();
    }, [id, t]);

    return {
        count,
        items,
        loading,
        isInProgress: count?.status === 'in_progress',
    };
};