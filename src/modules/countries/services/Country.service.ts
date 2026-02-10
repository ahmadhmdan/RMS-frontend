import axiosInstance from '../../../core/api/axiosInstance'

export const countryService = {
    getAll: () => axiosInstance.get('/countries'),
    getById: (id: number) => axiosInstance.get(`/countries/${id}`),
    create: (data: any) => axiosInstance.post('/countries', data),
    update: (id: number, data: any) => axiosInstance.put(`/countries/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/countries/${id}`),
}