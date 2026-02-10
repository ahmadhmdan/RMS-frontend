import { useEffect, useState } from 'react';
import { getInventories, getUnits } from '../../invoices/services/createInvoices.service';

export const useInvoiceData = () => {
    const [inventories, setInventories] = useState<any[]>([]);
    const [unitsMap, setUnitsMap] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [invRes] = await Promise.all([

                    getInventories(),
                ]);
                setInventories(invRes);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchUnits = async (itemId: string) => {
        if (unitsMap[itemId]) return;
        try {
            const units = await getUnits(itemId);
            setUnitsMap((prev) => ({ ...prev, [itemId]: units }));
        } catch (err) {
            console.error('Error fetching units:', err);
        }
    };

    return {
        inventories,
        unitsMap,
        fetchUnits,
        loading,
        error,
    };
};