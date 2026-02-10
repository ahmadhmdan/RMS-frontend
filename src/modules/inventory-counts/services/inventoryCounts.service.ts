import axiosInstance from '../../../core/api/axiosInstance';

export const inventoryCountsService = {
    getAll: (page: number, limit = 10) =>
        axiosInstance.get(`/inventories/counts?page=${page}&per_page=${limit}`),

    getById: (id: string | number) =>
        axiosInstance.get(`/inventories/counts/${id}`),

    getMatching: (params: any) =>
        axiosInstance.get('/inventories/matching', { params }),

    create: (data: any) =>
        axiosInstance.post('/inventories/matching', data),

    getAdjust: (id: string | number) =>
        axiosInstance.get(`/inventories/adjust/${id}`),

    adjust: (data: any) =>
        axiosInstance.post('/inventories/adjustment/store', data),
};