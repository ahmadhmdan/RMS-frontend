import { useState, useEffect } from 'react';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../../core/api/categories.api';
import { getItemGroups } from '../../../core/api/item-groups.api';
import { getInventories } from '../../../core/api/inventories.api';
import { useQuery } from '@tanstack/react-query';
import { fetchItemData } from '../../../core/queries/itemData.query';

export const useCreateInventoryCount = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<any[]>([]);
    const [itemGroups, setItemGroups] = useState<any[]>([]);
    const [inventories, setInventories] = useState<any[]>([]);
    const [itemsOptions, setItemsOptions] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [filters, setFilters] = useState({
        inventory_id: '',
        category_id: '',
        item_group_id: '',
        item_id: '',
        price_type: 'avg',
    });
    const [items, setItems] = useState<any[]>([]);

    const itemQuery = useQuery({
        queryKey: ['itemData'],
        queryFn: fetchItemData,
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, groupRes, invRes] = await Promise.all([
                    getCategories(),
                    getItemGroups(),
                    getInventories(),
                ]);
                setCategories(catRes.data.data || []);
                setItemGroups(groupRes.data.data || []);
                setInventories(invRes.data.data || []);
                if (itemQuery.data) {
                    setItemsOptions(itemQuery.data);
                }
            } catch (error) {
                Swal.fire(t('error'), t('fetch.error'), 'error');
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [t, itemQuery.data]);

    useEffect(() => {
        if (itemQuery.data && loadingOptions) {
            setItemsOptions(itemQuery.data);
        }
    }, [itemQuery.data, loadingOptions]);

    const applyFilters = async () => {
        if (!filters.inventory_id || !filters.price_type) {
            Swal.fire(t('error'), t('please_select_inventory'), 'error');
            return;
        }
        setLoadingItems(true);
        setShowTable(false);
        try {
            const res = await inventoryCountsService.getMatching(filters);
            setItems(res.data || []);
            setShowTable(true);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoadingItems(false);
        }
    };

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return {
        categories,
        itemGroups,
        inventories,
        itemsOptions,
        loadingOptions: loadingOptions || itemQuery.isLoading,
        loadingItems,
        showTable,
        filters,
        updateFilter,
        applyFilters,
        items,
        setItems,
    };
};