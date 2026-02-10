import axiosInstance from './axiosInstance'

export const getSuppliers = () => axiosInstance.get('/suppliers')