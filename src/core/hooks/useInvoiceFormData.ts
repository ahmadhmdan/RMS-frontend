import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItemData } from '../queries/itemData.query';

interface InvoiceFormDataOptions {
    queryKeyPrefix: string;
    getInventories: () => Promise<any[]>;
    getUnits: (itemId: string) => Promise<any[]>;
    getSuppliers?: () => Promise<any[]>;
    getCurrencies?: () => Promise<any[]>;
    loadItems?: boolean;
    suppliersFilter?: (suppliers: any[]) => any[];
    itemsFilter?: (items: any[]) => any[];
}

export const useInvoiceFormData = ({
    queryKeyPrefix,
    getInventories,
    getUnits,
    getSuppliers,
    getCurrencies,
    loadItems = true,
    suppliersFilter,
    itemsFilter,
}: InvoiceFormDataOptions) => {
    const [unitsMap, setUnitsMap] = useState<{ [key: string]: any[] }>({});

    const baseQuery = useQuery({
        queryKey: [queryKeyPrefix, 'baseData'],
        queryFn: async () => {
            const [suppliers, inventories, currencies] = await Promise.all([
                getSuppliers ? getSuppliers() : Promise.resolve([]),
                getInventories(),
                getCurrencies ? getCurrencies() : Promise.resolve([]),
            ]);

            return {
                suppliers,
                inventories,
                currencies,
            };
        },
    });

    const itemQuery = useQuery({
        queryKey: [queryKeyPrefix, 'itemData'],
        queryFn: fetchItemData,
        enabled: loadItems,
    });

    const suppliers = useMemo(() => {
        const allSuppliers = baseQuery.data?.suppliers || [];
        return suppliersFilter ? suppliersFilter(allSuppliers) : allSuppliers;
    }, [baseQuery.data?.suppliers, suppliersFilter]);

    const inventories = baseQuery.data?.inventories || [];
    const currencies = baseQuery.data?.currencies || [];

    const itemsList = useMemo(() => {
        const allItems = itemQuery.data || [];
        return itemsFilter ? itemsFilter(allItems) : allItems;
    }, [itemQuery.data, itemsFilter]);

    const itemsMap = useMemo(
        () => itemsList.reduce((acc: { [key: string]: any }, item: any) => ({ ...acc, [item.id]: item }), {}),
        [itemsList]
    );

    const fetchUnits = useCallback(async (itemId: string) => {
        if (unitsMap[itemId]) return;

        try {
            const units = await getUnits(itemId);
            setUnitsMap(prev => ({ ...prev, [itemId]: units }));
        } catch {
            // Keep silent to preserve existing module behavior.
        }
    }, [getUnits, unitsMap]);

    const loading = baseQuery.isLoading || (loadItems && itemQuery.isLoading);
    const error = baseQuery.error || itemQuery.error || null;

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
    };
};
