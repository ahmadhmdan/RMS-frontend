import axiosInstance from '../../../core/api/axiosInstance'

export const wasteInvoicesService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/waste`, {
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

export const getWasteInvoiceNumber = async () => {
    const res = await axiosInstance.get('/waste-invoice-no');
    return res.data;
};

export const createWasteInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/waste', payload);
    return res.data;
};