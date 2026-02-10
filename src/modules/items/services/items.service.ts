import axiosInstance from '../../../core/api/axiosInstance';

export const itemsService = {
    getAll: (page: number, limit: number, search?: string, category_id?: string, item_group_id?: string) =>
        axiosInstance.get(`/items/index?page=${page}&per_page=${limit}&type=0${search ? `&name=${search}` : ''}${category_id ? `&category_id=${category_id}` : ''}${item_group_id ? `&item_group_id=${item_group_id}` : ''}`),

    delete: (id: number) => axiosInstance.delete(`/item/destroy/${id}`),
};