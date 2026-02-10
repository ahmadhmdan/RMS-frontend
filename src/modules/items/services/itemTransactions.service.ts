import axiosInstance from '../../../core/api/axiosInstance';

export const itemTransactionsService = {
    getTransactions: (itemId: number, params: Record<string, any> = {}) =>
        axiosInstance.get(`/report/items/transactions/${itemId}`, { params }),
};