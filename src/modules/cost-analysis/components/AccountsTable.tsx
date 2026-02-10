import React from 'react';

interface AccountRow {
    account_id: string;
    cost: number;
}

interface Props {
    formik: any;
    accountsList: { id: number; name: string; account_no: number }[];
    accountsRowRefs: React.MutableRefObject<(HTMLSelectElement | HTMLInputElement | null)[][]>;
    handleAccountsKeyDown: (
        e: React.KeyboardEvent<HTMLElement>,
        rowIndex: number,
        fieldIndex: number
    ) => void;
    setFocusAfterDelete: (value: { row: number; field: number } | null) => void;
    mode: string;
    t: (key: string) => string;
}

const AccountsTable: React.FC<Props> = ({
    formik,
    accountsList,
    accountsRowRefs,
    handleAccountsKeyDown,
    setFocusAfterDelete,
    mode,
    t
}) => {

    return (
        <div className="table-responsive mb-10">
            <table className={`table table-bordered excel-like-table ${mode === 'dark' ? 'table-dark-mode' : ''}`}>
                <thead>
                    <tr style={{ backgroundColor: mode === 'light' ? '#f9f9f9' : '#15171c' }}>
                        <th className="text-center" style={{ width: '5%' }}></th>
                        <th className="text-center" style={{ width: '60%' }}>{t('account')}</th>
                        <th className="text-center" style={{ width: '30%' }}>{t('cost')}</th>
                        <th className="text-center" style={{ width: '5%' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {formik.values.accounts.map((row: AccountRow, index: number) => {
                        accountsRowRefs.current[index] = accountsRowRefs.current[index] || [];
                        return (
                            <tr key={index}>
                                <td className="row-index" style={{ color: '#000000' }}>{index + 1}</td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={row.account_id}
                                        onChange={(e) => formik.setFieldValue(`accounts.${index}.account_id`, e.target.value)}
                                        onKeyDown={(e) => handleAccountsKeyDown(e, index, 0)}
                                        ref={(el) => { accountsRowRefs.current[index][0] = el }}
                                    >
                                        <option value="">{t('select_account')}</option>
                                        {accountsList.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name || `${t('account')} ${acc.account_no}`}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control text-end"
                                        value={row.cost || ''}
                                        onChange={(e) => formik.setFieldValue(`accounts.${index}.cost`, Number(e.target.value) || 0)}
                                        onKeyDown={(e) => handleAccountsKeyDown(e, index, 1)}
                                        ref={(el) => { accountsRowRefs.current[index][1] = el }}
                                    />
                                </td>
                                <td className="text-center">
                                    {formik.values.accounts.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-icon btn-active-color-danger btn-sm"
                                            onClick={() => {
                                                let targetRow = index;
                                                let targetField = 0;
                                                if (index === formik.values.accounts.length - 1 && index > 0) {
                                                    targetRow = index - 1;
                                                }
                                                const newAccounts = formik.values.accounts.filter((_: any, i: number) => i !== index);
                                                formik.setFieldValue('accounts', newAccounts.length === 0 ? [{ account_id: '', cost: 0 }] : newAccounts);
                                                setFocusAfterDelete({ row: targetRow, field: targetField });
                                            }}
                                        >
                                            <i className="ki-outline ki-trash fs-2"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="p-3 text-start">
                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={() => formik.setFieldValue('accounts', [...formik.values.accounts, { account_id: '', cost: 0 }])}
                            >
                                <i className="ki-outline ki-plus fs-2"></i>
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default AccountsTable;