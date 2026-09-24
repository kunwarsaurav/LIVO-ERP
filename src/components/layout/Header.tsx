import React from 'react';
import {
  Bell,
  Search,
  Building2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface HeaderProps {
  onQuickNewProduct: () => void;
  onQuickPOS: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickNewProduct,
  onQuickPOS,
  searchTerm,
  setSearchTerm,
}) => {
  const { lowStockCount, resetAllData } = useERP();

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-inner font-serif font-bold text-xl tracking-wider">
          L
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold tracking-widest text-lg text-stone-100 uppercase">
              LIVO FURNITURE
            </h1>
            <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
              Luxury Interiors & ERP
            </span>
          </div>
          <p className="text-xs text-stone-400 font-normal">
            Downtown Flagship Showroom & Studio • System v2.6
          </p>
        </div>
      </div>

      {/* Global quick search */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, product, invoice, customer, or lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-800/80 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5">
        {lowStockCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{lowStockCount} Low Stock</span>
          </div>
        )}

        <button
          onClick={onQuickPOS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          title="Open Point of Sale terminal"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Quick POS</span>
        </button>

        <button
          onClick={onQuickNewProduct}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Add Product</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Reset system data to official Livo Furniture initial demo state?')) {
              resetAllData();
            }
          }}
          className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
          title="Reset sample data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
