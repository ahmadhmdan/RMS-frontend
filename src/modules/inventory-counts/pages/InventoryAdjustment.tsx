import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../../../core/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useInventoryAdjustment } from '../hooks/useInventoryAdjustment';
import { inventoryCountsService } from '../services/inventoryCounts.service';
import { ROUTES } from '../../../core/utils/constants';
import { getTransactionTypes } from '../../../core/api/transactionType.api';
import { getInventories } from '../../../core/api/inventories.api';
import { getSuppliers } from '../../../core/api/suppliers.api';
import { Modal, Button } from 'react-bootstrap';
import * as Yup from 'yup';

const InventoryAdjustment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const inventoryIdFromState = (location.state as { inventory_id?: number })?.inventory_id;
    const inventory_id = inventoryIdFromState ?? Number(localStorage.getItem('adjustmentInventoryId')) ?? 0;
    const { items, loading } = useInventoryAdjustment();
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
    // Form state
    const [transactionTypeId, setTransactionTypeId] = useState('');
    const [payMethod, setPayMethod] = useState('Cash');
    const [fromInventoryId, setFromInventoryId] = useState('');
    const [toInventoryId, setToInventoryId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [invoiceDate] = useState(new Date().toISOString().split('T')[0]); // Today
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    // Options
    const [transactionTypes, setTransactionTypes] = useState<any[]>([]);
    const [inventories, setInventories] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    // Fetch options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [ttRes, invRes, supRes] = await Promise.all([
                    getTransactionTypes(),
                    getInventories(),
                    getSuppliers(),
                ]);
                setTransactionTypes(ttRes.data.data || []);
                setInventories(invRes.data.data || []);
                setSuppliers(supRes.data.data || []);
            } catch (err) {
                Swal.fire(t('error'), t('failed_to_load_options'), 'error');
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [t]);
    const openModal = (type: 'increase' | 'decrease') => {
        setAdjustmentType(type);
        setShowModal(true);
    };
    const validationSchema = Yup.object({
        transactionTypeId: Yup.string().required(t('required')),
        payMethod: Yup.string().required(t('required')),
        supplierId: Yup.string().when('payMethod', {
            is: 'Debit',
            then: (schema) => schema.required(t('required')),
            otherwise: (schema) => schema.notRequired(),
        }),
        fromInventoryId: Yup.string().required(t('required')),
        toInventoryId: Yup.string().notRequired(),
    });
    const handleFinalAdjust = async () => {
        try {
            await validationSchema.validate(
                { transactionTypeId, payMethod, supplierId, fromInventoryId, toInventoryId },
                { abortEarly: false }
            );
            setErrors({});
            const payload = {
                inventory_id: inventory_id,
                adjustment_type: adjustmentType,
                adjustment_log_id: Number(id),
                transaction_type_id: Number(transactionTypeId),
                pay_method: payMethod,
                invoice_date: invoiceDate,
                from_inventory_id: fromInventoryId ? Number(fromInventoryId) : null,
                to_inventory_id: toInventoryId ? Number(toInventoryId) : null,
                supplier_id: payMethod === 'Debit' && supplierId ? Number(supplierId) : null,
                items: items.map((item: any) => ({
                    id: item.id,
                    item_id: Number(item.item_id),
                    unit_id: Number(item.unit_id || 0),
                    calculated_quantity: Number(item.calculated_quantity),
                    actual_quantity: Number(item.actual_quantity),
                    price: Number(item.price || 0),
                    price_type: item.price_type || null,
                })),
            };
            await inventoryCountsService.adjust(payload);
            Swal.fire({
                icon: 'success',
                title: t('success'),
                text: t('adjustment_saved_successfully'),
                timer: 2000,
                showConfirmButton: true,
            }).then(() => {
                localStorage.removeItem('adjustmentInventoryId');
                setShowModal(false);
                navigate(ROUTES.INVENTORY_COUNTS);
            });
        } catch (validationErr: any) {
            if (validationErr.name === 'ValidationError') {
                const newErrors: { [key: string]: string } = {};
                validationErr.inner.forEach((e: any) => {
                    newErrors[e.path] = e.message;
                });
                setErrors(newErrors);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('error'),
                    text: validationErr.response?.data?.message || t('error_saving'),
                });
            }
        }
    };
    if (loading || loadingOptions) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }
    if (!inventory_id) {
        return (
            <div className="card">
                <div className="card-body text-center py-10">
                    <h3>{t('error')}: {t('inventory_not_found')}</h3>
                </div>
            </div>
        );
    }
    return (
        <>
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title d-flex align-items-center gap-4">
                        <h2 className="fw-bold fs-2 mb-0">{t('inventory_adjustment')}</h2>
                    </div>
                    <div className="card-toolbar">
                        <button className="btn btn-light" onClick={() => navigate(-1)}>
                            <i className="ki-outline ki-arrow-left fs-2"></i>
                        </button>
                    </div>
                </div>
                <div className="separator my-8"></div>
                <div className="card-body p-9">
                    <div className="position-relative mb-10">
                        <div className="position-absolute start-0 top-0 w-4px h-100 rounded-2 bg-success"></div>
                        <h3 className="fw-bold mb-6 ps-4">{t('items')}</h3>
                    </div>
                    <div className="table-responsive mb-10">
                        <table className={`table table-bordered excel-like-table-2 ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                            <thead>
                                <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                                    <th className="text-center" style={{ width: '5%' }}></th>
                                    <th className="text-center" style={{ width: '30%' }}>{t('item_name')}</th>
                                    <th className="text-center" style={{ width: '15%' }}>{t('unit')}</th>
                                    <th className="text-center" style={{ width: '15%' }}>{t('calculated_quantity')}</th>
                                    <th className="text-center" style={{ width: '15%' }}>{t('actual_quantity')}</th>
                                    <th className="text-center" style={{ width: '15%' }}>{t('price')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, index: number) => (
                                    <tr key={item.id}>
                                        <td className="row-index">{index + 1}</td>
                                        <td className="px-3">{item.item_name || '—'}</td>
                                        <td className="px-3">{item.unit_name || '—'}</td>
                                        <td className="text-center text-danger fw-bold">{item.calculated_quantity || '—'}</td>
                                        <td className="text-center text-success fw-bold">{item.actual_quantity || '—'}</td>
                                        <td className="text-center">{item.price || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-start gap-4 mt-12">
                        <button className="btn btn-danger btn-lg" onClick={() => openModal('decrease')}>
                            {t('decrease_stock')}
                        </button>
                        <button className="btn btn-success btn-lg" onClick={() => openModal('increase')}>
                            {t('increase_stock')}
                        </button>
                    </div>
                </div>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {adjustmentType === 'increase' ? t('increase_stock') : t('decrease_stock')} - {t('details')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-6">
                        <div className="col-md-6">
                            <label className="form-label required">{t('transaction_type')}</label>
                            <select className="form-select form-select-solid" value={transactionTypeId} onChange={(e) => setTransactionTypeId(e.target.value)} required>
                                <option value="">{t('choose_transaction_type')}</option>
                                {transactionTypes.map((tt) => (
                                    <option key={tt.id} value={tt.id}>{tt.name}</option>
                                ))}
                            </select>
                            {errors.transactionTypeId && <div className="text-danger">{errors.transactionTypeId}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label required">{t('payment_method')}</label>
                            <select className="form-select form-select-solid" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} required>
                                <option value="Cash">Cash</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                            {errors.payMethod && <div className="text-danger">{errors.payMethod}</div>}
                        </div>
                        {payMethod === 'Debit' && (
                            <div className="col-md-6">
                                <label className="form-label required">{t('supplier')}</label>
                                <select className="form-select form-select-solid" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                                    <option value="">{t('select_supplier')}</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.supplierId && <div className="text-danger">{errors.supplierId}</div>}
                            </div>
                        )}
                        <div className="col-md-6">
                            <label className="form-label required">{t('from_inventory_warehouse')}</label>
                            <select className="form-select form-select-solid" value={fromInventoryId} onChange={(e) => setFromInventoryId(e.target.value)}>
                                <option value="">{t('select_inventory')}</option>
                                {inventories.map((inv) => (
                                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                                ))}
                            </select>
                            {errors.fromInventoryId && <div className="text-danger">{errors.fromInventoryId}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">{t('to_inventory_warehouse')}</label>
                            <select className="form-select form-select-solid" value={toInventoryId} onChange={(e) => setToInventoryId(e.target.value)}>
                                <option value="">{t('select_inventory')}</option>
                                {inventories.map((inv) => (
                                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                                ))}
                            </select>
                            {errors.toInventoryId && <div className="text-danger">{errors.toInventoryId}</div>}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowModal(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant={adjustmentType === 'increase' ? 'success' : 'danger'}
                        onClick={handleFinalAdjust}
                    >
                        {t('save')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default InventoryAdjustment;