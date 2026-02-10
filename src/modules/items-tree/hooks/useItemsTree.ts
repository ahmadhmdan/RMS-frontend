import { useCallback } from 'react'
import { itemsTreeService } from '../services/itemsTree.service'

export const useItemsTree = () => {
    const fetchNode = useCallback((node: any, success: (data: any[]) => void) => {
        const parent = node.id
        itemsTreeService.getTree(parent)
            .then(res => success(res.data))
    }, [])

    return { fetchNode }
}