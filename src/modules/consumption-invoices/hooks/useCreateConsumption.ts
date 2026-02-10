import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useConsumptionInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'consumptionInvoiceCreate',
        getInventories,
        getUnits,
    });
};
