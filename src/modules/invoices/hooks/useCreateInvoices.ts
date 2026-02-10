import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getSuppliers, getInventories, getCurrencies, getUnits } from '../services/createInvoices.service';

export const useInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'purchaseInvoiceCreate',
        getSuppliers,
        getInventories,
        getCurrencies,
        getUnits,
        suppliersFilter: (suppliers) => suppliers.filter((sup: any) => sup.type === 'supplier' || sup.type === 'both'),
    });
};
