import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Receipt,
  CreditCard,
  QrCode,
  BookOpen,
  Truck,
  Users2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export type NavTab =
  | 'dashboard'
  | 'stock'
  | 'accounting'
  | 'billing'
  | 'mrp'
  | 'catalogue'
  | 'suppliers'
  | 'crm';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { lowStockCount, quotations, leads, orders } = useERP();

  const pendingQuotes = quotations.filter((q) => q.status === 'Sent').length;
  const activeOrders = orders.filter((o) => o.productionStatus !== 'Installed & Signed Off').length;
  const activeLeads = leads.filter((l) => l.stage !== 'Lost' && l.stage !== 'Won / Order').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'stock' as NavTab,
      label: 'Stock Management',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'accounting' as NavTab,
      label: 'Accounting & P&L',
      icon: Receipt,
      badge: 'VAT Compliant',
      badgeColor: 'bg-stone-100 text-stone-700',
    },
    {
      id: 'billing' as NavTab,
      label: 'Billing & Payroll',
      icon: CreditCard,
      badge: pendingQuotes > 0 ? `${pendingQuotes} quotes` : null,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'mrp' as NavTab,
      label: 'MRP & Tag Studio',
      icon: QrCode,
      badge: 'Barcode/QR',
      badgeColor: 'bg-stone-100 text-stone-700',
    },
    {
      id: 'catalogue' as NavTab,
      label: 'Printed Catalogues',
      icon: BookOpen,
      badge: '11 Categories',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'suppliers' as NavTab,
      label: 'Distributor & Suppliers',
      icon: Truck,
      badge: null,
    },
    {
      id: 'crm' as NavTab,
      label: 'Customer & Sales CRM',
      icon: Users2,
      badge: activeLeads > 0 ? `${activeLeads} active` : null,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-stone-900/95 md:min-h-[calc(100vh-61px)] border-r border-stone-800 p-3 flex flex-col justify-between text-stone-300 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
          ERP Modules
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500/80'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${
                      isActive ? 'bg-amber-700/50 text-amber-100 border-amber-500/40' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Showroom Status Card */}
      <div className="mt-6 p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-stone-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Showroom Open
          </span>
          <span className="text-[10px] text-amber-400 font-mono">10:00 - 20:00</span>
        </div>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Al Wasl Design Quarter, Building 4. Site installations active today: <strong>{activeOrders}</strong>.
        </p>
      </div>
    </aside>
  );
};
