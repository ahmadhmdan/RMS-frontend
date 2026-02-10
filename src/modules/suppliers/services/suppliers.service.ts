import axiosInstance from '../../../core/api/axiosInstance'

export const supplierService = {
    getAll: (params?: any) => axiosInstance.get('/suppliers', { params }),
    getById: (id: number) => axiosInstance.get(`/suppliers/${id}`),
    create: (data: any) => axiosInstance.post('/suppliers', data),
    update: (id: number, data: any) => axiosInstance.put(`/suppliers/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/suppliers/${id}`),
    getInvoices: (id: number) => axiosInstance.get(`/report/supplier-invoice?id=${id}`),
}