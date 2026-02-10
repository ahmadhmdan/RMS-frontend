import axiosInstance from '../../../core/api/axiosInstance'

export const expiryItemsService = {
    getReport: (params: {
        inventory_id?: number | string
    }) => axiosInstance.get('/report/expiry', { params }),
}