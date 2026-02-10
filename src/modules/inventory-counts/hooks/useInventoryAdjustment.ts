import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useInventoryAdjustment = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdjustData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await inventoryCountsService.getAdjust(id);
                setItems(res.data.data || []);
            } catch (error) {
                Swal.fire(t('error'), t('fetch.error'), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAdjustData();
    }, [id, t]);

    return {
        items,
        loading,
    };
};