import axiosInstance from '../../../core/api/axiosInstance'

export const minimumQuantityService = {
    getReport: (params: {
        inventory_id?: number | string
    }) => axiosInstance.get('/report/minimum-quantity', { params }),
}