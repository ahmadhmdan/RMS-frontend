import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import MainLayout from '../layouts/MainLayout'
import { ROUTES } from '../core/utils/constants'

import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import Login from '../modules/auth/pages/Login'
import Dashboard from '../modules/dashboard/pages/Dashboard'
import CreatePurchaseInvoice from '../modules/invoices/pages/createInvoices'
import PurchaseInvoice from '../modules/invoices/pages/Invoices'
import ViewPurchaseInvoice from '../modules/invoices/pages/ViewPurchaseInvoice'
import ManufacturingInvoices from '../modules/manufacturing-invoices/pages/ManufacturingInvoices'
import CreateManufacturingInvoice from '../modules/manufacturing-invoices/pages/createManufacturingInvoices'
import ViewManufacturingInvoice from '../modules/manufacturing-invoices/pages/ViewManufacturingInvoice'
import InventoryLevelReport from '../modules/inventory-level-report/pages/InventoryLevelReport'
import Categories from '../modules/categories/pages/Categories'
import Inventories from '../modules/inventories/pages/Inventories'
import Suppliers from '../modules/suppliers/pages/Suppliers'
import Countries from '../modules/countries/pages/Countries'
import Cities from '../modules/cities/pages/Cities'
import ItemGroups from '../modules/item-groups/pages/ItemGroups'
import TransferInvoice from '../modules/transfer-invoice/pages/TransferInvoice'
import CreateTransferInvoice from '../modules/transfer-invoice/pages/createTransferInvoice'
import ViewTransferInvoice from '../modules/transfer-invoice/pages/ViewTransferInvoice'
import Items from '../modules/items/pages/Items'
import FullProducedItems from '../modules/full-produced-items/pages/Items'
import HalfProducedItems from '../modules/half-produced-items/pages/Items'
import ReverseProducedItems from '../modules/reverse-produced-itmes/pages/Items'
import ServiceableItems from '../modules/Serviceable-items/pages/Items'
import CreateItem from '../modules/items/pages/CreateItem'
import ViewItemTransactions from '../modules/items/pages/ViewItemTransactions'
import InventoryTransactionReport from '../modules/inventory-transaction-report/pages/InventoryTransactionReport'
import MostBuyItemsReport from '../modules/most-buy-items-report/pages/MostBuyItemsReport'
import Units from '../modules/units/pages/Units'
import goodsInvoices from '../modules/goods-invoices/pages/goodsInvoices'
import CreateGoodsInvoice from '../modules/goods-invoices/pages/createGoodsInvoices'
import ViewGoodsInvoice from '../modules/goods-invoices/pages/ViewGoodsInvoice'
import ItemsTree from '../modules/items-tree/pages/ItemsTree'
import SellInvoices from '../modules/sell-invoice/pages/SellInvoices'
import createSellInvoices from '../modules/sell-invoice/pages/createSellInvoices'
import WasteInvoices from '../modules/waste-invoices/pages/WasteInvoices'
import CreateWasteInvoice from '../modules/waste-invoices/pages/CreateWasteInvoice'
import ViewWasteInvoice from '../modules/waste-invoices/pages/ViewWasteInvoice'
import ViewConsumptionInvoice from '../modules/consumption-invoices/pages/ViewConsumptionInvoice'
import CreateConsumptionInvoice from '../modules/consumption-invoices/pages/CreateConsumptionInvoice'
import ConsumptionInvoices from '../modules/consumption-invoices/pages/ConsumptionInvoices'
import CostAnalysis from '../modules/cost-analysis/pages/CostAnalysis'
import costAnalysisTable from '../modules/cost-analysis/pages/CostAnalysisTable'
import ViewCostAnalysisDetails from '../modules/cost-analysis/pages/ViewCostAnalysisDetails'
import ReturnInvoices from '../modules/returnInvoice/pages/Invoices'
import ReturnInvoice from '../modules/returnInvoice/pages/createInvoices'
import ViewReturnInvoice from '../modules/returnInvoice/pages/ViewReturnInvoice'
import InventoryCounts from '../modules/inventory-counts/pages/InventoryCounts'
import InventoryCountDetails from '../modules/inventory-counts/pages/InventoryCountDetails'
import CreateInventoryCount from '../modules/inventory-counts/pages/CreateInventoryCount'
import InventoryAdjustment from '../modules/inventory-counts/pages/InventoryAdjustment'
import ProducedItemsMargin from '../modules/produced-items-margin/pages/ProducedItemsMargin'
import Currencies from '../modules/currencies/pages/Currencies'
import Settings from '../modules/settings/pages/Settings'
import MinimumQuantity from '../modules/minimum-quantity-items-report/pages/MinimumQuantity'
import ExpiryItems from '../modules/expiry-items-report/pages/ExpiryItems'
import SupplierTransactions from '../modules/supplier-transactions/pages/SupplierTransactions'
import ItemMovementReport from '../modules/item-movement-report/pages/ItemMovementReport'

const privateRoutes = [
    { path: ROUTES.DASHBOARD, component: Dashboard },
    { path: ROUTES.SETTINGS, component: Settings },
    { path: ROUTES.CURRENCIES, component: Currencies },

    { path: ROUTES.INVENTORY_COUNTS, component: InventoryCounts },
    { path: `${ROUTES.INVENTORY_COUNT_DETAILS}/:id`, component: InventoryCountDetails },
    { path: ROUTES.CREATE_INVENTORY_COUNT, component: CreateInventoryCount },
    { path: `${ROUTES.INVENTORY_ADJUSTMENT}/:id`, component: InventoryAdjustment },

    { path: ROUTES.PRODUCED_ITEMS_MARGIN, component: ProducedItemsMargin },

    // Purchase Invoice
    { path: ROUTES.PURCHASE_INVOICES, component: PurchaseInvoice },
    { path: ROUTES.CREATE_PURCHASE_INVOICES, component: CreatePurchaseInvoice },
    { path: `${ROUTES.PURCHASE_INVOICE_DETAILS}/:id`, component: ViewPurchaseInvoice },

    // Manufacturing Invoices
    { path: ROUTES.MANUFACTURING_INVOICE, component: ManufacturingInvoices },
    { path: ROUTES.CREATE_MANUFACTURING_INVOICE, component: CreateManufacturingInvoice },
    { path: `${ROUTES.MANUFACTURING_INVOICE_DETAILS}/:id`, component: ViewManufacturingInvoice },

    // Transfer Invoice
    { path: ROUTES.TRANSFER_INVOICE, component: TransferInvoice },
    { path: ROUTES.CREATE_TRANSFER_INVOICE, component: CreateTransferInvoice },
    { path: `${ROUTES.TRANSFER_INVOICE_DETAILS}/:id`, component: ViewTransferInvoice },

    // goods Invoices
    { path: ROUTES.GOODS_INVOICE, component: goodsInvoices },
    { path: ROUTES.CREATE_GOODS_INVOICE, component: CreateGoodsInvoice },
    { path: `${ROUTES.GOODS_INVOICE_DETAILS}/:id`, component: ViewGoodsInvoice },

    // sell Invoices
    { path: ROUTES.CREATE_SELL_INVOICES, component: createSellInvoices },
    { path: ROUTES.SELL_INVOICES, component: SellInvoices },
    { path: ROUTES.SELL_INVOICE_DETAILS + '/:id', component: ViewPurchaseInvoice },

    // waste Invoices
    { path: ROUTES.CREATE_WASTE_INVOICE, component: CreateWasteInvoice },
    { path: ROUTES.WASTE_INVOICE, component: WasteInvoices },
    { path: ROUTES.WASTE_INVOICE_DETAILS + '/:id', component: ViewWasteInvoice },

    // consumption Invoices
    { path: ROUTES.CREATE_CONSUMPTION_INVOICE, component: CreateConsumptionInvoice },
    { path: ROUTES.CONSUMPTION_INVOICE, component: ConsumptionInvoices },
    { path: ROUTES.CONSUMPTION_INVOICE_DETAILS + '/:id', component: ViewConsumptionInvoice },

    // Return Invoice
    { path: ROUTES.RETURN_INVOICES, component: ReturnInvoices },
    { path: ROUTES.CREATE_RETURN_INVOICES, component: ReturnInvoice },
    { path: `${ROUTES.RETURN_INVOICE_DETAILS}/:id`, component: ViewReturnInvoice },

    // Reports 
    { path: ROUTES.INVENTORY_LEVEL_REPORT, component: InventoryLevelReport },
    { path: ROUTES.INVENTORY_TRANSACTIONS, component: InventoryTransactionReport },
    { path: ROUTES.MOST_BUY_ITEMS, component: MostBuyItemsReport },
    { path: ROUTES.MINIMUM_QUANTITY_REPORT, component: MinimumQuantity },
    { path: ROUTES.EXPIRY_ITEMS_REPORT, component: ExpiryItems },
    { path: ROUTES.SUPPLIER_TRANSACTIONS, component: SupplierTransactions },
    { path: ROUTES.ITEM_MOVEMENT_REPORT, component: ItemMovementReport },

    // CRUD's
    { path: ROUTES.CATEGORIES, component: Categories },
    { path: ROUTES.INVENTORIES, component: Inventories },
    { path: ROUTES.SUPPLIERS, component: Suppliers },
    { path: ROUTES.COUNTRIES, component: Countries },
    { path: ROUTES.CITIES, component: Cities },
    { path: ROUTES.ITEM_GROUPS, component: ItemGroups },
    { path: ROUTES.UNITS, component: Units },

    // Items
    { path: ROUTES.ITEMS, component: Items },
    { path: ROUTES.FULL_PRODUCED_ITEMS, component: FullProducedItems },
    { path: ROUTES.HALF_PRODUCED_ITEMS, component: HalfProducedItems },
    { path: ROUTES.REVERSE_PRODUCED_ITEMS, component: ReverseProducedItems },
    { path: ROUTES.SERVICEABLE_ITEMS, component: ServiceableItems },
    { path: `${ROUTES.ITEMS_TRANSACTIONS}/:id`, component: ViewItemTransactions },
    { path: `${ROUTES.CREATE_ITEM}/:type`, component: CreateItem },
    { path: `${ROUTES.EDIT_ITEM}/:id/:type`, component: CreateItem },
    { path: ROUTES.ITEMS_TREE, component: ItemsTree },

    // cost-analysis
    { path: ROUTES.COST_ANALYSIS, component: CostAnalysis },
    { path: ROUTES.COST_ANALYSIS_TABLE, component: costAnalysisTable },
    { path: `${ROUTES.COST_ANALYSIS_DETAILS}/:id`, component: ViewCostAnalysisDetails },

    { path: ROUTES.HOME, component: Dashboard },
]

const AppRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />
            <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />

            {privateRoutes.map(({ path, component: Component }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Component />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
            ))}
        </Routes>
    )
}

export default AppRoutes