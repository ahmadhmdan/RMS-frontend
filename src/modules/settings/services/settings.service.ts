import axiosInstance from '../../../core/api/axiosInstance'

export const settingsService = {
    getAll: () => axiosInstance.get('/settings'),
    update: (data: any) => axiosInstance.put('/settings', data),
}