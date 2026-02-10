import axiosInstance from './axiosInstance'

export const getTransactionTypes = () => axiosInstance.get('/transaction-type')