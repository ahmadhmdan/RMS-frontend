import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ItemAutocompleteProps {
    value: string;
    onChange: (id: string, item?: any) => void;
    itemsList: any[];
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    inputRef: React.Ref<HTMLInputElement>;
    placeholder?: string;
    hasError?: boolean;
}

export const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
    value,
    onChange,
    itemsList,
    onKeyDown,
    inputRef,
    placeholder,
    hasError
}) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selected = itemsList.find(it => it.id === value);
        setSearchTerm(selected ? selected.name : '');
    }, [value, itemsList]);

    const filteredItems = itemsList.filter(it =>
        it.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id: string, name: string, selectedItem?: any) => {
        onChange(id, selectedItem);
        setSearchTerm(name);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Delete' || e.key === 'Tab') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }

        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setIsOpen(true);
            setHighlightedIndex(e.key === 'ArrowDown' ? 0 : filteredItems.length - 1);
            e.preventDefault();
            return;
        }

        if (!isOpen) {
            onKeyDown(e);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => prev < filteredItems.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredItems.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    const item = filteredItems[highlightedIndex];
                    handleSelect(item.id, item.name, item);
                } else {
                    setIsOpen(false);
                }
                onKeyDown(e);
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                onKeyDown(e);
        }
    };

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0) {
            const items = dropdownRef.current?.querySelectorAll('li');
            items?.[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="position-relative" ref={dropdownRef}>
            <input
                type="text"
                className={`form-control ${hasError ? 'is-invalid' : ''}`}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(e.target.value.length > 0);
                    setHighlightedIndex(0);
                }}
                onClick={() => {
                    setIsOpen(true);
                    setHighlightedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                placeholder={placeholder || t('select_item')}
            />
            {isOpen && filteredItems.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredItems.map((it, idx) => (
                        <li
                            key={it.id}
                            className={`list-group-item ${idx === highlightedIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(it.id, it.name, it)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            {it.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};