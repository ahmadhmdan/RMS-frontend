import axiosInstance from '../../../core/api/axiosInstance'

export const consumptionInvoicesService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/consumption`, {
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

export const getConsumptionInvoiceNumber = async () => {
    const res = await axiosInstance.get('/consumption-invoice-no');
    return res.data;
};

export const createConsumptionInvoice = async (payload: any) => {
    const res = await axiosInstance.post('/invoice/store/consumption', payload);
    return res.data;
};