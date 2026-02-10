import axiosInstance from '../../../core/api/axiosInstance'

export const transferInvoiceService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/transfer`, {
            params: {
                page,
                per_page: limit,
                ...params,
            },
        }),

    getById: (id: number) =>
        axiosInstance.get(`/invoice/${id}`),

    delete: (id: number) => axiosInstance.post(`/invoice/delete/${id}`),
}

export const getInvoiceNumber = async () => {
    const res = await axiosInstance.get('/transfer-invoice-no');
    return res.data;
};

export const getItemsByInventory = async (id: number) => {
    const res = await axiosInstance.get(`/inventories/${id}/items`);
    return res.data;
};

export const createInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/transfer', payload);
    return res.data;
};