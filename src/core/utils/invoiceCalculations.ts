import type { InvoiceLineItemBase } from '../types/invoice';

export const calculateInvoiceSubtotal = (items: InvoiceLineItemBase[]): number => {
    return items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0), 0);
};

export const calculateDiscountAmounts = ({
    subtotal,
    discountPercent,
    discountAmount,
    lastDiscountType,
}: {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    lastDiscountType: 'percent' | 'amount' | null;
}) => {
    if (lastDiscountType === 'percent') {
        const amount = subtotal * (discountPercent / 100);
        return {
            discountAmount: amount,
            discountPercent,
            finalPrice: subtotal - amount,
        };
    }

    if (subtotal > 0 && lastDiscountType === 'amount') {
        const percent = Number(((discountAmount / subtotal) * 100).toFixed(2));
        return {
            discountAmount,
            discountPercent: percent,
            finalPrice: subtotal - discountAmount,
        };
    }

    return {
        discountAmount,
        discountPercent,
        finalPrice: subtotal - discountAmount,
    };
};

export const buildInvoicePayload = ({
    invoiceType,
    invoiceNumber,
    invoiceDate,
    supplierId,
    inventoryId,
    discountAmount,
    paymentMethod,
    description,
    currencyId,
    exchangeRate,
    subtotal,
    finalPrice,
    details,
}: {
    invoiceType: number;
    invoiceNumber: string;
    invoiceDate: string;
    supplierId?: string;
    inventoryId: string;
    discountAmount: number;
    paymentMethod?: string;
    description?: string;
    currencyId?: string;
    exchangeRate?: number;
    subtotal: number;
    finalPrice: number;
    details: unknown[];
}) => ({
    invoice_type: invoiceType,
    invoice_no: invoiceNumber,
    invoice_date: invoiceDate,
    supplier_id: supplierId,
    inventory_id: inventoryId,
    discount_amount: discountAmount,
    pay_method: paymentMethod,
    description,
    currency_id: currencyId,
    exchange_rate: exchangeRate,
    invoice_total_price: subtotal.toFixed(2),
    invoice_final_price: finalPrice.toFixed(2),
    details,
});
