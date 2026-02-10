import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface CalculatorModalProps {
    show: boolean;
    onHide: () => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({ show, onHide }) => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);

    const modalBodyRef = useRef<HTMLDivElement>(null);

    const formatDisplay = (value: string): string => {
        if (!value || value === '' || isNaN(Number(value))) return value;

        const num = parseFloat(value);

        if (value.includes('.')) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8,
            });
        }

        return num.toLocaleString('en-US');
    };

    // Auto-focus modal body when shown
    useEffect(() => {
        if (show && modalBodyRef.current) {
            modalBodyRef.current.focus();
        }
    }, [show]);

    // Keyboard handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent default for keys that could interfere
            if (['+', '-', '*', '/', 'Enter', 'Escape', 'Backspace'].includes(event.key)) {
                event.preventDefault();
            }

            // Numbers (0-9) from main keyboard or numpad
            if (/^[0-9]$/.test(event.key)) {
                inputNumber(event.key);
                return;
            }

            // Numpad numbers
            if (event.code.startsWith('Numpad') && /^[0-9]$/.test(event.key)) {
                inputNumber(event.key);
                return;
            }

            // Decimal point (., or NumpadDecimal)
            if (event.key === '.' || event.key === ',') {
                inputDecimal();
                return;
            }

            // Operators
            if (event.key === '+' || event.code === 'NumpadAdd') {
                performOperation('+');
            }
            if (event.key === '-' || event.code === 'NumpadSubtract') {
                performOperation('-');
            }
            if (event.key === '*') {
                performOperation('×');
            }
            if (event.key === '/' || event.code === 'NumpadDivide') {
                performOperation('÷');
            }

            // Equals
            if (event.key === 'Enter' || event.key === '=' || event.code === 'NumpadEnter') {
                performEquals();
            }

            // Clear
            if (event.key === 'Escape' || event.key.toLowerCase() === 'c') {
                clear();
            }

            // Backspace - Smart delete
            if (event.key === 'Backspace') {
                if (waitingForNewValue) {
                    // If waiting for new number (after operator), go back to previous result
                    if (previousValue !== null) {
                        setDisplay(previousValue);
                        setWaitingForNewValue(false);
                    }
                } else if (display.length > 1) {
                    setDisplay(display.slice(0, -1));
                } else {
                    setDisplay('0');
                }
            }
        };

        if (show) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, display, waitingForNewValue, previousValue]);

    const inputNumber = (num: string) => {
        if (waitingForNewValue) {
            setDisplay(num);
            setWaitingForNewValue(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const inputDecimal = () => {
        if (waitingForNewValue) {
            setDisplay('0.');
            setWaitingForNewValue(false);
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(false);
    };

    const performOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(display);
        } else if (operation) {
            const currentValue = parseFloat(previousValue || '0');
            const newValue = calculate(currentValue, inputValue, operation);
            setDisplay(String(newValue));
            setPreviousValue(String(newValue));
        }

        setWaitingForNewValue(true);
        setOperation(nextOperation);
    };

    const calculate = (firstValue: number, secondValue: number, operation: string): number => {
        switch (operation) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '×': return firstValue * secondValue;
            case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
            default: return secondValue;
        }
    };

    const performEquals = () => {
        if (!previousValue || !operation) return;

        const currentValue = parseFloat(previousValue);
        const inputValue = parseFloat(display);
        const newValue = calculate(currentValue, inputValue, operation);

        setDisplay(String(newValue));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton className="border-0 pb-2">

            </Modal.Header>

            <Modal.Body
                className="pt-2"
                tabIndex={-1}
                ref={modalBodyRef}
                style={{ outline: 'none' }} // Removes focus ring if unwanted
            >
                <div className="card card-flush border-0">
                    <div className="card-body p-5">
                        {/* Display */}
                        <div className="mb-4">
                            {/* Previous calculation history */}
                            <div className="text-end text-gray-600 fs-4 mb-2 minh-40px d-flex align-items-center justify-content-end px-4">
                                {previousValue && operation ? (
                                    <>
                                        {previousValue} {operation === '÷' ? '÷' : operation === '×' ? '×' : operation}{' '}
                                        {waitingForNewValue ? '' : display}
                                        {!waitingForNewValue && ' ='}
                                    </>
                                ) : (
                                    <span>&nbsp;</span>
                                )}
                            </div>

                            {/* Main display */}
                            <div className="bg-light rounded-3 px-4 py-5 text-end border" style={{ minHeight: '75px' }}>
                                <div className="fs-2x fw-bold text-gray-800 d-flex align-items-center justify-content-end h-100">
                                    {formatDisplay(display)}
                                </div>
                            </div>
                        </div>

                        {/* Keypad Grid */}
                        <div className="row g-3">
                            {/* Row 1 */}
                            <div className="col-3">
                                <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={clear}>
                                    C
                                </Button>
                            </div>
                            <div className="col-3">
                                <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" disabled>
                                    <i className="ki-outline ki-arrow-left-right"></i>
                                </Button>
                            </div>
                            <div className="col-3">
                                <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" disabled>
                                    %
                                </Button>
                            </div>
                            <div className="col-3">
                                <Button variant="primary" className="w-100 py-5 fs-3 fw-bold" onClick={() => performOperation('÷')}>
                                    ÷
                                </Button>
                            </div>

                            {/* Row 2 */}
                            {[7, 8, 9].map(n => (
                                <div key={n} className="col-3">
                                    <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={() => inputNumber(n.toString())}>
                                        {n}
                                    </Button>
                                </div>
                            ))}
                            <div className="col-3">
                                <Button variant="primary" className="w-100 py-5 fs-3 fw-bold" onClick={() => performOperation('×')}>
                                    ×
                                </Button>
                            </div>

                            {/* Row 3 */}
                            {[4, 5, 6].map(n => (
                                <div key={n} className="col-3">
                                    <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={() => inputNumber(n.toString())}>
                                        {n}
                                    </Button>
                                </div>
                            ))}
                            <div className="col-3">
                                <Button variant="primary" className="w-100 py-5 fs-3 fw-bold" onClick={() => performOperation('-')}>
                                    −
                                </Button>
                            </div>

                            {/* Row 4 */}
                            {[1, 2, 3].map(n => (
                                <div key={n} className="col-3">
                                    <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={() => inputNumber(n.toString())}>
                                        {n}
                                    </Button>
                                </div>
                            ))}
                            <div className="col-3">
                                <Button variant="primary" className="w-100 py-5 fs-3 fw-bold" onClick={() => performOperation('+')}>
                                    +
                                </Button>
                            </div>

                            {/* Row 5 */}
                            <div className="col-6">
                                <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={() => inputNumber('0')}>
                                    0
                                </Button>
                            </div>
                            <div className="col-3">
                                <Button variant="light" className="w-100 py-5 fs-3 fw-bold btn-active-primary" onClick={inputDecimal}>
                                    .
                                </Button>
                            </div>
                            <div className="col-3">
                                <Button variant="success" className="w-100 py-5 fs-3 fw-bold" onClick={performEquals}>
                                    =
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CalculatorModal;