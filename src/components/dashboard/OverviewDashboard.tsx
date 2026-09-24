import React from 'react';
import {
  Boxes,
  TrendingUp,
  Receipt,
  AlertTriangle,
  FileText,
  Truck,
  Users2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  PackageCheck,
  Building,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import { NavTab } from '../layout/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenPOS: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, onOpenPOS }) => {
  const {
    products,
    invoices,
    quotations,
    leads,
    orders,
    installations,
    stockMovements,
    totalStockValueCost,
    totalStockValueRetail,
    lowStockCount,
    totalReceivables,
  } = useERP();

  // Metrics
  const totalSalesRevenue = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalInvoicedValue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const pendingInstallationCount = installations.filter((i) => i.status !== 'Completed & Approved').length;
  const lowStockItems = products.filter((p) => p.currentStock <= p.minAlertStock);
  const potentialProfitOnStock = totalStockValueRetail - totalStockValueCost;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-xl p-6 text-white shadow-md border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-End Architecture & Furniture ERP
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Welcome to LIVO FURNITURE Executive Suite
          </h2>
          <p className="text-stone-300 text-xs mt-1 max-w-2xl">
            Live operations, high-luxury showroom stock, turnkey interior project pipelines, precision accounting, and automated MRP tag studio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenPOS}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Quick POS Billing
          </button>
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium transition-all"
          >
            Luxury Catalogues
          </button>
          <button
            onClick={() => onNavigate('mrp')}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium transition-all"
          >
            Print Barcode Tags
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inventory Value */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatCurrency(totalStockValueRetail)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>At Cost: {formatCurrency(totalStockValueCost)}</span>
            <span className="text-emerald-700 font-medium">
              +{formatCurrency(potentialProfitOnStock)} Margin
            </span>
          </div>
        </div>

        {/* Realized Sales */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Realized Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>Total Invoiced: {formatCurrency(totalInvoicedValue)}</span>
            <span className="text-stone-600 font-medium">{invoices.length} Invoices</span>
          </div>
        </div>

        {/* Receivables */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Receivables Outstanding</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatCurrency(totalReceivables)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>Customer Balances</span>
            <button
              onClick={() => onNavigate('accounting')}
              className="text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-0.5"
            >
              View Ledger <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Low Stock & Site Ops */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stock & Site Alerts</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-amber-700">{lowStockCount}</span>
            <span className="text-xs text-stone-600">Low Stock SKUs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>{pendingInstallationCount} Active Sites</span>
            <button
              onClick={() => onNavigate('stock')}
              className="text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-0.5"
            >
              Reorder <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Double Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alerts & Recent Movements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Alerts Box */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
                  Critical Low-Stock Reorder Alerts
                </h3>
              </div>
              <button
                onClick={() => onNavigate('stock')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                View All Products ({products.length})
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                All stock levels are currently healthy and above minimum thresholds.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {lowStockItems.map((prod) => (
                  <div key={prod.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {prod.sku}
                          </span>
                          <span className="text-xs font-semibold text-stone-900">{prod.name}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Brand: <span className="font-medium text-stone-700">{prod.brand}</span> • Supplier: {prod.supplierName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-xs font-bold text-rose-600">
                          {prod.currentStock} in stock
                        </div>
                        <div className="text-[10px] text-stone-600">
                          Min Alert: {prod.minAlertStock}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('suppliers')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium tracking-wide transition-all"
                      >
                        Order PO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Stock In/Out Transactions */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
                  Recent Stock Movements (In / Out)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('stock')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                Full Movement Ledger
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-100 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">SKU / Item</th>
                    <th className="py-2.5 px-4">Quantity</th>
                    <th className="py-2.5 px-4">Reason / Ref</th>
                    <th className="py-2.5 px-4">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {stockMovements.slice(0, 5).map((mov) => (
                    <tr key={mov.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-mono text-stone-500">{formatDate(mov.date)}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            mov.type === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {mov.type === 'IN' ? '+ IN' : '- OUT'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-stone-900">{mov.productName}</div>
                        <div className="font-mono text-[10px] text-stone-600">{mov.sku}</div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">
                        {mov.type === 'IN' ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </td>
                      <td className="py-2.5 px-4 text-stone-600">
                        <div>{mov.reason}</div>
                        <span className="font-mono text-[10px] text-amber-700">{mov.referenceNo}</span>
                      </td>
                      <td className="py-2.5 px-4 text-stone-500">{mov.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: High-End Active Installations & Project Pipeline */}
        <div className="space-y-6">
          {/* Active Site Installations */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Active Site Installations
              </h3>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                View CRM
              </button>
            </div>

            <div className="space-y-3">
              {installations.map((inst) => (
                <div
                  key={inst.id}
                  className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 hover:bg-stone-100/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-xs text-stone-900">
                      {inst.clientName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(inst.status)}`}>
                      {inst.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mb-1.5 truncate">
                    {inst.siteAddress}
                  </p>
                  <div className="text-[10px] text-stone-600 bg-white p-2 rounded border border-stone-200 font-mono">
                    Date: {formatDate(inst.scheduledDate)} • Lead: {inst.leadSupervisor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Design Pipeline */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Users2 className="w-4 h-4 text-amber-600" />
                Interior Design Pipeline
              </h3>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                Pipeline Kanban
              </button>
            </div>

            <div className="space-y-2.5">
              {leads.slice(0, 4).map((ld) => (
                <div key={ld.id} className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-stone-900">{ld.clientName}</div>
                    <div className="text-[10px] text-stone-500">
                      {ld.clientType} • {ld.spaceSizeSqFt.toLocaleString()} sq.ft
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900">
                      {formatCurrency(ld.budgetEst)}
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${getStatusColor(ld.stage)}`}>
                      {ld.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
