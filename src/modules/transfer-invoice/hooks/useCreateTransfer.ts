import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useInvoiceData = () => {
    const { inventories, unitsMap, fetchUnits, loading, error } = useInvoiceFormData({
        queryKeyPrefix: 'transferInvoiceCreate',
        getInventories,
        getUnits,
        loadItems: false,
    });

    return {
        inventories,
        unitsMap,
        fetchUnits,
        loading,
        error,
    };
};
