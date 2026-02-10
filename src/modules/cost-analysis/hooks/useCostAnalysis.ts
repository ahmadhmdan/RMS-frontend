import { useEffect, useState } from 'react';
import { getCostAnalysisData } from '../services/costAnalysis.service';

interface Account {
    id: number;
    name: string;
    account_no: number;
    account_type: string;
}

interface Item {
    item_id: number;
    item_name: string;
    last_cost_price: string;
    avg_cost_price: string;
    quantity_sold: number;
    total: number;
}

export const useCostAnalysis = () => {
    const [accountsList, setAccountsList] = useState<Account[]>([]);
    const [itemsList, setItemsList] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getCostAnalysisData();
                setAccountsList(data.accounts);
                setItemsList(data.items.map((i: any) => ({
                    ...i,
                    quantity_sold: i.quantity_sold || 0,
                    total: 0
                })));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { accountsList, itemsList, loading, error };
};