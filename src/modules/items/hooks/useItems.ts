import { useState, useEffect } from 'react';
import { itemsService } from '../services/items.service';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../../core/api/categories.api';
import { getItemGroups } from '../../../core/api/item-groups.api';

export const useItems = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(100000); // Large initial value to fetch all
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState<any[]>([]);
    const [itemGroups, setItemGroups] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [itemGroupId, setItemGroupId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await getCategories();
                setCategories(catRes.data.data || []);
                const groupRes = await getItemGroups();
                setItemGroups(groupRes.data.data || []);
            } catch (error) {
                Swal.fire(t('error'), t('fetch.error'), 'error');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [page, pageSize, search, categoryId, itemGroupId]);

    useEffect(() => {
        setPage(1);
    }, [pageSize, search, categoryId, itemGroupId]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const effectiveLimit = pageSize >= 100000 ? 100000 : pageSize;
            const res = await itemsService.getAll(page, effectiveLimit, search, categoryId, itemGroupId);
            setItems(res.data.data);
            setTotal(res.data.meta?.total || 0);
        } catch (error) {
            Swal.fire(t('error'), t('fetch.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await itemsService.delete(id)
            Swal.fire(t('success'), t('delete.success'), 'success')
            fetchItems()
        } catch (error) {
            Swal.fire(t('error'), t('delete.error'), 'error')
        }
    }

    return {
        items,
        loading,
        page,
        total,
        pageSize,
        setPage,
        setPageSize,
        fetchItems,
        categories,
        itemGroups,
        search,
        setSearch,
        categoryId,
        setCategoryId,
        itemGroupId,
        setItemGroupId,
        deleteItem,
    };
};