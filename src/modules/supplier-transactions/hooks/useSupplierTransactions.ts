import { useState, useEffect } from 'react';
import { supplierTransactionsService } from '../services/supplierTransactions.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { getSuppliers } from '../../../core/api/suppliers.api';
import { getInventories } from '../../../core/api/inventories.api';
import { getTransactionTypes } from '../../../core/api/transactionType.api';
import { getCategories } from '../../../core/api/categories.api';
import { getItemGroups } from '../../../core/api/item-groups.api';

interface Supplier {
    id: number;
    name: string;
}

interface Inventory {
    id: number;
    name: string;
}

interface TransactionType {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface ItemGroup {
    id: number;
    name: string;
}

interface Summary {
    total_quantity_in: number;
    total_quantity_out: number;
    net_quantity: number;
    total_value_in: number;
    total_value_out: number;
    net_value: number;
    total_suppliers: number;
    total_transactions: number;
}

export interface Transaction {
    id: number;
    invoice_id: number;
    invoice_no: number;
    invoice_date: string;
    item_name: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
    unit_price_currency_symbol: string;
    total_price: number;
    total_price_currency_symbol: string;
    affects_stock: 'increase' | 'decrease';
    transaction_type_name: string;
    supplier_name: string;
    inventory_name: string;
    created_at: string;
}

export const useSupplierTransactions = () => {
    const { t } = useTranslation();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [filtersInfo, setFiltersInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 1000;

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);

    const [filters, setFilters] = useState({
        supplier_id: '',
        item_name: '',
        date_from: '',
        date_to: '',
        inventory_id: '',
        transaction_type_id: '',
        category_id: '',
        item_group_id: '',
    });

    useEffect(() => {
        const loadFiltersData = async () => {
            try {
                const supRes = await getSuppliers();
                setSuppliers(supRes.data.data || []);
                const invRes = await getInventories();
                setInventories(invRes.data.data || []);
                const ttRes = await getTransactionTypes();
                setTransactionTypes(ttRes.data.data || []);
                const catRes = await getCategories();
                setCategories(catRes.data.data || []);
                const igRes = await getItemGroups();
                setItemGroups(igRes.data.data || []);
            } catch {
                console.error('Failed to load filters data');
            }
        };
        loadFiltersData();
    }, []);

    const fetchTransactions = async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                per_page: pageSize,
                supplier_id: filters.supplier_id || undefined,
                item_name: filters.item_name || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                inventory_id: filters.inventory_id || undefined,
                transaction_type_id: filters.transaction_type_id || undefined,
                category_id: filters.category_id || undefined,
                item_group_id: filters.item_group_id || undefined,
            };

            const res = await supplierTransactionsService.getTransactions(params);
            const payload = res.data?.data;

            if (!payload) throw new Error('Invalid response');

            setFiltersInfo(payload.filters);
            setSummary(payload.summary || null);
            setTransactions(payload.transactions || []);
            setTotal(payload.pagination?.total || 0);
            setPage(payload.pagination?.current_page || 1);
        } catch (error: any) {
            Swal.fire(
                t('error'),
                error.response?.data?.message || t('failed_to_load_data'),
                'error'
            );
            setTransactions([]);
            setTotal(0);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTransactions = async () => {
        try {
            const params = {
                supplier_id: filters.supplier_id || undefined,
                item_name: filters.item_name || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                inventory_id: filters.inventory_id || undefined,
                transaction_type_id: filters.transaction_type_id || undefined,
                category_id: filters.category_id || undefined,
                item_group_id: filters.item_group_id || undefined,
            };

            const res = await supplierTransactionsService.getTransactions(params);
            return res.data?.data?.transactions || [];
        } catch (error: any) {
            Swal.fire(
                t('error'),
                error.response?.data?.message || t('failed_to_load_data'),
                'error'
            );
            return [];
        }
    };

    useEffect(() => {
        fetchTransactions(1);
    }, [filters]);

    return {
        transactions,
        summary,
        filtersInfo,
        loading,
        page,
        total,
        pageSize,
        setPage,
        filters,
        setFilters,
        suppliers,
        inventories,
        transactionTypes,
        categories,
        itemGroups,
        refetch: () => fetchTransactions(page),
        fetchAllTransactions,
    };
};