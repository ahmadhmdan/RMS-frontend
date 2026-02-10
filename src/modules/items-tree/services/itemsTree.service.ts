import axiosInstance from '../../../core/api/axiosInstance'

export const itemsTreeService = {
    getTree: (parent: string) => axiosInstance.get('/items/get-tree', { params: { parent } }),
}