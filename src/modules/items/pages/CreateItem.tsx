import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useItemData } from '../hooks/useCreateItem';
import { createItem, getUnitPrice, updateItem } from '../services/createItem.service';
import FormModal from '../../../core/components/FormModal';
import { unitsService } from '../../../modules/units/services/units.service';
import '../../invoices/components/CreateInvoice.css';
import '../components/CreateInvoice_2.css';
import BasicInformation from '../components/BasicInformation';
import ItemUnitsTable from '../components/ItemUnitsTable';
import ItemIngredientsTable from '../components/ItemIngredientsTable';
import PricingCalculation from '../components/PricingCalculation';
import { useQueryClient } from '@tanstack/react-query';

interface UnitItem {
    item_unit_id?: number;
    unit_id: string;
    fold: number;
    is_primary: boolean;
    is_default: boolean;
}

interface IngredientItem {
    item_ingredient_id?: number;
    ingredient_id: string;
    unit_id: string;
    quantity: number;
    default_inventory_id: string;
    unit_price?: number;
}

interface FormValues {
    name: string;
    description: string;
    category_id: string;
    item_group_id: string;
    recipe_unit_id: string;
    recipe_quantity: number;
    item_code: string;
    limit: number;
    limit_unit_id: string;
    inventory_id: string;
    units: UnitItem[];
    ingredients: IngredientItem[];
    hasSellPrice: boolean;
    sell_price?: number;
}

const CreateItem: React.FC = () => {
    const { id, type } = useParams<{ id?: string; type: string }>();
    const isEdit = !!id;
    const formattedType = type ? type.split('-').map(word => word.charAt(0).toLowerCase() + word.slice(1)).join('_') : '';
    const isProduced = type === 'half-produced' || type === 'full-produced' || type === 'reverse-produced';
    const typeMap: { [key: string]: number } = {
        'raw': 0,
        'half-produced': 1,
        'full-produced': 2,
        'serviceable': 3,
        'reverse-produced': 4,
    };
    const itemType = typeMap[type || 'raw'];
    const unitsRowRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
    const ingredientsRowRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
    const [focusAfterDeleteUnits, setFocusAfterDeleteUnits] = useState<{ row: number; field: number } | null>(null);
    const [focusAfterDeleteIngredients, setFocusAfterDeleteIngredients] = useState<{ row: number; field: number } | null>(null);
    const [priceType, setPriceType] = useState<'average' | 'last'>('average');
    const [modalShow, setModalShow] = useState(false);
    const [pricingData, setPricingData] = useState<any>(null);
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const {
        categories,
        unitsList,
        itemsList,
        unitsMap,
        inventories,
        itemGroups,
        fetchUnits,
        calculatePricing,
        refreshUnitsList,
        loading,
        itemData
    } = useItemData(isEdit ? id : undefined);
    const queryClient = useQueryClient();
    const baseSchema = {
        name: Yup.string().required(t('name_is_required')),
        description: Yup.string().optional(),
        category_id: Yup.string().required(t('category_is_required')),
        item_group_id: Yup.string().required(t('item_group_is_required')),
        item_code: Yup.string().optional(),
        limit: Yup.number().min(0).optional(),
        limit_unit_id: Yup.string().optional(),
        hasSellPrice: Yup.boolean(),
        sell_price: Yup.number().when('hasSellPrice', {
            is: true,
            then: (schema) => schema.positive(t('positive')).required(t('required')),
        }),
        units: Yup.array().of(
            Yup.object().shape({
                unit_id: Yup.string().required(t('required')),
                fold: Yup.number().positive(t('fold_must_be_positive')).required(t('required')),
                is_primary: Yup.boolean(),
                is_default: Yup.boolean(),
            })
        ).min(1, t('at_least_one_unit_required'))
            .test('one-primary', t('exactly_one_primary_unit'), function (units) {
                return units?.filter(u => u.is_primary).length === 1;
            })
            .test('one-default', t('exactly_one_default_unit'), function (units) {
                return units?.filter(u => u.is_default).length === 1;
            }),
    };
    if (isProduced) {
        (baseSchema as any).recipe_unit_id = Yup.string().required(t('recipe_unit_is_required'));
        (baseSchema as any).recipe_quantity = Yup.number().positive(t('quantity_must_be_positive')).required(t('required'));
        (baseSchema as any).inventory_id = Yup.string().required(t('inventory_is_required'));
        (baseSchema as any).ingredients = Yup.array().of(
            Yup.object().shape({
                ingredient_id: Yup.string().required(t('required')),
                unit_id: Yup.string().required(t('required')),
                quantity: Yup.number().positive(t('quantity_must_be_positive')).required(t('required')),
                default_inventory_id: Yup.string().optional(),
            })
        ).min(1, t('at_least_one_ingredient_required'));
    }
    const validationSchema = Yup.object().shape(baseSchema);
    const formik = useFormik<FormValues>({
        initialValues: {
            name: '',
            description: '',
            category_id: '',
            item_group_id: '',
            recipe_unit_id: '',
            recipe_quantity: 0,
            item_code: '',
            limit: 0,
            limit_unit_id: '',
            inventory_id: '',
            units: [{ unit_id: '', fold: 0, is_primary: false, is_default: false }],
            ingredients: isProduced ? [{ ingredient_id: '', unit_id: '', quantity: 0, default_inventory_id: '' }] : [],
            hasSellPrice: false,
            sell_price: undefined,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const payload: any = {
                id: isEdit ? Number(id) : undefined,
                name: { ar: values.name },
                description: values.description ? { ar: values.description } : null,
                type: itemType,
                category_id: Number(values.category_id),
                item_group_id: Number(values.item_group_id),
                item_code: values.item_code || null,
                limit: values.limit || null,
                limit_unit_id: values.limit_unit_id ? Number(values.limit_unit_id) : null,
                item_units: values.units.map((u) => ({
                    ...(u.item_unit_id ? { item_unit_id: u.item_unit_id } : {}),
                    unit_id: Number(u.unit_id),
                    fold: u.fold,
                    is_primary: u.is_primary ? 1 : 0,
                    is_default: u.is_default ? 1 : 0,
                })),
            }
            if (values.hasSellPrice && values.sell_price) {
                payload.sell_price = values.sell_price;
            }
            if (isProduced) {
                payload.recipe_unit_id = Number(values.recipe_unit_id)
                payload.recipe_quantity = values.recipe_quantity
                payload.default_inventory_id = Number(values.inventory_id)
                payload.item_ingredients = values.ingredients
                    .filter((i) => i.ingredient_id)
                    .map((i) => ({
                        ...(i.item_ingredient_id ? { item_ingredient_id: i.item_ingredient_id } : {}),
                        ingredient_id: Number(i.ingredient_id),
                        unit_id: Number(i.unit_id),
                        quantity: i.quantity,
                        default_inventory_id: i.default_inventory_id ? Number(i.default_inventory_id) : null,
                    }))
            }

            try {
                let response

                if (isEdit && id) {
                    response = await updateItem(id, payload)
                    const updatedItem = response.data

                    queryClient.setQueryData(['itemData'], (old: any) => {
                        if (!old) return [updatedItem]
                        return old.map((item: any) =>
                            item.id === Number(id) ? updatedItem : item
                        )
                    })

                    Swal.fire({
                        icon: 'success',
                        title: t('success'),
                        text: t('item_updated_successfully'),
                        timer: 1500,
                        showConfirmButton: true,
                    }).then(() => navigate(-1))

                } else {
                    response = await createItem(payload)
                    const newItem = response.data

                    queryClient.setQueryData(['itemData'], (old: any) => {
                        if (!old) return [newItem]
                        return [...old, newItem]
                    })

                    Swal.fire({
                        icon: 'success',
                        title: t('success'),
                        text: t('item_created_successfully'),
                        timer: 1500,
                        showConfirmButton: true,
                    }).then(() => navigate(-1))
                }

            } catch (error: any) {
                console.error('Error processing item:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: error.response?.data?.message || (isEdit ? t('error_updating_item') : t('error_creating_item')),
                })
            }
        },
    })

    const fetchPriceForRow = async (index: number) => {
        const ingredient = formik.values.ingredients[index];
        if (!ingredient.ingredient_id || !ingredient.unit_id) {
            formik.setFieldValue(`ingredients.${index}.unit_price`, 0);
            return;
        }
        try {
            const price = await getUnitPrice(priceType, ingredient.ingredient_id, ingredient.unit_id);
            formik.setFieldValue(`ingredients.${index}.unit_price`, price ?? 0);
        } catch (err) {
            console.error('Failed to fetch price:', err);
            formik.setFieldValue(`ingredients.${index}.unit_price`, 0);
        }
    };
    useEffect(() => {
        formik.values.ingredients.forEach((_: any, index: number) => {
            fetchPriceForRow(index);
        });
    }, [priceType, formik.values.ingredients.length]);
    useEffect(() => {
        if (isProduced && formik.values.ingredients.length > 0) {
            calculatePricing(formik.values.ingredients).then(setPricingData);
        } else {
            setPricingData(null);
        }
    }, [formik.values.ingredients, isProduced]);
    useEffect(() => {
        if (isProduced) {
            formik.values.ingredients.forEach((it: any, index: number) => {
                if (it.ingredient_id && unitsMap[it.ingredient_id]) {
                    const units = unitsMap[it.ingredient_id];
                    const defaultUnit = units.find((u: any) => u.is_default);
                    if (defaultUnit && !it.unit_id) {
                        formik.setFieldValue(`ingredients.${index}.unit_id`, defaultUnit.id.toString());
                    }
                }
            });
        }
    }, [unitsMap, formik.values.ingredients, isProduced]);
    useEffect(() => {
        const lastUnitRowIndex = formik.values.units.length - 1;
        unitsRowRefs.current[lastUnitRowIndex]?.[0]?.focus();
    }, [formik.values.units.length]);
    useEffect(() => {
        if (isProduced) {
            const lastIngredientRowIndex = formik.values.ingredients.length - 1;
            ingredientsRowRefs.current[lastIngredientRowIndex]?.[0]?.focus();
        }
    }, [formik.values.ingredients.length, isProduced]);
    useEffect(() => {
        if (focusAfterDeleteUnits !== null) {
            unitsRowRefs.current[focusAfterDeleteUnits.row]?.[focusAfterDeleteUnits.field]?.focus();
            setFocusAfterDeleteUnits(null);
        }
    }, [focusAfterDeleteUnits, formik.values.units]);
    useEffect(() => {
        if (focusAfterDeleteIngredients !== null && isProduced) {
            ingredientsRowRefs.current[focusAfterDeleteIngredients.row]?.[focusAfterDeleteIngredients.field]?.focus();
            setFocusAfterDeleteIngredients(null);
        }
    }, [focusAfterDeleteIngredients, formik.values.ingredients, isProduced]);
    useEffect(() => {
        if (itemData) {
            const data = itemData;
            const mappedValues: FormValues = {
                name: data.name.ar,
                description: data.description?.ar || '',
                category_id: data.category_id,
                item_group_id: data.item_group_id,
                item_code: data.item_code || '',
                limit: Number(data.limit) || 0,
                limit_unit_id: data.limit_unit_id?.toString() || '',
                inventory_id: data.default_inventory_id?.toString() || '',
                recipe_unit_id: data.recipe_unit_id?.toString() || '',
                recipe_quantity: Number(data.recipe_quantity) || 0,
                units: data.item_units.map((u: any) => ({
                    item_unit_id: u.item_unit_id,
                    unit_id: u.unit_id.toString(),
                    fold: Number(u.fold),
                    is_primary: !!u.is_primary,
                    is_default: !!u.is_default,
                })),
                ingredients: data.item_ingredients?.map((i: any) => ({
                    item_ingredient_id: i.item_ingredient_id,
                    ingredient_id: i.ingredient_id.toString(),
                    unit_id: i.unit_id.toString(),
                    quantity: Number(i.quantity),
                    default_inventory_id: i.default_inventory_id?.toString() || '',
                    unit_price: 0, // Will be fetched later
                })) || [],
                hasSellPrice: !!data.sell_price,
                sell_price: data.sell_price || undefined,
            };
            formik.setValues(mappedValues);
        }
    }, [itemData]);
    useEffect(() => {
        if (itemData && isProduced && itemData.item_ingredients) {
            itemData.item_ingredients.forEach((ing: any) => {
                if (!unitsMap[ing.ingredient_id]) {
                    fetchUnits(ing.ingredient_id.toString());
                }
            });
        }
    }, [itemData, isProduced, unitsMap, fetchUnits]);
    const handleUnitsKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: UnitItem) => void; remove: (index: number) => void }
    ) => {
        if (['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }
        const currentRowRefs = unitsRowRefs.current[rowIndex];
        if (!currentRowRefs) return;
        if (e.key === 'Delete' && formik.values.units.length > 1) {
            let targetRow = rowIndex;
            let targetField = fieldIndex;
            if (rowIndex === formik.values.units.length - 1 && rowIndex > 0) {
                targetRow = rowIndex - 1;
                targetField = 0;
            }
            arrayHelpers.remove(rowIndex);
            setFocusAfterDeleteUnits({ row: targetRow, field: targetField });
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (fieldIndex < 3) {
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < formik.values.units.length - 1) {
                unitsRowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                arrayHelpers.push({ unit_id: '', fold: 0, is_primary: false, is_default: false });
            }
            return;
        }
        if (e.key === 'ArrowLeft' && fieldIndex < 3) {
            currentRowRefs[fieldIndex + 1]?.focus();
        } else if (e.key === 'ArrowRight' && fieldIndex > 0) {
            currentRowRefs[fieldIndex - 1]?.focus();
        }
    };
    const handleIngredientsKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number,
        arrayHelpers: { push: (obj: IngredientItem) => void; remove: (index: number) => void }
    ) => {
        if (['Enter', 'Tab', 'ArrowRight', 'ArrowLeft', 'Delete'].includes(e.key)) {
            e.preventDefault();
        }
        const currentRowRefs = ingredientsRowRefs.current[rowIndex];
        if (!currentRowRefs) return;
        if (e.key === 'Delete' && formik.values.ingredients.length > 1) {
            let targetRow = rowIndex;
            let targetField = fieldIndex;
            if (rowIndex === formik.values.ingredients.length - 1 && rowIndex > 0) {
                targetRow = rowIndex - 1;
                targetField = 0;
            }
            arrayHelpers.remove(rowIndex);
            setFocusAfterDeleteIngredients({ row: targetRow, field: targetField });
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (fieldIndex < 3) {
                currentRowRefs[fieldIndex + 1]?.focus();
            } else if (rowIndex < formik.values.ingredients.length - 1) {
                ingredientsRowRefs.current[rowIndex + 1][0]?.focus();
            } else {
                arrayHelpers.push({ ingredient_id: '', unit_id: '', quantity: 0, default_inventory_id: '' });
            }
            return;
        }
        if (e.key === 'ArrowLeft' && fieldIndex < 3) {
            currentRowRefs[fieldIndex + 1]?.focus();
        } else if (e.key === 'ArrowRight' && fieldIndex > 0) {
            currentRowRefs[fieldIndex - 1]?.focus();
        }
    };
    const handlePrimaryChange = (index: number, checked: boolean) => {
        if (checked) {
            formik.values.units.forEach((_: any, i: number) => {
                if (i !== index) {
                    formik.setFieldValue(`units.${i}.is_primary`, false);
                }
            });
        }
        formik.setFieldValue(`units.${index}.is_primary`, checked);
    };
    const handleDefaultChange = (index: number, checked: boolean) => {
        if (checked) {
            formik.values.units.forEach((_: any, i: number) => {
                if (i !== index) {
                    formik.setFieldValue(`units.${i}.is_default`, false);
                }
            });
        }
        formik.setFieldValue(`units.${index}.is_default`, checked);
    };
    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        formik.handleChange(e);
        fetchPriceForRow(index);
    };
    const fields = [
        { name: 'name', type: 'text', label: 'name' },
        { name: 'description', type: 'textarea', label: 'description' },
        { name: 'is_active', type: 'checkbox', label: 'active' },
    ];
    const unitValidationSchema = Yup.object({
        name: Yup.string().required(t('required')).trim(),
        description: Yup.string().nullable(),
        is_active: Yup.boolean(),
    });
    const handleUnitSubmit = async (values: any) => {
        const backendData = {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            is_active: values.is_active ? 1 : 0,
        };
        try {
            await unitsService.create(backendData);
            await refreshUnitsList();
            setModalShow(false);
        } catch (err: any) {
            console.error('Failed to create unit:', err);
            Swal.fire({
                icon: 'error',
                title: t('error'),
                text: err.response?.data?.message || t('failed_to_create_unit'),
            });
        }
    };
    const initialUnitValues = {
        name: '',
        description: '',
        is_active: true,
    };
    const getItemName = (id: number) => {
        const item = itemsList.find((it: any) => it.id === id);
        return item ? item.name : id;
    };
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }
    return (
        <div className="d-flex flex-column flex-lg-row gap-6">
            <div className="flex-grow-1">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title d-flex align-items-center gap-4">
                            <h2 className="fw-bold fs-2 mb-0">{isEdit ? t('edit') : t('create')} {t(formattedType)}</h2>
                        </div>
                        <div className="card-toolbar">
                            <button className="btn btn-light" onClick={() => navigate(-1)}>
                                <i className="ki-outline ki-arrow-left fs-2" style={{ paddingLeft: '0px' }}></i>
                            </button>
                        </div>
                    </div>
                    <div className="separator my-8"></div>
                    <div className="card-body p-9">
                        <FormikProvider value={formik}>
                            <form onSubmit={formik.handleSubmit}>
                                <BasicInformation
                                    formik={formik}
                                    categories={categories}
                                    itemGroups={itemGroups}
                                    unitsList={unitsList}
                                    inventories={inventories}
                                    isProduced={isProduced}
                                    t={t}
                                    type={type || ''}
                                />
                                <div className="separator separator-dashed my-8"></div>
                                <ItemUnitsTable
                                    formik={formik}
                                    unitsList={unitsList}
                                    mode={mode}
                                    t={t}
                                    handlePrimaryChange={handlePrimaryChange}
                                    handleDefaultChange={handleDefaultChange}
                                    unitsRowRefs={unitsRowRefs}
                                    handleUnitsKeyDown={handleUnitsKeyDown}
                                    setFocusAfterDeleteUnits={setFocusAfterDeleteUnits}
                                    setModalShow={setModalShow}
                                />
                                {isProduced && <div className="separator separator-dashed my-8"></div>}
                                {isProduced && (
                                    <ItemIngredientsTable
                                        formik={formik}
                                        itemsList={itemsList}
                                        unitsMap={unitsMap}
                                        inventories={inventories}
                                        mode={mode}
                                        priceType={priceType}
                                        setPriceType={setPriceType}
                                        t={t}
                                        ingredientsRowRefs={ingredientsRowRefs}
                                        handleIngredientsKeyDown={handleIngredientsKeyDown}
                                        setFocusAfterDeleteIngredients={setFocusAfterDeleteIngredients}
                                        handleUnitChange={handleUnitChange}
                                        fetchUnits={fetchUnits}
                                    />
                                )}
                                <div className="d-flex justify-content-start mt-12">
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={formik.isSubmitting}>
                                        {formik.isSubmitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                        {t('save')}
                                    </button>
                                </div>
                            </form>
                            <FormModal
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                onSubmit={handleUnitSubmit}
                                initialValues={initialUnitValues}
                                validationSchema={unitValidationSchema}
                                title={t('create_unit')}
                                fields={fields}
                            />
                        </FormikProvider>
                    </div>
                </div>
            </div>
            {isProduced && (
                <div className="d-none d-lg-block position-sticky flex-shrink-0" style={{ top: '20px', alignSelf: 'flex-start', width: '380px' }}>
                    <PricingCalculation
                        pricingData={pricingData}
                        t={t}
                        getItemName={getItemName}
                    />
                </div>
            )}
        </div>
    );
};
export default CreateItem;