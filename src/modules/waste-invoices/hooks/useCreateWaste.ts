import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useWasteInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'wasteInvoiceCreate',
        getInventories,
        getUnits,
    });
};
