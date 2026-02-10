import { getItems } from '../../modules/invoices/services/createInvoices.service';

export const fetchItemData = async () => {
    const res = await getItems(5);
    return res;
};
