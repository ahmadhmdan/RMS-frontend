import React from 'react';
import { ItemAutocomplete as SharedItemAutocomplete } from '../../../core/components/invoices/ItemAutocomplete';

interface ItemAutocompleteProps {
    value: string;
    onChange: (id: string, item?: any) => void;
    itemsList: any[];
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    inputRef: React.Ref<HTMLInputElement>;
    hasError?: boolean;
}

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = (props) => {
    return <SharedItemAutocomplete {...props} />;
};

export default ItemAutocomplete;
