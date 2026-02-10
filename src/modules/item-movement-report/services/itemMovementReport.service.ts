import axiosInstance from '../../../core/api/axiosInstance'

export const itemMovementReportService = {
    getAll: (page: number, limit = 15, params?: any) =>
        axiosInstance.get(`/inventory-level-report/item-movement`, {
            params: {
                page,
                per_page: limit,
                ...params,
            },
        }),
}