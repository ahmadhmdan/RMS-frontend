import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getSuppliers, getInventories, getCurrencies, getUnits } from '../services/createInvoices.service';

export const useSellInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'returnInvoiceCreate',
        getSuppliers,
        getInventories,
        getCurrencies,
        getUnits,
        suppliersFilter: (suppliers) => suppliers.filter((sup: any) => sup.type === 'supplier' || sup.type === 'both'),
    });
};
