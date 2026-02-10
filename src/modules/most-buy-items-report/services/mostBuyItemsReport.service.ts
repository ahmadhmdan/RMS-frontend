import axiosInstance from '../../../core/api/axiosInstance';

export const mostBuyItemsReportService = {
    getAll: (page: number, limit = 10) =>
        axiosInstance.get(`/report/items-most-buy?page=${page}&per_page=${limit}`),
};