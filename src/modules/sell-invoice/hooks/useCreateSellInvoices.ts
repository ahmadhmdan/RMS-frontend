import { useInvoiceFormData } from '../../../core/hooks/useInvoiceFormData';
import { getSuppliers, getInventories, getCurrencies, getUnits } from '../services/createSellInvoices.service';

export const useInvoiceData = () => {
    return useInvoiceFormData({
        queryKeyPrefix: 'sellInvoiceCreate',
        getSuppliers,
        getInventories,
        getCurrencies,
        getUnits,
        suppliersFilter: (suppliers) => suppliers.filter((sup: any) => sup.type === 'supplier' || sup.type === 'both'),
    });
};
