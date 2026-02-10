import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useItemGroups } from '../hooks/useItemGroups'
import { useTranslation } from 'react-i18next'

const ItemGroups = () => {
    const { t } = useTranslation()
    const { itemGroups, loading, createItemGroup, updateItemGroup, deleteItemGroup } = useItemGroups()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'code', header: 'code' },
        { key: 'name', header: 'name' },
        {
            key: 'parent_id',
            header: 'parent_item_group',
            render: (item: any) => {
                const parent = itemGroups.find((data: any) => data.id === item.parent_id)
                return parent ? parent.name : '-'
            }
        },
        {
            key: 'is_active',
            header: 'is_active',
            render: (item: any) => (
                <span className={`badge badge-light-${item.is_active ? 'success' : 'danger'} fs-7`}>
                    {item.is_active ? t('active') : t('inactive')}
                </span>
            ),
        },
    ]

    const fields = [
        { name: 'code', type: 'text', label: 'code' },
        { name: 'name', type: 'text', label: 'name' },
        {
            name: 'parent_id',
            type: 'select',
            as: 'select',
            label: 'parent_item_group',
            options: itemGroups.map((data: any) => ({
                label: data.name,
                value: data.id
            }))
        },
        { name: 'is_active', type: 'checkbox', label: 'is_active' },
    ]

    const validationSchema = Yup.object({
        code: Yup.string().required(t('required')),
        name: Yup.string().required(t('required')),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        if (editItem) {
            updateItemGroup(editItem.id, values)
        } else {
            createItemGroup(values)
        }
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
            code: editItem.code || '',
            name: editItem.name || '',
            parent_id: editItem.parent_id || '',
            is_active: editItem.is_active || false,
        }
        : {
            code: '',
            name: '',
            parent_id: '',
            is_active: true,
        }

    return (
        <div>
            <DataTable
                columns={columns}
                data={itemGroups}
                title={t('item_groups')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteItemGroup}
                loading={loading}
            />
            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_item_group') : t('create_item_group')}
                fields={fields}
            />
        </div>
    )
}

export default ItemGroups