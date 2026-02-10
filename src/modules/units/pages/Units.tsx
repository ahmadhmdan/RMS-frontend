import { useState } from 'react';
import DataTable from '../../../core/components/DataTable';
import FormModal from '../../../core/components/FormModal';
import * as Yup from 'yup';
import { useUnits } from '../hooks/useUnits';
import { useTranslation } from 'react-i18next';

const Units = () => {
    const { t } = useTranslation();
    const { units, loading, createUnit, updateUnit, deleteUnit } = useUnits();
    const [modalShow, setModalShow] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);

    const columns = [
        { key: 'name', header: 'name' },
        {
            key: 'description',
            header: 'description',
            render: (item: any) => item.description || '-',
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
    ];

    const fields = [
        { name: 'name', type: 'text', label: 'name' },
        { name: 'description', type: 'textarea', label: 'description' },
        { name: 'is_active', type: 'checkbox', label: 'active' },
    ];

    const validationSchema = Yup.object({
        name: Yup.string().required(t('required')).trim(),
        description: Yup.string().nullable(),
        is_active: Yup.boolean(),
    });

    const handleSubmit = (values: any) => {
        const backendData = {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            is_active: values.is_active,
        };

        if (editItem) {
            updateUnit(editItem.id, backendData);
        } else {
            createUnit(backendData);
        }

        setModalShow(false);
        setEditItem(null);
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setModalShow(true);
    };

    const handleCreate = () => {
        setEditItem(null);
        setModalShow(true);
    };

    const initialValues = editItem
        ? {
            name: editItem.name || '',
            description: editItem.description || '',
            is_active: Boolean(editItem.is_active),
        }
        : {
            name: '',
            description: '',
            is_active: true,
        };

    return (
        <div>
            <DataTable
                columns={columns}
                data={units}
                title={t('units')}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={deleteUnit}
                loading={loading}
            />

            <FormModal
                show={modalShow}
                onHide={() => {
                    setModalShow(false);
                    setEditItem(null);
                }}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
                title={editItem ? t('edit_unit') : t('create_unit')}
                fields={fields}
            />
        </div>
    );
};

export default Units;