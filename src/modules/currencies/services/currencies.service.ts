import axiosInstance from '../../../core/api/axiosInstance'

export const currencyService = {
    getAll: () => axiosInstance.get('/currencies'),
    create: (data: any) => axiosInstance.post('/currencies', data),
    update: (id: number, data: any) => axiosInstance.put(`/currencies/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/currencies/${id}`),
    assignRate: (id: number, data: any) => axiosInstance.post(`/currencies/${id}/assign-rate`, data),
}