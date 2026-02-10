import axiosInstance from '../../../core/api/axiosInstance';

export const supplierTransactionsService = {
    getTransactions: (params: any) =>
        axiosInstance.get('/report/supplier-transactions', { params }),
};