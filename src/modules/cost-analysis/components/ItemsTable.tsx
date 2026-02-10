// ItemsTable.tsx
import React from 'react';

interface Item {
    item_id: number;
    item_name: string;
    last_cost_price: string;
    avg_cost_price: string;
    quantity_sold: number;
    total: number;
}

interface Props {
    items: Item[];
    priceMode: 'avg' | 'last';
    onQuantityChange: (index: number, value: number) => void;
    grandTotal: number;
    mode: string;
    t: (key: string) => string;
    formatLargeNumber: (value: string | number, decimals?: number) => string;
}

const ItemsTable: React.FC<Props> = ({ items, priceMode, onQuantityChange, mode, t, formatLargeNumber }) => {
    return (
        <div className="table-responsive mb-10">
            <table className={`table table-bordered excel-like-table-2 ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                <thead>
                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                        <th className="text-center" style={{ width: '5%' }}></th>
                        <th className="text-center" style={{ width: '40%' }}>{t('item')}</th>
                        <th className="text-center" style={{ width: '20%' }}>{t('sell_price')}</th>
                        <th className="text-center" style={{ width: '20%' }}>{t('quantity_sold')}</th>
                        <th className="text-center" style={{ width: '15%' }}>{t('total')}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const price = priceMode === 'avg' ? Number(item.avg_cost_price) : Number(item.last_cost_price);
                        return (
                            <tr key={item.item_id}>
                                <td className="row-index" style={{ color: '#000000' }}>{index + 1}</td>
                                <td className="px-3" style={{ color: '#000000' }}>{item.item_name || `${t('item')} ${item.item_id}`}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control text-center bg-transparent border-0"
                                        value={formatLargeNumber(price)}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control text-center"
                                        value={item.quantity_sold || ''}
                                        onChange={(e) => onQuantityChange(index, Number(e.target.value) || 0)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control text-center bg-transparent border-0"
                                        value={formatLargeNumber(item.total)}
                                        readOnly
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ItemsTable;