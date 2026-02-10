import axiosInstance from './axiosInstance'

export const getItems = (type?: number) => axiosInstance.get(`/items?type=${type}`);