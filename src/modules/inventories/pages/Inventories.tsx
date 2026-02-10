import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useInventories } from '../hooks/useInventories'
import { useTranslation } from 'react-i18next'

const Inventories = () => {
    const { t } = useTranslation()
    const { inventories, loading, createInventory, updateInventory, deleteInventory } = useInventories()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'inventory_code', header: 'inventory_code', render: (item: any) => item.inventory_code || '-' },
        { key: 'name', header: 'name' },
        {
            key: 'type',
            header: 'type',
            render: (item: any) => (
                <span className={`badge badge-light-${item.type === 'Primary' ? 'primary' : 'info'} fs-7`}>
                    {t(item.type?.toLowerCase() || 'unknown')}
                </span>
            ),
        },
        { key: 'notes', header: 'notes', render: (item: any) => item.notes || '-' },
        {
            key: 'parent_id',
            header: 'parent_inventory',
            render: (item: any) => {
                const parent = inventories.find((inv: any) => inv.id === item.parent_id)
                return parent ? parent.name : '-'
            }
        },
        {
            key: 'is_active',
            header: 'status',
            render: (item: any) => (
                <span className={`badge badge-light-${item.is_active ? 'success' : 'danger'} fs-7`}>
                    {item.is_active ? t('active') : t('inactive')}
                </span>
            ),
        },
    ]

    const fields = [
        { name: 'name', type: 'text', label: 'name', required: true },
        { name: 'inventory_code', type: 'text', label: 'inventory_code' },
        {
            name: 'type',
            type: 'select',
            as: 'select',
            label: 'type',
            options: [
                { value: 'Primary', label: t('primary') },
                { value: 'Secondary', label: t('secondary') },
            ],
            required: true,
        },
        { name: 'notes', type: 'textarea', label: 'notes' },
        {
            name: 'parent_id',
            type: 'select',
            as: 'select',
            label: 'parent_inventory',
            options: inventories.map((inv: any) => ({
                label: inv.name,
                value: inv.id
            }))
        },
        { name: 'is_active', type: 'checkbox', label: 'is_active', defaultChecked: true },
    ]

    const validationSchema = Yup.object({
        name: Yup.string().required(t('required')),
        inventory_code: Yup.string().nullable(),
        type: Yup.string().oneOf(['Primary', 'Secondary']).required(t('required')),
        notes: Yup.string().nullable(),
        parent_id: Yup.number().nullable().positive(t('invalid_parent_id')),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        const backendData = {
            name: values.name.trim(),
            inventory_code: values.inventory_code?.trim() || null,
            type: values.type,
            notes: values.notes?.trim() || null,
            parent_id: values.parent_id ? Number(values.parent_id) : null,
            is_active: values.is_active,
        }

        if (editItem) {
            updateInventory(editItem.id, backendData)
        } else {
            createInventory(backendData)
        }

        setModalShow(false)
    }

    const handleEdit = (item: any) => {
        setEditItem(item)
        setModalShow(true)
    }

    const handleCreate = () => {
        setEditItem(null)
        setModalShow(true)
    }

    const initialValues = editItem
        ? {
            name: editItem.name || '',
            inventory_code: editItem.inventory_code || '',
            type: editItem.type || 'Primary',
            notes: editItem.notes || '',
            parent_id: editItem.parent_id || '',
            is_active: editItem.is_active ?? true,
        }
        : {
            name: '',
            inventory_code: '',
            type: 'Primary',
            notes: '',
            parent_id: '',
            is_active: true,
        }

    return (
        <div>
            <DataTable
                columns={columns}
                data={inventories}
                title={t('inventories')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteInventory}
                loading={loading}
            />

            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_inventory') : t('create_inventory')}
                fields={fields}
            />
        </div>
    )
}

export default Inventories