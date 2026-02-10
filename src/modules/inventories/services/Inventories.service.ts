import axiosInstance from '../../../core/api/axiosInstance'

export const inventoryService = {
    getAll: () => axiosInstance.get('/inventories'),
    getById: (id: number) => axiosInstance.get(`/inventories/${id}`),
    create: (data: any) => axiosInstance.post('/inventories', data),
    update: (id: number, data: any) => axiosInstance.put(`/inventories/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/inventories/${id}`),
}