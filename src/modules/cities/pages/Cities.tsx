import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useCities } from '../hooks/useCities'
import { useCountriesSelect } from '../../countries/hooks/useCountriesSelect'
import { useTranslation } from 'react-i18next'

const Cities = () => {
    const { t } = useTranslation()
    const { cities, loading, createCity, updateCity, deleteCity } = useCities()
    const { countries, loading: countriesLoading } = useCountriesSelect()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'name', header: 'name' },
        { key: 'country', header: 'country' },
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
        {
            name: 'country_id',
            type: 'select',
            as: 'select',
            label: 'country',
            options: countries,
            isLoading: countriesLoading,
        },
        { name: 'name', type: 'text', label: 'name' },
        { name: 'is_active', type: 'checkbox', label: 'is_active' },
    ]

    const validationSchema = Yup.object({
        country_id: Yup.number().required(t('required')),
        name: Yup.string().required(t('required')),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        if (editItem) {
            updateCity(editItem.id, values)
        } else {
            createCity(values)
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
            country_id: editItem.country_id || '',
            name: editItem.name || '',
            is_active: editItem.is_active || false,
        }
        : {
            country_id: '',
            name: '',
            is_active: true,
        }

    return (
        <div>
            <DataTable
                columns={columns}
                data={cities}
                title={t('cities')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteCity}
                loading={loading}
            />
            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_city') : t('create_city')}
                fields={fields}
            />
        </div>
    )
}

export default Cities