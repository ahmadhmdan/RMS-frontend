import { useState } from 'react'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useCurrencies } from '../hooks/useCurrencies'
import { useTranslation } from 'react-i18next'

const Currencies = () => {
    const { t } = useTranslation()
    const { currencies, loading, createCurrency, updateCurrency, deleteCurrency, assignRate } = useCurrencies()
    const [modalShow, setModalShow] = useState(false)
    const [assignModalShow, setAssignModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)
    const [selectedCurrency, setSelectedCurrency] = useState<any | null>(null)

    const columns = [
        { key: 'symbol', header: 'symbol' },
        { key: 'name', header: 'name' },
        { key: 'part_name', header: 'part_name' },
        {
            key: 'is_primary',
            header: 'is_primary',
            render: (item: any) => (
                <span className={`badge badge-light-${item.is_primary ? 'success' : 'danger'} fs-7`}>
                    {item.is_primary ? t('yes') : t('no')}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'is_active',
            render: (item: any) => (
                <span className={`badge badge-light-${item.is_active ? 'success' : 'danger'} fs-7`}>
                    {item.is_active ? t('yes') : t('no')}
                </span>
            ),
        },
        { key: 'exchange_rate', header: 'exchange_rate', render: (item: any) => item.exchange_rate ?? '-' },
        { key: 'sort', header: 'sort' },
    ]

    const fields = [
        { name: 'symbol', type: 'text', label: 'symbol' },
        { name: 'name', type: 'text', label: 'name' },
        { name: 'part_name', type: 'text', label: 'part_name' },
        { name: 'is_primary', type: 'checkbox', label: 'is_primary' },
        { name: 'is_active', type: 'checkbox', label: 'is_active' },
        { name: 'sort', type: 'number', label: 'sort' },
    ]

    const validationSchema = Yup.object({
        symbol: Yup.string().required(t('required')),
        name: Yup.string().required(t('required')),
        part_name: Yup.string().required(t('required')),
        is_primary: Yup.boolean(),
        is_active: Yup.boolean(),
        sort: Yup.number().min(0).required(t('required')),
    })

    const handleSubmit = (values: any) => {
        const backendData = {
            symbol: values.symbol,
            name: values.name,
            part_name: values.part_name,
            is_primary: values.is_primary,
            is_active: values.is_active,
            sort: Number(values.sort),
        }

        if (editItem) {
            updateCurrency(editItem.id, backendData)
        } else {
            createCurrency(backendData)
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
            symbol: editItem.symbol || '',
            name: editItem.name || '',
            part_name: editItem.part_name || '',
            is_primary: editItem.is_primary || false,
            is_active: editItem.is_active ?? true,
            sort: editItem.sort || 0,
        }
        : {
            symbol: '',
            name: '',
            part_name: '',
            is_primary: false,
            is_active: true,
            sort: 0,
        }

    const fieldsAssign = [
        { name: 'exchange_price', type: 'number', label: 'exchange_price' },
        { name: 'exchange_date', type: 'date', label: 'exchange_date' },
    ]

    const validationSchemaAssign = Yup.object({
        exchange_price: Yup.number().positive(t('positive')).required(t('required')),
        exchange_date: Yup.date().required(t('required')),
    })

    const handleSubmitAssign = (values: any) => {
        const backendData = {
            exchange_price: Number(values.exchange_price),
            exchange_date: values.exchange_date,
        }

        if (selectedCurrency) {
            assignRate(selectedCurrency.id, backendData)
        }
    }

    const handleAssignOpen = (item: any) => {
        setSelectedCurrency(item)
        setAssignModalShow(true)
    }

    const initialValuesAssign = selectedCurrency
        ? {
            exchange_price: selectedCurrency.exchange_rate || 1,
            exchange_date: new Date().toISOString().split('T')[0],
        }
        : {
            exchange_price: 1,
            exchange_date: new Date().toISOString().split('T')[0],
        }

    const customActions = (item: any) => (
        <button
            className="btn btn-icon btn-bg-light btn-active-color-warning btn-sm me-1"
            disabled={item.is_primary}
            onClick={() => handleAssignOpen(item)}
            title={t('assign_rate')}
        >
            <i className="ki-outline ki-finance-calculator fs-2"></i>
        </button>
    )

    return (
        <div>
            <DataTable
                columns={columns}
                data={currencies}
                title={t('currencies')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteCurrency}
                loading={loading}
                customActions={customActions}
            />
            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_currency') : t('create_currency')}
                fields={fields}
            />
            <FormModal
                show={assignModalShow}
                onHide={() => setAssignModalShow(false)}
                onSubmit={handleSubmitAssign}
                initialValues={initialValuesAssign}
                validationSchema={validationSchemaAssign}
                title={t('assign_exchange_rate')}
                fields={fieldsAssign}
            />
        </div>
    )
}

export default Currencies