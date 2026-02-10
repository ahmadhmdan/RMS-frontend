import axiosInstance from '../../../core/api/axiosInstance'

export const itemGroupService = {
    getAll: () => axiosInstance.get('/item-groups'),
    getById: (id: number) => axiosInstance.get(`/item-groups/${id}`),
    create: (data: any) => axiosInstance.post('/item-groups', data),
    update: (id: number, data: any) => axiosInstance.put(`/item-groups/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/item-groups/${id}`),
}