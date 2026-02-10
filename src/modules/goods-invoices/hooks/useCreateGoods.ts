import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'goodsInvoiceCreate',
        getInventories,
        getUnits,
    });
};
