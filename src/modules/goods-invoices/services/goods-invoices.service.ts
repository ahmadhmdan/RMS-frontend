import axiosInstance from '../../../core/api/axiosInstance'

export const goodsInvoicesService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/goods`, {
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
    const res = await axiosInstance.get('/goods-invoice-no');
    return res.data;
};

export const createInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/goods', payload);
    return res.data;
};