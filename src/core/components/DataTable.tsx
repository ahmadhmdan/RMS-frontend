import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Swal from 'sweetalert2'

interface Column<T> {
    key: string
    header: string
    render?: (item: T) => React.ReactNode
    sortValue?: (item: T) => any
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    title: string
    onCreate: () => void
    onEdit: (item: T) => void
    onView?: (item: T) => void
    onDelete?: (id: number) => void
    showAction?: boolean
    showEdit?: boolean
    showView?: boolean
    showDelete?: boolean
    showCreate?: boolean
    showActionsForEmployee?: boolean
    customActions?: (item: T) => React.ReactNode
    filters?: React.ReactNode
    onExport?: () => void
    customHeaderAction?: React.ReactNode;
    // Server-side pagination
    total?: number
    page?: number
    pageSize?: number
    onPageChange?: (page: number) => void
    onPageSizeChange?: (size: number) => void
    // Server-side sorting
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    onSortChange?: (key: string, direction: 'asc' | 'desc') => void
    embedded?: boolean
    showId?: boolean
    sortBy?: (a: T, b: T) => number
    loading?: boolean
}

const DataTable = <T extends { id: number }>({
    columns,
    data,
    title,
    onCreate,
    onEdit,
    onView,
    onDelete,
    showAction = true,
    showEdit = true,
    showView = false,
    showDelete = true,
    showCreate = true,
    customActions,
    filters,
    onExport,
    customHeaderAction,
    total,
    page: serverPage,
    pageSize: serverPageSize,
    onPageSizeChange,
    onPageChange,
    sortColumn: serverSortColumn,
    sortDirection: serverSortDirection,
    onSortChange,
    embedded = false,
    showId = true,
    sortBy,
    loading = false,
}: DataTableProps<T>) => {
    const { t } = useTranslation()

    const showActions = true

    // Client-side pagination
    const [clientPage, setClientPage] = useState(1)
    const [clientPageSize, setClientPageSize] = useState(10)

    const isServerPaginated = total !== undefined && onPageChange !== undefined
    const isServerSorted = onSortChange !== undefined
    const isSortable = isServerSorted || !isServerPaginated

    const page = isServerPaginated ? serverPage || 1 : clientPage
    const pageSize = isServerPaginated ? serverPageSize || 10 : clientPageSize
    const totalItems = isServerPaginated ? total! : data.length

    const totalPages = Math.ceil(totalItems / pageSize)

    // Client-side sorting
    const [clientSortColumn, setClientSortColumn] = useState<string>('id')
    const [clientSortDirection, setClientSortDirection] = useState<'asc' | 'desc'>('desc')

    const currentSortColumn = isServerSorted ? serverSortColumn : clientSortColumn
    const currentSortDirection = isServerSorted ? serverSortDirection : clientSortDirection

    const columnMap = useMemo(() => new Map(columns.map(col => [col.key, col])), [columns])

    const getSortValue = (item: T, key: string): any => {
        if (key === 'id') return item.id
        const col = columnMap.get(key)
        if (col && col.sortValue) return col.sortValue(item)
        return item[key as keyof T]
    }

    const sortedData = useMemo(() => {
        let tempData = [...data]
        if (!isServerPaginated && !isServerSorted) {
            if (currentSortColumn) {
                tempData.sort((a, b) => {
                    let va = getSortValue(a, currentSortColumn)
                    let vb = getSortValue(b, currentSortColumn)
                    if (va === undefined || va === null) va = ''
                    if (vb === undefined || vb === null) vb = ''
                    if (va instanceof Date && vb instanceof Date) {
                        return currentSortDirection === 'asc'
                            ? va.getTime() - vb.getTime()
                            : vb.getTime() - va.getTime()
                    } else if (typeof va === 'number' && typeof vb === 'number') {
                        return currentSortDirection === 'asc' ? va - vb : vb - va
                    } else {
                        va = String(va).toLowerCase()
                        vb = String(vb).toLowerCase()
                        return currentSortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
                    }
                })
            } else {
                const sorter = sortBy || ((a: T, b: T) => b.id - a.id)
                tempData.sort(sorter)
            }
        }
        return tempData
    }, [data, isServerPaginated, isServerSorted, currentSortColumn, currentSortDirection, sortBy, columnMap])

    const paginatedData = useMemo(() => {
        if (isServerPaginated) return sortedData
        const start = (page - 1) * pageSize
        return sortedData.slice(start, start + pageSize)
    }, [sortedData, page, pageSize, isServerPaginated])

    const handlePageChange = (newPage: number) => {
        if (isServerPaginated) {
            onPageChange?.(newPage)
        } else {
            setClientPage(newPage)
        }
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value)
        const newSize = value < 0 ? totalItems : value
        if (isServerPaginated) {
            onPageSizeChange?.(newSize)
            onPageChange?.(1)
        } else {
            setClientPageSize(newSize)
            setClientPage(1)
        }
    }

    const handleSort = (key: string) => {
        if (!isSortable) return
        let newDirection: 'asc' | 'desc' = 'asc'
        if (currentSortColumn === key) {
            newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc'
        }
        if (isServerSorted) {
            onSortChange?.(key, newDirection)
        } else {
            setClientSortColumn(key)
            setClientSortDirection(newDirection)
        }
    }

    const handleDelete = (id: number) => {
        if (!onDelete) return;

        Swal.fire({
            title: t('confirm.delete.title'),
            text: t('confirm.delete.text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('confirm.delete.confirm'),
            cancelButtonText: t('confirm.delete.cancel'),
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary',
            },
        }).then((result) => {
            if (result.isConfirmed) onDelete(id)
        })
    }

    const maxVisiblePages = 6;
    let startPage = Math.max(1, page - Math.floor((maxVisiblePages - 1) / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    const pagesToShow: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
        pagesToShow.push(i);
    }

    const content = (
        <>
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle table-row-dashed fs-6 gy-5 dataTable">
                    <thead>
                        <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                            {/* ID Column */}
                            {showId && (
                                <th
                                    className={`text-center min-w-50px ${isSortable ? 'cursor-pointer' : ''}`}
                                    onClick={isSortable ? () => handleSort('id') : undefined}
                                >
                                    {t('id')}
                                    {isSortable && currentSortColumn === 'id' && (
                                        <i className={`ki-outline ki-arrow-${currentSortDirection === 'asc' ? 'up' : 'down'} fs-5 ms-1`}></i>
                                    )}
                                </th>
                            )}

                            {/* Dynamic Columns */}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`text-center ${isSortable ? 'cursor-pointer' : ''}`}
                                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                                >
                                    {t(col.header)}
                                    {currentSortColumn === col.key && (
                                        <i className={`ki-outline ki-arrow-${currentSortDirection === 'asc' ? 'up' : 'down'} fs-5 ms-1`}></i>
                                    )}
                                </th>
                            ))}

                            {/* Actions Header */}
                            {showAction && <th className="text-center min-w-100px">{t('actions')}</th>}
                        </tr>
                    </thead>
                    <tbody className="fw-semibold text-gray-600">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showId ? 1 : 0) + (showAction ? 1 : 0)}
                                    className="text-center py-8"
                                >
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">{t('loading')}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showId ? 1 : 0) + (showActions ? 1 : 0)}
                                    className="text-center py-8"
                                >
                                    {t('no_data')}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr key={item.id}>
                                    {/* ID */}
                                    {showId && <td className="text-center">{item.id}</td>}

                                    {/* Dynamic Columns */}
                                    {columns.map((col) => (
                                        <td key={col.key} className="text-center">
                                            {col.render
                                                ? col.render(item)
                                                : (item[col.key as keyof T] as React.ReactNode)}
                                        </td>
                                    ))}

                                    {/* Actions */}
                                    {showAction && (
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                {/* View Button */}
                                                {showView && onView && (
                                                    <button
                                                        className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1"
                                                        onClick={() => onView(item)}
                                                        title={t('view')}
                                                    >
                                                        <i className="ki-outline ki-eye fs-2"></i>
                                                    </button>
                                                )}

                                                {/* Edit Button */}
                                                {showEdit && (
                                                    <button
                                                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
                                                        onClick={() => onEdit(item)}
                                                        title={t('edit')}
                                                    >
                                                        <i className="ki-outline ki-pencil fs-2"></i>
                                                    </button>
                                                )}

                                                {/* Custom Actions */}
                                                {customActions && customActions(item)}

                                                {showDelete && (
                                                    <button
                                                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                                        onClick={() => handleDelete(item.id)}
                                                        title={t('delete')}
                                                    >
                                                        <i className="ki-outline ki-trash fs-2"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && (
                <div className="d-flex justify-content-between align-items-center mt-5">
                    <div className="d-flex align-items-center gap-3">
                        <select
                            className="form-select form-select-sm w-75px"
                            value={pageSize > totalItems ? -1 : pageSize}
                            onChange={handlePageSizeChange}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={-1}>{t('all')}</option>
                        </select>
                        <span className="text-gray-600 ms-5">
                            {t('showing')} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} {t('of')} {totalItems}
                        </span>
                    </div>
                    <div className="d-flex align-items-center">
                        <nav>
                            <ul className="pagination pagination-sm">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <i className="previous"></i>
                                    </button>
                                </li>
                                {pagesToShow.map((p) => (
                                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(p)}>
                                            {p}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        <i className="next"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    )

    if (embedded) {
        return content
    }

    return (
        <div className="card mb-5 mb-xl-8">
            {/* Header */}
            <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                    <span className="card-label fw-bold fs-3 mb-1">{title}</span>
                </h3>

                <div className="card-toolbar d-flex align-items-center gap-2">
                    {/* Export Button */}
                    {onExport && (
                        <button className="btn btn-sm btn-primary" onClick={onExport}>
                            <i className="ki-outline ki-exit-up fs-2 me-2"></i>
                            {t('export_excel')}
                        </button>
                    )}
                    {customHeaderAction}

                    {/* Default Create Button (only if no custom action and showCreate is true) */}
                    {!customHeaderAction && showCreate && onCreate && (
                        <button className="btn btn-sm btn-primary" onClick={onCreate}>
                            <i className="ki-outline ki-plus fs-2"></i>
                            {t('create.new')}
                        </button>
                    )}
                    {/* Filters Menu */}
                    {filters && (
                        <div className="btn-group">
                            <button
                                type="button"
                                className="btn btn-sm btn-bg-light dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="ki-outline ki-filter fs-5 text-gray-600"></i>
                            </button>
                            <div className="dropdown-menu w-250px w-md-300px p-5">
                                <div className="fs-5 text-gray-900 fw-bold mb-4">{t('filter_options')}</div>
                                <div className="separator border-gray-200 mb-4"></div>
                                {filters}
                                <div className="d-flex justify-content-start mt-5">
                                    <button className="btn btn-sm btn-primary" data-bs-dismiss="dropdown">{t('apply')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="card-body pt-3">
                {content}
            </div>
        </div>
    )
}

export default DataTable