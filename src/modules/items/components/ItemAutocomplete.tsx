import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ItemAutocompleteProps {
    value: string;
    onChange: (id: string, item?: any) => void;
    itemsList: any[];
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    inputRef: React.Ref<HTMLInputElement>;
    hasError?: boolean;
}

const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({ value, onChange, itemsList, onKeyDown, inputRef, hasError }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selected = itemsList.find(it => it.id === value);
        if (selected) {
            setSearchTerm(selected.name);
        } else {
            setSearchTerm('');
        }
    }, [value, itemsList]);

    const filteredItems = itemsList.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            setIsOpen(true);
            setHighlightedIndex(0);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (id: string, name: string, item: any) => {
        onChange(id, item);
        setSearchTerm(name);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputClick = () => {
        setIsOpen(true);
        setHighlightedIndex(0);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }
        if (e.key === 'Delete') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }
        if (e.key === 'Tab') {
            setIsOpen(false);
            onKeyDown(e);
            return;
        }
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
                return;
            } else if (e.key === 'ArrowUp') {
                setIsOpen(true);
                setHighlightedIndex(filteredItems.length - 1);
                e.preventDefault();
                return;
            }
            onKeyDown(e);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < filteredItems.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev > 0 ? prev - 1 : filteredItems.length - 1
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                const selectedItem = filteredItems[highlightedIndex];
                handleSelect(selectedItem.id, selectedItem.name, selectedItem);
            } else {
                setIsOpen(false);
            }
            onKeyDown(e);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setHighlightedIndex(-1);
        } else {
            onKeyDown(e);
        }
    };

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0) {
            const dropdown = dropdownRef.current;
            if (dropdown) {
                const items = dropdown.querySelectorAll('li');
                if (items[highlightedIndex]) {
                    items[highlightedIndex].scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth'
                    });
                }
            }
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
                onChange={handleInputChange}
                onClick={handleInputClick}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                placeholder={t('select_item')}
            />
            {isOpen && filteredItems.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        cursor: 'pointer'
                    }}
                >
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

export default ItemAutocomplete;