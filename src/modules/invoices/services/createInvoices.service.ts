import axiosInstance from '../../../core/api/axiosInstance';

export const getSuppliers = async () => {
    const res = await axiosInstance.get('/suppliers');
    return res.data.data;
};

export const getInventories = async () => {
    const res = await axiosInstance.get('/inventories');
    return res.data.data;
};

export const getItems = async (type?: number) => {
    const res = await axiosInstance.get(`/items?type=${type}`);
    return res.data.data;
};

export const getCurrencies = async () => {
    const res = await axiosInstance.get('/currencies');
    return res.data.data;
};

export const getUnits = async (itemId: string) => {
    const res = await axiosInstance.get(`/units?item_id=${itemId}`);
    return res.data.data;
};

export const createInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/purchase', payload);
    return res.data;
};

export const getInvoiceNumber = async () => {
    const res = await axiosInstance.get('/invoice-no');
    return res.data;
};