import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES, ROLES } from '../../core/utils/constants'
import { useAuth } from '../../core/hooks/useAuth'
import { useEffect, useRef, useState } from 'react'

type MenuItem = {
    path: string;
    label: string;
    adminOnly?: boolean;
}

const Sidebar = () => {
    const { user } = useAuth()
    const { t } = useTranslation()
    const location = useLocation()

    const logoRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [scrollHeight, setScrollHeight] = useState<number>(0)

    const canManage = user?.roleName === ROLES.ADMIN

    const menuGroups: { title: string; icon: string; items: MenuItem[] }[] = [
        {
            title: 'dashboard',
            icon: 'ki-solid ki-home',
            items: [
                { path: ROUTES.DASHBOARD, label: 'dashboard' },
            ],
        },
        {
            title: 'management',
            icon: 'ki-solid ki-setting-2',
            items: [
                { path: ROUTES.INVENTORIES, label: 'inventories', adminOnly: true },
                { path: ROUTES.SUPPLIERS, label: 'suppliers', adminOnly: true },
                { path: ROUTES.CATEGORIES, label: 'categories', adminOnly: true },
                { path: ROUTES.ITEM_GROUPS, label: 'item_groups', adminOnly: true },
                { path: ROUTES.UNITS, label: 'units', adminOnly: true },
                { path: ROUTES.COUNTRIES, label: 'countries', adminOnly: true },
                { path: ROUTES.CITIES, label: 'cities', adminOnly: true },
                { path: ROUTES.COST_ANALYSIS_TABLE, label: 'cost_analysis', adminOnly: true },
                { path: ROUTES.INVENTORY_COUNTS, label: 'inventory_counts', adminOnly: true },
                { path: ROUTES.CURRENCIES, label: 'currencies', adminOnly: true },
                { path: ROUTES.SETTINGS, label: 'settings', adminOnly: true },
            ],
        },
        {
            title: 'items',
            icon: 'ki-solid ki-basket',
            items: [
                { path: ROUTES.ITEMS, label: 'raw_items' },
                { path: ROUTES.FULL_PRODUCED_ITEMS, label: 'full_produced_items' },
                { path: ROUTES.HALF_PRODUCED_ITEMS, label: 'half_produced_items' },
                { path: ROUTES.REVERSE_PRODUCED_ITEMS, label: 'reverse_produced_items' },
                { path: ROUTES.SERVICEABLE_ITEMS, label: 'serviceable_items' },
                { path: ROUTES.ITEMS_TREE, label: 'items_tree' },
            ],
        },
        {
            title: 'invoices',
            icon: 'ki-solid ki-document',
            items: [
                { path: ROUTES.PURCHASE_INVOICES, label: 'purchase_invoices' },
                { path: ROUTES.SELL_INVOICES, label: 'sell_invoices' },
                { path: ROUTES.RETURN_INVOICES, label: 'return_invoices' },
                { path: ROUTES.MANUFACTURING_INVOICE, label: 'manufacturing_invoices' },
                { path: ROUTES.TRANSFER_INVOICE, label: 'transfer_invoices' },
                { path: ROUTES.GOODS_INVOICE, label: 'goods_invoices' },
                { path: ROUTES.WASTE_INVOICE, label: 'waste_invoices' },
                { path: ROUTES.CONSUMPTION_INVOICE, label: 'consumption_invoices' },
            ],
        },

        {
            title: 'reports',
            icon: 'ki-solid ki-some-files',
            items: [
                { path: ROUTES.INVENTORY_LEVEL_REPORT, label: 'inventory_level_report', adminOnly: true },
                { path: ROUTES.INVENTORY_TRANSACTIONS, label: 'inventory_transaction_report', adminOnly: true },
                { path: ROUTES.ITEM_MOVEMENT_REPORT, label: 'item_movement_report', adminOnly: true },
                { path: ROUTES.MOST_BUY_ITEMS, label: 'most_buy_items_report', adminOnly: true },
                { path: ROUTES.PRODUCED_ITEMS_MARGIN, label: 'produced_items_margin', adminOnly: true },
                { path: ROUTES.MINIMUM_QUANTITY_REPORT, label: 'minimum_quantity_items_report', adminOnly: true },
                { path: ROUTES.EXPIRY_ITEMS_REPORT, label: 'expiry_items_report', adminOnly: true },
                { path: ROUTES.SUPPLIER_TRANSACTIONS, label: 'supplier_transactions', adminOnly: true },
            ],
        },
    ]

    const isGroupActive = (items: MenuItem[]) => {
        return items.some(item => location.pathname.startsWith(item.path) || location.pathname === item.path)
    }

    const renderMenuLink = (item: MenuItem, isSubItem = true) => {
        const isActive = location.pathname === item.path
        const bullet = isSubItem ? (
            <span className="menu-bullet">
                <span className="bullet bullet-dot"></span>
            </span>
        ) : null

        return (
            <div className="menu-item" key={item.path}>
                <Link
                    to={item.path}
                    className={`menu-link without-sub ${isActive ? 'active' : ''}`}
                >
                    {bullet}
                    <span className="menu-title">{t(item.label)}</span>
                </Link>
            </div>
        )
    }

    const calculateHeight = () => {
        if (!wrapperRef.current) return
        const logoHeight = logoRef.current?.offsetHeight || 0
        const available = window.innerHeight - logoHeight - 44
        setScrollHeight(Math.max(400, available))
    }

    useEffect(() => {
        calculateHeight()
        const onResize = () => calculateHeight()
        window.addEventListener('resize', onResize)
        const observer = new ResizeObserver(calculateHeight)
        if (wrapperRef.current?.parentElement)
            observer.observe(wrapperRef.current.parentElement)

        return () => {
            window.removeEventListener('resize', onResize)
            observer.disconnect()
        }
    }, [])

    return (
        <div
            id="kt_aside"
            className="aside aside-dark aside-hoverable"
            data-kt-drawer="true"
            data-kt-drawer-name="aside"
            data-kt-drawer-activate="{default: true, lg: false}"
            data-kt-drawer-overlay="true"
            data-kt-drawer-width="{default:'200px', '300px': '250px'}"
            data-kt-drawer-toggle="#kt_aside_mobile_toggle"
        >
            <div ref={logoRef} className="d-none d-lg-flex flex-center px-6 pt-4 pb-0" id="kt_aside_logo">
                <Link to={ROUTES.DASHBOARD}>
                    <img alt="Logo" src="/assets/media/logos/custom-3.svg" className="h-15px logo" />
                </Link>
            </div>

            <div className="aside-menu flex-column-fluid mt-6">
                <div
                    ref={wrapperRef}
                    className="hover-scroll-overlay-y"
                    id="kt_aside_menu_wrapper"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: false, lg: true}"
                    data-kt-scroll-height="auto"
                    data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
                    data-kt-scroll-wrappers="#kt_aside_menu"
                    data-kt-scroll-offset="0"
                    style={{ maxHeight: `${scrollHeight}px` }}
                >
                    <div
                        className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500"
                        id="kt_aside_menu"
                        data-kt-menu="true"
                    >
                        {menuGroups.map((group) => {
                            const visibleItems = group.items.filter(item => !item.adminOnly || canManage)
                            if (visibleItems.length === 0) return null
                            const active = isGroupActive(visibleItems)
                            const show = active ? 'show' : ''

                            return (
                                <div
                                    key={group.title}
                                    data-kt-menu-trigger="click"
                                    className={`menu-item menu-accordion ${show}`}
                                >
                                    <span className="menu-link">
                                        <span className="menu-icon">
                                            <i className={`${group.icon} fs-2`}></i>
                                        </span>
                                        <span className="menu-title">{t(group.title)}</span>
                                        <span className="menu-arrow"></span>
                                    </span>

                                    <div className="menu-sub menu-sub-accordion">
                                        {visibleItems.map((item) => renderMenuLink(item, true))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar