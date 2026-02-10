import axiosInstance from '../../../core/api/axiosInstance'

export const categoryService = {
    getAll: () => axiosInstance.get('/categories'),
    getById: (id: number) => axiosInstance.get(`/categories/${id}`),
    create: (data: any) => axiosInstance.post('/categories', data),
    update: (id: number, data: any) => axiosInstance.put(`/categories/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/categories/${id}`),
}