import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../../core/components/DataTable'
import FormModal from '../../../core/components/FormModal'
import * as Yup from 'yup'
import { useSuppliers } from '../hooks/useSuppliers'
import { useTranslation } from 'react-i18next'
import { SUPPLIER_TYPE } from '../../../core/utils/constants'
import SupplierTransactionsModal from '../components/SupplierTransactionsModal'
import { ROUTES } from '../../../core/utils/constants'

const Suppliers = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [filters, setFilters] = useState<{ search_name: string; type: string }>({ search_name: '', type: '' })
    const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers(filters)
    const [modalShow, setModalShow] = useState(false)
    const [editItem, setEditItem] = useState<any | null>(null)
    const [transactionsModalShow, setTransactionsModalShow] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null)

    const columns = [
        { key: 'name', header: 'name' },
        {
            key: 'type',
            header: 'type',
            render: (item: any) => (
                <span
                    className={`badge badge-light-${item.type === SUPPLIER_TYPE.SUPPLIER
                        ? 'primary'
                        : item.type === SUPPLIER_TYPE.CUSTOMER
                            ? 'info'
                            : item.type === SUPPLIER_TYPE.BOTH
                                ? 'warning'
                                : 'secondary'
                        } fs-7`}
                >
                    {t(item.type || 'no_type')}
                </span>
            ),
        },
        { key: 'phone', header: 'phone', render: (item: any) => item.phone || '-' },
        { key: 'email', header: 'email', render: (item: any) => item.email || '-' },
        { key: 'address', header: 'address', render: (item: any) => item.address || '-' },
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
        { name: 'phone', type: 'text', label: 'phone' },
        { name: 'email', type: 'email', label: 'email' },
        { name: 'address', type: 'textarea', label: 'address' },
        {
            name: 'type',
            type: 'select',
            as: 'select',
            label: 'type',
            options: [
                ...Object.values(SUPPLIER_TYPE).map((value) => ({
                    value,
                    label: t(value),
                })),
            ],
        },
        { name: 'is_active', type: 'checkbox', label: 'is_active', defaultChecked: true },
    ]

    const validationSchema = Yup.object({
        name: Yup.string().required(t('required')),
        phone: Yup.string().nullable(),
        email: Yup.string().email(t('invalid_email')).nullable(),
        address: Yup.string().nullable(),
        type: Yup.string()
            .oneOf([...Object.values(SUPPLIER_TYPE), ''])
            .nullable(),
        is_active: Yup.boolean(),
    })

    const handleSubmit = (values: any) => {
        const backendData = {
            name: values.name.trim(),
            phone: values.phone?.trim() || null,
            email: values.email?.trim() || null,
            address: values.address?.trim() || null,
            type: values.type?.trim() || null,
            is_active: values.is_active,
        }

        if (editItem) {
            updateSupplier(editItem.id, backendData)
        } else {
            createSupplier(backendData)
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
            phone: editItem.phone || '',
            email: editItem.email || '',
            address: editItem.address || '',
            type: editItem.type || '',
            is_active: editItem.is_active ?? true,
        }
        : {
            name: '',
            phone: '',
            email: '',
            address: '',
            type: '',
            is_active: true,
        }

    const filtersUI = (
        <div className="row">
            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('search_by_name')}</label>
                <input
                    type="text"
                    className="form-control form-control-solid"
                    placeholder={t('search')}
                    value={filters.search_name}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search_name: e.target.value }))}
                />
            </div>

            <div className="col-md-12 fv-row mb-4">
                <label className="fs-6 mb-1">{t('choose_type')}</label>
                <select
                    className="form-select form-select-solid"
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                >
                    <option value="">{t('all_types')}</option>
                    {Object.values(SUPPLIER_TYPE).map((type) => (
                        <option key={type} value={type}>
                            {t(type)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-md-12 fv-row mb-4">
                {(filters.search_name || filters.type) && (
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => setFilters({ search_name: '', type: '' })}
                    >
                        {t('reset')}
                    </button>
                )}
            </div>
        </div>
    )

    const customActions = (item: any) => (
        <>
            <button
                className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1"
                onClick={() => {
                    setSelectedSupplier(item)
                    setTransactionsModalShow(true)
                }}
                title={t('view_transactions_modal')}
            >
                <i className="ki-outline ki-wallet fs-2"></i>
            </button>

            <button
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                onClick={() => navigate(`${ROUTES.SUPPLIER_TRANSACTIONS}?supplier_id=${item.id}`)}
                title={t('view_supplier_transactions')}
            >
                <i className="ki-outline ki-arrow-right-left fs-2"></i>
            </button>
        </>
    )

    return (
        <div>
            <DataTable
                columns={columns}
                data={suppliers}
                title={t('suppliers')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteSupplier}
                loading={loading}
                filters={filtersUI}
                customActions={customActions}
            />

            <FormModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_supplier') : t('create_supplier')}
                fields={fields}
            />

            <SupplierTransactionsModal
                show={transactionsModalShow}
                onHide={() => setTransactionsModalShow(false)}
                supplier={selectedSupplier}
            />
        </div>
    )
}

export default Suppliers