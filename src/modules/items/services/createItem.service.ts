import axiosInstance from '../../../core/api/axiosInstance'

export const createItem = async (payload: any) => {
    const res = await axiosInstance.post('/items/create', payload);
    return res.data;
};

export const updateItem = async (id: string, payload: any) => {
    const res = await axiosInstance.post(`/items/update/${id}`, payload);
    return res.data;
};

export const getItemById = async (id: string) => {
    const res = await axiosInstance.get(`/items/show/${id}`);
    return res.data;
};

export const getUnitPrice = async (type: string, item_id: string, unit_id: string) => {
    const res = await axiosInstance.post('/items/get-price', { type, item_id, unit_id });
    return res.data.data;
};