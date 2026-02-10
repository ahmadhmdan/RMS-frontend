import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useCategories } from '../hooks/useCategories'
import { useTranslation } from 'react-i18next'

const Categories = () => {
    const { t } = useTranslation()
    const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'category_code', header: 'category_code', render: (item: any) => item.category_code || '-' },
        { key: 'name', header: 'name' },
        {
            key: 'parent_id',
            header: 'parent_category',
            render: (item: any) => {
                const parent = categories.find((cat: any) => cat.id === item.parent_id)
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
        { name: 'description', type: 'textarea', label: 'description' },
        { name: 'category_code', type: 'text', label: 'category_code' },
        {
            name: 'parent_id',
            type: 'select',
            as: 'select',
            label: 'parent_category',
            options: categories.map((cat: any) => ({
                label: cat.name,
                value: cat.id
            }))
        },
        { name: 'is_active', type: 'checkbox', label: 'is_active', defaultChecked: true },
    ]

    const validationSchema = Yup.object({
        name: Yup.string().required(t('required')),
        description: Yup.string().nullable(),
        category_code: Yup.string().nullable(),
        parent_id: Yup.number().nullable().positive(t('invalid_parent_id')),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        const backendData = {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            category_code: values.category_code?.trim() || null,
            parent_id: values.parent_id ? Number(values.parent_id) : null,
            is_active: values.is_active,
        }

        if (editItem) {
            updateCategory(editItem.id, backendData)
        } else {
            createCategory(backendData)
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
            description: editItem.description || '',
            category_code: editItem.category_code || '',
            parent_id: editItem.parent_id || '',
            is_active: editItem.is_active ?? true,
        }
        : {
            name: '',
            description: '',
            category_code: '',
            parent_id: '',
            is_active: true,
        }

    return (
        <div>
            <DataTable
                columns={columns}
                data={categories}
                title={t('categories')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteCategory}
                loading={loading}
            />

            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_category') : t('create_category')}
                fields={fields}
            />
        </div>
    )
}

export default Categories