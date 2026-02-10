import axiosInstance from '../../../core/api/axiosInstance'

export const cityService = {
    getAll: () => axiosInstance.get('/cities'),
    getById: (id: number) => axiosInstance.get(`/cities/${id}`),
    create: (data: any) => axiosInstance.post('/cities', data),
    update: (id: number, data: any) => axiosInstance.put(`/cities/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/cities/${id}`),
}