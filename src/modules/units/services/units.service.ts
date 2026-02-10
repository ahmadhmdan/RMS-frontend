import axiosInstance from '../../../core/api/axiosInstance';

export const unitsService = {
    getAll: () => axiosInstance.get('/units'),
    getById: (id: number) => axiosInstance.get(`/units/${id}`),
    create: (data: any) => axiosInstance.post('/units', data),
    update: (id: number, data: any) => axiosInstance.put(`/units/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/units/${id}`),
};