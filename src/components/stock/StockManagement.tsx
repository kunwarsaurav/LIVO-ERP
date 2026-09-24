import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Layers,
  Sparkles,
  QrCode,
  Tag,
  CheckCircle2,
  Trash2,
  Edit,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product, ProductCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface StockManagementProps {
  onOpenTagModal?: (product: Product) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({ onOpenTagModal }) => {
  const {
    products,
    stockMovements,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockMovement,
    totalStockValueCost,
    totalStockValueRetail,
    lowStockCount,
  } = useERP();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'brands' | 'movements'>('products');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementTargetProduct, setMovementTargetProduct] = useState<Product | null>(null);

  // Stock movement form state
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<any>('Purchase Receipt');
  const [movementRef, setMovementRef] = useState('');
  const [movementStaff, setMovementStaff] = useState('Showroom Logistics Officer');
  const [movementNotes, setMovementNotes] = useState('');

  // Extract unique brands & categories
  const allBrands = Array.from(new Set(products.map((p) => p.brand)));
  const allCategories = Array.from(new Set(products.map((p) => p.category)));

  // Brand-wise aggregation
  const brandStats = allBrands.map((brand) => {
    const brandProds = products.filter((p) => p.brand === brand);
    const totalQty = brandProds.reduce((acc, p) => acc + p.currentStock, 0);
    const totalCost = brandProds.reduce((acc, p) => acc + p.purchasePrice * p.currentStock, 0);
    const totalRetail = brandProds.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);
    const lowStockInBrand = brandProds.filter((p) => p.currentStock <= p.minAlertStock).length;
    return {
      brand,
      count: brandProds.length,
      totalQty,
      totalCost,
      totalRetail,
      lowStockInBrand,
    };
  });

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.currentStock <= p.minAlertStock;
    return matchesSearch && matchesBrand && matchesCat && matchesLowStock;
  });

  const handleOpenMovementModal = (product: Product, defaultType: 'IN' | 'OUT' = 'IN') => {
    setMovementTargetProduct(product);
    setMovementType(defaultType);
    setMovementReason(defaultType === 'IN' ? 'Purchase Receipt' : 'Showroom Sale');
    setMovementRef(defaultType === 'IN' ? `PO-${Date.now().toString().slice(-4)}` : `DISP-${Date.now().toString().slice(-4)}`);
    setMovementQty(1);
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementTargetProduct || movementQty <= 0) return;

    addStockMovement({
      productId: movementTargetProduct.id,
      productName: movementTargetProduct.name,
      sku: movementTargetProduct.sku,
      type: movementType,
      quantity: Number(movementQty),
      reason: movementReason,
      referenceNo: movementRef || 'MANUAL-LOG',
      performedBy: movementStaff,
      notes: movementNotes,
    });

    setIsMovementModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-700" />
            Stock & Inventory Management
          </h2>
          <p className="text-xs text-stone-500">
            Real-time multi-brand showroom stock, SKU tracking, procurement rates, selling prices, and live movement audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Register New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-stone-500 uppercase">Total Catalog SKUs</div>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">{products.length} Items</div>
          <div className="text-[11px] text-stone-500 mt-1">{allBrands.length} Partner Brands</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-stone-500 uppercase">Total Units in Stock</div>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">
            {products.reduce((acc, p) => acc + p.currentStock, 0)} Units
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Showroom & Warehouse</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-medium text-stone-500 uppercase">Stock Valuation (Cost)</div>
          <div className="text-xl font-serif font-bold text-stone-900 mt-1">
            {formatCurrency(totalStockValueCost)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Retail: {formatCurrency(totalStockValueRetail)}
          </div>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            onlyLowStock || lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-300 text-amber-900'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          <div className="text-[11px] font-medium uppercase flex items-center justify-between">
            <span>Low-Stock Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-serif font-bold text-amber-700 mt-1">
            {lowStockCount} Products
          </div>
          <div className="text-[11px] text-amber-800 font-medium mt-1 underline">
            {onlyLowStock ? 'Showing low stock only' : 'Click to filter low stock'}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2.5 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          Product-Wise Stock ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`pb-2.5 border-b-2 transition-all ${
            activeTab === 'brands'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          Brand-Wise Stock Summary ({allBrands.length} Brands)
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-2.5 border-b-2 transition-all ${
            activeTab === 'movements'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          Stock In / Out Ledger ({stockMovements.length} Entries)
        </button>
      </div>

      {/* TAB 1: PRODUCT-WISE STOCK */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by SKU, name, barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Brands</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-amber-800 font-medium">Low Stock Alerts Only</span>
              </label>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-3">Category & Brand</th>
                    <th className="py-3 px-3">Dimensions & Finish</th>
                    <th className="py-3 px-3 text-right">Purchase Price</th>
                    <th className="py-3 px-3 text-right">Selling / MRP</th>
                    <th className="py-3 px-3 text-center">Stock Count</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-500">
                        No products match your current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isLowStock = product.currentStock <= product.minAlertStock;
                      const marginPct = (
                        ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) *
                        100
                      ).toFixed(0);

                      return (
                        <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-semibold text-stone-900">{product.name}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    {product.sku}
                                  </span>
                                  <span className="font-mono text-[10px] text-stone-400">
                                    {product.modelNumber}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-stone-900">{product.category}</div>
                            <span className="text-[11px] text-stone-500">{product.brand}</span>
                          </td>

                          <td className="py-3 px-3 max-w-xs">
                            <div className="truncate text-stone-700">{product.sizeDimensions}</div>
                            <div className="truncate text-[10px] text-stone-400">{product.colorFinish}</div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-medium text-stone-700">
                            {formatCurrency(product.purchasePrice)}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="font-mono font-bold text-stone-900">
                              {formatCurrency(product.sellingPrice)}
                            </div>
                            <div className="text-[10px] text-stone-600 line-through">
                              MRP {formatCurrency(product.mrp)}
                            </div>
                            <span className="text-[9px] text-emerald-700 font-medium">
                              +{marginPct}% Margin
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div
                              className={`inline-flex flex-col items-center px-2.5 py-1 rounded-md border text-center ${
                                isLowStock
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold animate-pulse'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                              }`}
                            >
                              <span className="text-xs">{product.currentStock} Units</span>
                              <span className="text-[9px] font-normal opacity-80">
                                Min: {product.minAlertStock}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-stone-600">
                            <div className="truncate max-w-[140px] font-medium">
                              {product.supplierName}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              {product.warrantyYears}y Warranty
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Stock IN */}
                              <button
                                onClick={() => handleOpenMovementModal(product, 'IN')}
                                title="Stock In"
                                className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-700 transition-colors"
                              >
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Stock OUT */}
                              <button
                                onClick={() => handleOpenMovementModal(product, 'OUT')}
                                title="Stock Out / Dispatch"
                                className="p-1.5 rounded-md hover:bg-amber-100 text-amber-700 transition-colors"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Tag */}
                              {onOpenTagModal && (
                                <button
                                  onClick={() => onOpenTagModal(product)}
                                  title="Print MRP & QR Tag"
                                  className="p-1.5 rounded-md hover:bg-stone-200 text-stone-700 transition-colors"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsAddModalOpen(true);
                                }}
                                title="Edit Product"
                                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-700 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`Delete product ${product.name} (${product.sku})?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                title="Delete"
                                className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRAND-WISE STOCK OVERVIEW */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandStats.map((b) => (
              <div
                key={b.brand}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wide">
                      {b.brand}
                    </h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                    {b.count} SKUs
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Current Stock Quantity:</span>
                    <span className="font-bold text-stone-900">{b.totalQty} Units</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Stock Valuation at Cost:</span>
                    <span className="font-mono font-medium text-stone-700">
                      {formatCurrency(b.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Retail Revenue Potential:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {formatCurrency(b.totalRetail)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Low Stock Status:</span>
                    {b.lowStockInBrand > 0 ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {b.lowStockInBrand} Items Critical
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">All Healthy</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBrand(b.brand);
                    setActiveTab('products');
                  }}
                  className="w-full mt-4 py-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/70 rounded-lg font-medium transition-colors"
                >
                  View Brand SKUs & Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK IN / OUT LEDGER */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Audit Trail: Inbound / Outbound / Adjustments
            </h3>
            <span className="text-xs text-stone-500">{stockMovements.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-100 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">SKU & Item Name</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3">Reason / Operation</th>
                  <th className="py-3 px-3">Reference No</th>
                  <th className="py-3 px-4">Staff Sign-off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-mono text-stone-500">{formatDate(mov.date)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          mov.type === 'IN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {mov.type === 'IN' ? '+ INBOUND' : '- DISPATCH'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{mov.productName}</div>
                      <span className="font-mono text-[10px] text-amber-800">{mov.sku}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                      {mov.type === 'IN' ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      <div>{mov.reason}</div>
                      {mov.notes && <div className="text-[10px] text-stone-600 italic">{mov.notes}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-700">{mov.referenceNo}</td>
                    <td className="py-3 px-4 text-stone-600">{mov.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Product */}
      {isAddModalOpen && (
        <ProductFormModal
          product={editingProduct}
          suppliers={suppliers}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(data) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, data);
            } else {
              addProduct(data);
            }
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* MODAL: Stock In / Stock Out Action */}
      {isMovementModalOpen && movementTargetProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Record Stock Movement
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {movementTargetProduct.name} ({movementTargetProduct.sku}) • Current Stock: <strong>{movementTargetProduct.currentStock}</strong>
            </p>

            <form onSubmit={handleSaveMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('IN');
                      setMovementReason('Purchase Receipt');
                    }}
                    className={`py-2 rounded-lg font-semibold border ${
                      movementType === 'IN'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    + Stock IN (Inbound)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('OUT');
                      setMovementReason('Showroom Sale');
                    }}
                    className={`py-2 rounded-lg font-semibold border ${
                      movementType === 'OUT'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    - Stock OUT (Dispatch)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Reason / Purpose</label>
                  <select
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  >
                    {movementType === 'IN' ? (
                      <>
                        <option value="Purchase Receipt">Purchase Receipt</option>
                        <option value="Return">Customer Return</option>
                        <option value="Sample Display">Sample Returned</option>
                      </>
                    ) : (
                      <>
                        <option value="Showroom Sale">Showroom Sale</option>
                        <option value="Project Dispatch">Project Dispatch</option>
                        <option value="Damaged/Scrap">Damaged / Scrap</option>
                        <option value="Sample Display">Sample Display</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Reference Number (PO/SO)</label>
                <input
                  type="text"
                  value={movementRef}
                  onChange={(e) => setMovementRef(e.target.value)}
                  placeholder="e.g. PO-2026-99"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Performed By (Staff)</label>
                <input
                  type="text"
                  value={movementStaff}
                  onChange={(e) => setMovementStaff(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Notes / Bay Location</label>
                <textarea
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="e.g. Cleared at Warehouse Bay 4, unboxed in pristine state"
                  rows={2}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-sm"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Add/Edit Product Modal
interface ProductFormModalProps {
  product: Product | null;
  suppliers: any[];
  onClose: () => void;
  onSave: (data: Omit<Product, 'id'>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  suppliers,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    sku: product?.sku || `LIV-SKU-${Date.now().toString().slice(-4)}`,
    name: product?.name || '',
    brand: product?.brand || 'Livo Signature',
    category: product?.category || 'Sofa',
    subCategory: product?.subCategory || '',
    modelNumber: product?.modelNumber || `MDL-${Date.now().toString().slice(-4)}`,
    sizeDimensions: product?.sizeDimensions || '',
    colorFinish: product?.colorFinish || '',
    material: product?.material || '',
    purchasePrice: product?.purchasePrice || 1000,
    dealerPrice: product?.dealerPrice || 1400,
    sellingPrice: product?.sellingPrice || 1950,
    mrp: product?.mrp || 2400,
    currentStock: product?.currentStock || 2,
    minAlertStock: product?.minAlertStock || 2,
    supplierId: product?.supplierId || suppliers[0]?.id || 'sup-01',
    supplierName: product?.supplierName || suppliers[0]?.name || 'Milano Artisan Works',
    barcode: product?.barcode || `LIV89201${Math.floor(1000 + Math.random() * 9000)}`,
    warrantyYears: product?.warrantyYears || 5,
    description: product?.description || '',
    imageUrl:
      product?.imageUrl ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    featuredInCatalogue: product?.featuredInCatalogue ?? true,
    specifications: product?.specifications || ['High-grade bespoke manufacture'],
    customizable: product?.customizable ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories: ProductCategory[] = [
    'Sofa',
    'Bed',
    'Wardrobe',
    'Kitchen',
    'Kitchen accessories/hardware',
    'Dining',
    'Office furniture',
    'Curtains/Parda',
    'Carpet',
    'Gypsum products',
    'Home décor',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-stone-200 my-8">
        <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
          {product ? 'Edit Luxury Product' : 'Register New Luxury Product & SKU'}
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Configure dimensions, pricing margins, warranty, and supplier associations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Milano Executive Desk"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Brand</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Livo Atelier, Poliform Italy"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">SKU / Product Code</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Model Number</label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Catalogue Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ProductCategory })
                }
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => {
                  const sup = suppliers.find((s) => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    supplierId: e.target.value,
                    supplierName: sup ? sup.name : formData.supplierName,
                  });
                }}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.brandsSupplied?.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Size / Dimensions</label>
              <input
                type="text"
                value={formData.sizeDimensions}
                onChange={(e) => setFormData({ ...formData, sizeDimensions: e.target.value })}
                placeholder="e.g. 280cm W x 110cm D x 78cm H"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Colour / Finish</label>
              <input
                type="text"
                value={formData.colorFinish}
                onChange={(e) => setFormData({ ...formData, colorFinish: e.target.value })}
                placeholder="e.g. Canaletto Walnut & Brushed Brass"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
            <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
              Pricing Structure & Margin
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-500 text-[10px] mb-1">Purchase Price</label>
                <input
                  type="number"
                  required
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] mb-1">Dealer / Dist. Rate</label>
                <input
                  type="number"
                  value={formData.dealerPrice}
                  onChange={(e) => setFormData({ ...formData, dealerPrice: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] mb-1">Selling Price</label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] mb-1">MRP Tag Price</label>
                <input
                  type="number"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Stock Levels & Warranty */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Initial Stock Count</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Low-Stock Alert Qty</label>
              <input
                type="number"
                min="1"
                value={formData.minAlertStock}
                onChange={(e) => setFormData({ ...formData, minAlertStock: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Warranty (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.warrantyYears}
                onChange={(e) => setFormData({ ...formData, warrantyYears: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-sm"
            >
              {product ? 'Save Changes' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
