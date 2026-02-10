import axiosInstance from '../../../core/api/axiosInstance';

export const producedItemsMarginService = {
    getAll: (page: number, limit = 10) =>
        axiosInstance.get(`/report/produced-items-margin?page=${page}&per_page=${limit}`),
};