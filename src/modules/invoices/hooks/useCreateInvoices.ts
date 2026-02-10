import { useEffect, useState } from 'react';
import { getSuppliers, getInventories, getCurrencies, getUnits } from '../services/createInvoices.service';
import { useQuery } from '@tanstack/react-query';
import { fetchItemData } from '../../../core/queries/itemData.query';

export const useInvoiceData = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [inventories, setInventories] = useState<any[]>([]);
    const [itemsList, setItemsList] = useState<any[]>([]);
    const [itemsMap, setItemsMap] = useState<{ [key: string]: any }>({});
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [unitsMap, setUnitsMap] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [error] = useState<any>(null);

    const invoiceQuery = useQuery({
        queryKey: ['invoiceData'],
        queryFn: async () => {
            const [supRes, invRes, curRes] = await Promise.all([
                getSuppliers(),
                getInventories(),
                getCurrencies(),
            ]);
            return { supRes, invRes, curRes };
        },
    });

    const itemQuery = useQuery({
        queryKey: ['itemData'],
        queryFn: fetchItemData,
    })

    useEffect(() => {
        if (invoiceQuery.data) {
            const allSuppliers = invoiceQuery.data.supRes || []
            const filtered = allSuppliers.filter((sup: any) =>
                sup.type === 'supplier' || sup.type === 'both'
            )
            setSuppliers(filtered)
            setInventories(invoiceQuery.data.invRes || [])
            setCurrencies(invoiceQuery.data.curRes || [])
        }
    }, [invoiceQuery.data])

    useEffect(() => {
        if (itemQuery.data) {
            setItemsList(itemQuery.data)
            setItemsMap(itemQuery.data.reduce((acc: any, it: any) => ({ ...acc, [it.id]: it }), {}))
        }
    }, [itemQuery.data])

    useEffect(() => {
        setLoading(invoiceQuery.isLoading || itemQuery.isLoading)
    }, [invoiceQuery.isLoading, itemQuery.isLoading])

    const fetchUnits = async (itemId: string) => {
        if (unitsMap[itemId]) return
        try {
            const units = await getUnits(itemId)
            setUnitsMap(prev => ({ ...prev, [itemId]: units }))
        } catch { }
    }

    return {
        suppliers,
        inventories,
        itemsList,
        itemsMap,
        currencies,
        unitsMap,
        fetchUnits,
        loading,
        error,
    }
}