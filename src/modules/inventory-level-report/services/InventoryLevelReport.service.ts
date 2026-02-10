import axiosInstance from '../../../core/api/axiosInstance'

export const inventoryLevelReportService = {
    getReport: (params: {
        page?: number
        per_page?: number
        item_name?: string
        category_id?: number
        inventory_id?: number
    }) => axiosInstance.get('/inventory-level-report', { params }),
    manufactureNegativeItems: (inventory_id?: number) => axiosInstance.get('/manufacturing/manufacture-negative-items', { params: { inventory_id } }),
}