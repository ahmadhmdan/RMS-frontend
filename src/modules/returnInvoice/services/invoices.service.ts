import axiosInstance from '../../../core/api/axiosInstance'

export const invoicesService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/invoices/return`, {
            params: {
                page,
                limit,
                ...params,
            },
        }),

    getById: (id: number) =>
        axiosInstance.get(`/invoice/${id}`),

    delete: (id: number) => axiosInstance.post(`/invoice/delete/${id}`),
}