import { useState, useEffect } from 'react';
import { itemTransactionsService } from '../services/itemTransactions.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../core/api/axiosInstance';
import { getInventories } from '../../../core/api/inventories.api';
import { getTransactionTypes } from '../../../core/api/transactionType.api';

interface Item {
    id: number;
    code: string;
    name: string;
}

interface UnitStock {
    unit_id: number;
    unit_name: string;
    quantity: number;
    is_primary: boolean;
}

interface Summary {
    total_quantity_in: number;
    total_quantity_out: number;
    net_quantity_from_transactions: number;
    primary_unit_name: string;
    current_stock_in_all_units: UnitStock[];
    current_stock_primary: number;
    total_value_in: number;
    total_value_out: number;
    net_value: number;
    total_transactions: number;
}

interface Transaction {
    id: number;
    invoice_no: number;
    invoice_date: string;
    unit_name: string;
    quantity: number;
    affects_stock: string;
    inventory_name: string;
    supplier_name: string;
    transaction_type_name: string | number;
    unit_price: number;
    total_price: number;
    currency_symbol: string | null;
    currency_name: string;
    created_at: string;
}

export const useItemTransactions = (itemId: number) => {
    const { t } = useTranslation();

    const [item, setItem] = useState<Item | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const [filters, setFilters] = useState({
        inventory_id: '',
        supplier_id: '',
        transaction_type_id: '',
        from_date: '',
        to_date: '',
    });

    const [inventories, setInventories] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [transactionTypes, setTransactionTypes] = useState<any[]>([]);

    useEffect(() => {
        const loadInventories = async () => {
            try {
                const res = await getInventories();
                setInventories(res.data.data || []);
            } catch (error) {
                console.error('Failed to load inventories');
            }
        };
        loadInventories();
    }, []);

    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const res = await axiosInstance.get('/suppliers');
                setSuppliers(res.data.data || []);
            } catch (error) {
                console.error('Failed to load suppliers');
            }
        };
        loadSuppliers();
    }, []);

    useEffect(() => {
        const loadTransactionTypes = async () => {
            try {
                const res = await getTransactionTypes();
                setTransactionTypes(res.data.data || []);
            } catch (error) {
                console.error('Failed to load transaction types');
            }
        };
        loadTransactionTypes();
    }, []);

    const fetchTransactions = async (pageNum: number) => {
        if (!itemId) return;

        setLoading(true);
        try {
            const params = {
                page: pageNum,
                per_page: pageSize,
                ...filters,
            };
            const res = await itemTransactionsService.getTransactions(itemId, params);

            const payload = res.data?.data;

            if (!payload) {
                throw new Error('Invalid response structure');
            }

            setItem(payload.item || null);
            setSummary(payload.summary || null);
            setTransactions(payload.transactions || []);
            setTotal(payload.pagination?.total || 0);
            setPage(payload.pagination?.current_page || 1);
        } catch (error: any) {
            console.error('Fetch transactions error:', error);
            Swal.fire(
                t('error'),
                error.response?.data?.message || t('failed_to_load_transactions'),
                'error'
            );
            setTransactions([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
    }, [itemId, page, filters]);

    return {
        item,
        summary,
        transactions,
        loading,
        page,
        total,
        pageSize,
        setPage,
        refetch: () => fetchTransactions(page),
        filters,
        setFilters,
        inventories,
        suppliers,
        transactionTypes,
    };
};