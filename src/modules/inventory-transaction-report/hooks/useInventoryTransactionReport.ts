import { useState, useEffect } from 'react';
import { inventoryTransactionReportService } from '../services/inventoryTransactionReport.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { getInventories } from '../../../core/api/inventories.api';
import { getItems } from '../../../core/api/items.api';

interface Transaction {
    created_at?: string;
    inventory_name: string;
    item_name: string;
    unit_name?: string;
    quantity: number;
    affects_stock: string;
    transaction_type_name: string;
    invoice_number?: string;
}

export const useInventoryTransactionReport = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const [inventories, setInventories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        inventory_id: '',
        item_id: '',
        date_from: '',
        date_to: '',
    });

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [invRes, itemRes] = await Promise.all([
                    getInventories(),
                    getItems(5),
                ]);
                setInventories(invRes.data.data || []);
                setItems(itemRes.data.data || []);
            } catch {
                console.error('Failed to load options');
            }
        };
        loadOptions();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    useEffect(() => {
        fetchTransactions();
    }, [page, filters]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await inventoryTransactionReportService.getAll(page, pageSize, filters);
            setTransactions(res.data.data);
            setTotal(res.data.meta?.total || res.data.pagination?.total || 0);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const getFullData = async (): Promise<Transaction[]> => {
        try {
            const res = await inventoryTransactionReportService.getAll(1, total || 9999, filters);
            return res.data.data || [];
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
            return [];
        }
    };

    return {
        transactions,
        loading,
        page,
        total,
        pageSize,
        setPage,
        filters,
        setFilters,
        inventories,
        items,
        fetchTransactions,
        getFullData,
    };
};