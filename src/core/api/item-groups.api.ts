import axiosInstance from './axiosInstance'

export const getItemGroups = () => axiosInstance.get('/item-groups')