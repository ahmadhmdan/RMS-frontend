import { useState, useEffect } from 'react';
import { unitsService } from '../services/units.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export const useUnits = () => {
    const { t } = useTranslation();
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await unitsService.getAll();
            setUnits(res.data.data);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const createUnit = async (data: any) => {
        try {
            await unitsService.create(data);
            Swal.fire(t('success'), t('create.success'), 'success');
            fetchUnits();
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('create.error'), 'error');
        }
    };

    const updateUnit = async (id: number, data: any) => {
        try {
            await unitsService.update(id, data);
            Swal.fire(t('success'), t('update.success'), 'success');
            fetchUnits();
        } catch (error: any) {
            Swal.fire(t('error'), error.response?.data?.message || t('update.error'), 'error');
        }
    };

    const deleteUnit = async (id: number) => {
        try {
            await unitsService.delete(id);
            Swal.fire(t('success'), t('delete.success'), 'success');
            fetchUnits();
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error');
        }
    };

    return {
        units,
        loading,
        createUnit,
        updateUnit,
        deleteUnit,
    };
};