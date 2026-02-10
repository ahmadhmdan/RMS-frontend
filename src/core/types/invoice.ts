export interface InvoiceLineItemBase {
    item_id: string;
    unit_id: string;
    quantity: number;
    unit_price?: number;
    expiration_date?: string;
}

export interface DiscountInvoiceFormValues<TItem extends InvoiceLineItemBase = InvoiceLineItemBase> {
    supplier: string;
    invoiceDate: string;
    inventory: string;
    discountPercent: number;
    discountAmount: number;
    items: TItem[];
    pay_method: string;
    description: string;
    currency_id: string;
    exchange: number;
}

export interface InventoryInvoiceFormValues<TItem extends InvoiceLineItemBase = InvoiceLineItemBase> {
    inventory: string;
    invoiceDate: string;
    description: string;
    items: TItem[];
}

export interface TransferInvoiceFormValues<TItem extends InvoiceLineItemBase = InvoiceLineItemBase> {
    fromInventory: string;
    toInventory: string;
    invoiceDate: string;
    description: string;
    items: TItem[];
}
