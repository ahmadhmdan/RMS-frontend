import axiosInstance from './axiosInstance'

export const getInventories = () => axiosInstance.get('/inventories')