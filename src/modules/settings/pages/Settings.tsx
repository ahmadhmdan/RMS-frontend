import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useSettings } from '../hooks/useSettings'
import { useTranslation } from 'react-i18next'

const Settings = () => {
    const { t } = useTranslation()
    const { settings, loading, updateSettings } = useSettings()
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)

    const columns = [
        { key: 'category', header: 'category' },
        { key: 'option_key', header: 'key' },
        {
            key: 'option_value',
            header: 'value',
            render: (item: any) => {
                if (item.option_type === 'percentage') {
                    return item.option_value ? `${item.option_value}%` : '-'
                }
                return item.option_value || '-'
            },
        },
        { key: 'option_type', header: 'type' },
    ]

    const getInputType = (type: string) => {
        if (['percentage', 'number'].includes(type)) {
            return 'number'
        }
        return 'text'
    }

    const fields = [
        { name: 'option_key', type: 'text', label: 'key', disabled: true },
        { name: 'option_value', type: getInputType(editItem?.option_type || 'text'), label: 'value' },
    ]

    const validationSchema = Yup.object({
        option_value: Yup.string().nullable(),
    })

    const handleSubmit = (values: any) => {
        const value = values.option_value === '' ? null : values.option_value
        const backendData = {
            settings: [
                {
                    category: editItem.category,
                    key: editItem.option_key,
                    value,
                },
            ],
        }
        updateSettings(backendData)
        setModalShow(false)
    }

    const handleEdit = (item: any) => {
        setEditItem(item)
        setModalShow(true)
    }

    const initialValues = editItem
        ? {
            option_key: editItem.option_key || '',
            option_value: editItem.option_value ?? '',
        }
        : {}

    return (
        <div>
            <DataTable
                columns={columns}
                data={settings}
                title={t('settings')}
                onCreate={() => { }}
                showCreate={false}
                showDelete={false}
                onEdit={handleEdit}
                loading={loading}
            />
            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={t('edit_setting')}
                fields={fields}
            />
        </div>
    )
}

export default Settings