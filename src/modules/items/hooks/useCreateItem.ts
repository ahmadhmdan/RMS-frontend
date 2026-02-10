import { useEffect, useState } from 'react';
import axiosInstance from '../../../core/api/axiosInstance';
import { getCategories } from '../../../core/api/categories.api';
import { getUnits } from '../../invoices/services/createInvoices.service';
import { getInventories } from '../../../core/api/inventories.api';
import { itemGroupService } from '../../item-groups/services/ItemGroups.service';
import { useQuery } from '@tanstack/react-query';
import { fetchItemData } from '../../../core/queries/itemData.query';
import { getItemById } from '../services/createItem.service';

interface IngredientItem {
    ingredient_id: string;
    unit_id: string;
    quantity: number;
    default_inventory_id: string;
    unit_price?: number;
}

export const getAllUnits = () => axiosInstance.get('/units');

export const useItemData = (editItemId?: string) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [unitsList, setUnitsList] = useState<any[]>([]);
    const [itemsList, setItemsList] = useState<any[]>([]);
    const [unitsMap, setUnitsMap] = useState<{ [key: string]: any[] }>({});
    const [inventories, setInventories] = useState<any[]>([]);
    const [itemGroups, setItemGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(editItemId ? true : true);
    const [itemData, setItemData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    const itemQuery = useQuery({
        queryKey: ['itemData'],
        queryFn: fetchItemData,
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // If editing an item, prioritize loading the item data first
                if (editItemId) {
                    try {
                        // Fetch the specific item first
                        const response = await getItemById(editItemId);
                        setItemData(response.data);
                        // Close spinner once item is loaded
                        setLoading(false);
                    } catch (err) {
                        console.error('Error fetching item:', err);
                        setError(err);
                        setLoading(false);
                    }

                    // Load the rest of the data in the background (non-blocking)
                    Promise.all([
                        getCategories(),
                        getAllUnits(),
                        getInventories(),
                        itemGroupService.getAll(),
                    ]).then(([catRes, unitsRes, invRes, groupRes]) => {
                        setCategories(catRes.data.data);
                        setUnitsList(unitsRes.data.data);
                        setInventories(invRes.data.data || []);
                        setItemGroups(groupRes.data.data || []);
                    }).catch(err => {
                        console.error('Error fetching dropdown data:', err);
                        setError(err);
                    });
                } else {
                    // For creating new items, load all data at once
                    setLoading(false);
                    const [catRes, unitsRes, invRes, groupRes] = await Promise.all([
                        getCategories(),
                        getAllUnits(),
                        getInventories(),
                        itemGroupService.getAll(),
                    ]);
                    setCategories(catRes.data.data);
                    setUnitsList(unitsRes.data.data);
                    setInventories(invRes.data.data || []);
                    setItemGroups(groupRes.data.data || []);

                }
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [editItemId]);

    useEffect(() => {
        if (itemQuery.data) {
            setItemsList(itemQuery.data);
        }
    }, [itemQuery.data]);

    const fetchUnits = async (itemId: string) => {
        if (unitsMap[itemId]) return;
        try {
            const units = await getUnits(itemId);
            setUnitsMap(prev => ({ ...prev, [itemId]: units }));
        } catch (err) { }
    };

    const refreshUnitsList = async () => {
        const res = await getAllUnits();
        setUnitsList(res.data.data);
    };

    const calculatePricing = async (ingredients: IngredientItem[]) => {
        const payload = {
            item_ingredients: ingredients
                .filter(i => i.ingredient_id)
                .map(i => ({
                    ingredient_id: Number(i.ingredient_id),
                    unit_id: Number(i.unit_id),
                    quantity: i.quantity,
                    default_inventory_id: i.default_inventory_id ? Number(i.default_inventory_id) : null,
                })),
        };
        if (payload.item_ingredients.length === 0) return null;
        try {
            const res = await axiosInstance.post('/items/calculate-pricing', payload);
            return res.data.data;
        } catch (err) {
            return null;
        }
    };

    return {
        categories,
        unitsList,
        itemsList,
        unitsMap,
        inventories,
        itemGroups,
        fetchUnits,
        refreshUnitsList,
        calculatePricing,
        loading,
        error,
        itemData,
    };
};
