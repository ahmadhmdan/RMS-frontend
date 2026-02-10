import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useCountries } from '../hooks/useCountries'
import { useLang } from '../../../core/hooks/useLang'
import { useTranslation } from 'react-i18next'

const Countries = () => {
    const { t } = useTranslation()
    const { get } = useLang()
    const { countries, loading, createCountry, updateCountry, deleteCountry } = useCountries()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'name', header: 'name', render: (item: any) => get(item.name) },
        {
            key: 'is_active',
            header: 'status',
            render: (item: any) => (
                <span className={`badge badge-light-${item.is_active ? 'success' : 'danger'} fs-7`}>
                    {item.is_active ? t('active') : t('inactive')}
                </span>
            ),
        },
        { key: 'cities_count', header: 'cities_count' },
    ]

    const fields = [
        { name: 'name', type: 'text', label: 'name' },
        { name: 'is_active', type: 'checkbox', label: 'is_active' },
    ]

    const validationSchema = Yup.object({
        name: Yup.string().required(t('required')),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        if (editItem) {
            updateCountry(editItem.id, values)
        } else {
            createCountry(values)
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
            name: editItem.name || '',
            is_active: editItem.is_active || false,
        }
        : {
            name: '',
            is_active: true,
        }

    return (
        <div>
            <DataTable
                columns={columns}
                data={countries}
                title={t('countries')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteCountry}
                loading={loading}
            />
            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_country') : t('create_country')}
                fields={fields}
            />
        </div>
    )
}

export default Countries