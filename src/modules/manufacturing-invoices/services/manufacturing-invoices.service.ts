import axiosInstance from '../../../core/api/axiosInstance'

export const manufacturingInvoicesService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/manufacturing`, {
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
    const res = await axiosInstance.get('/manufacturing-invoice-no');
    return res.data;
};

export const createInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/manufacturing', payload);
    return res.data;
};