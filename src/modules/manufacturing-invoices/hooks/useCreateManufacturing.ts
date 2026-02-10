import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'manufacturingInvoiceCreate',
        getInventories,
        getUnits,
        itemsFilter: (items) => items.filter((item: any) => item.type === 1),
    });
};
