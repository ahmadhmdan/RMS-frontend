import axiosInstance from '../../../core/api/axiosInstance';

export const inventoryTransactionReportService = {
    getAll: (page: number, limit = 10, params?: any) =>
        axiosInstance.get(`/report/inventory-transaction`, {
            params: {
                page,
                per_page: limit,
                ...params,
            },
        }),
};