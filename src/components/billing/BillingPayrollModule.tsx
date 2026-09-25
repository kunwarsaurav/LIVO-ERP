import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  FileText,
  Users2,
  CalendarCheck2,
  DollarSign,
  Award,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  Printer,
  Trash2,
  Building,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useGlobalScanner } from '../../hooks/useGlobalScanner';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import {
  Product,
  Customer,
  Quotation,
  Invoice,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  CommissionRecord,
} from '../../types';

interface BillingPayrollProps {
  onPrintInvoice?: (invoice: Invoice) => void;
  onPrintQuotation?: (quotation: Quotation) => void;
}

export const BillingPayrollModule: React.FC<BillingPayrollProps> = ({
  onPrintInvoice,
  onPrintQuotation,
}) => {
  const {
    products,
    customers,
    quotations,
    invoices,
    employees,
    attendance,
    payroll,
    commissions,
    addCustomer,
    addQuotation,
    updateQuotationStatus,
    convertQuoteToOrder,
    addInvoice,
    recordInvoicePayment,
    addAttendance,
    processPayroll,
    updateCommissionStatus,
  } = useERP();

  // Exactly matching user's requested 7 Billing & Payroll sections
  const [activeTab, setActiveTab] = useState<
    'pos' | 'quotation' | 'invoice' | 'customers' | 'attendance' | 'payroll' | 'commission'
  >('pos');

  // ==========================================
  // POS State
  // ==========================================
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [posCart, setPosCart] = useState<Array<{ product: Product; quantity: number; discount: number }>>([]);
  const [posCustomerId, setPosCustomerId] = useState(customers[0]?.id || '');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer'>('Credit Card');
  const [recentPosReceipt, setRecentPosReceipt] = useState<Invoice | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // ==========================================
  // Quotation State & Modal
  // ==========================================
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteCustomerId, setQuoteCustomerId] = useState(customers[0]?.id || '');
  const [quoteProjectTitle, setQuoteProjectTitle] = useState('');
  const [quoteAddress, setQuoteAddress] = useState('');
  const [quoteValidDays, setQuoteValidDays] = useState(30);
  const [quoteItems, setQuoteItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number; discount: number }>
  >([]);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // ==========================================
  // Invoice State & Payment Modal
  // ==========================================
  const [settleInvoiceModal, setSettleInvoiceModal] = useState<Invoice | null>(null);
  const [settlePaymentAmount, setSettlePaymentAmount] = useState<number>(0);
  const [settlePaymentMode, setSettlePaymentMode] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque'>('Credit Card');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // ==========================================
  // Customer Modal & Search
  // ==========================================
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'totalSpent' | 'outstandingBalance'>>({
    name: '',
    companyName: '',
    type: 'Residential',
    phone: '',
    email: '',
    address: '',
    city: 'Dubai',
    taxNumber: '',
  });

  // ==========================================
  // Attendance State & Modal
  // ==========================================
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [newAttendanceRecord, setNewAttendanceRecord] = useState({
    employeeId: employees[0]?.id || '',
    status: 'Present' as AttendanceRecord['status'],
    checkIn: '09:00',
    checkOut: '18:00',
    overtimeHours: 0,
    notes: '',
  });

  // ==========================================
  // Payroll State
  // ==========================================
  const [payrollMonth, setPayrollMonth] = useState('September 2026');

  // ==========================================
  // POS Calculations & Handlers
  // ==========================================
  const filteredPosProducts = products.filter((p) => {
    const matchesCat = posCategory === 'All' || p.category === posCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(posSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  // Hardware Scanner Integration for POS
  useGlobalScanner({
    isActive: activeTab === 'pos',
    onScan: (scannedCode) => {
      const foundProduct = products.find(
        (p) => p.sku.toLowerCase() === scannedCode.toLowerCase() || p.barcode === scannedCode
      );
      if (foundProduct) {
        addToCart(foundProduct);
        setScanError(null);
      } else {
        console.warn(`Scanner: Product not found for code [${scannedCode}]`);
        setScanError(`No product found for scanned code: "${scannedCode}"`);
        setTimeout(() => setScanError(null), 3000);
      }
    },
  });

  const updateCartQty = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number; discount: number }>
    );
  };

  const cartSubtotal = posCart.reduce((sum, item) => {
    const discounted = item.product.sellingPrice * (1 - item.discount / 100);
    return sum + discounted * item.quantity;
  }, 0);
  const cartVat = Number((cartSubtotal * 0.05).toFixed(2)); // Nepal VAT 5%
  const cartGrandTotal = cartSubtotal + cartVat;

  const handleCompletePosSale = () => {
    if (posCart.length === 0) return;
    const cust = customers.find((c) => c.id === posCustomerId) || customers[0];

    const newInvItems = posCart.map((item) => {
      const taxable = item.product.sellingPrice * item.quantity * (1 - item.discount / 100);
      const vat = Number((taxable * 0.05).toFixed(2)); // Nepal VAT 5%
      return {
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        discountPercent: item.discount,
        taxableAmount: taxable,
        vatRate: 5,
        vatAmount: vat,
        total: taxable + vat,
      };
    });

    const count = invoices.length + 1;
    const invNumber = `POS-2026-${String(count).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const generatedInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      customerId: cust?.id || 'walk-in-001',
      customerName: cust?.name || 'Walk-in Customer',
      customerAddress: cust?.address || 'Dubai Showroom Walk-in',
      date: today,
      dueDate: today,
      items: newInvItems,
      subtotal: cartSubtotal,
      vatTotal: cartVat,
      grandTotal: cartGrandTotal,
      amountPaid: cartGrandTotal,
      paymentStatus: 'Paid',
      paymentMethod: posPaymentMethod,
      invoiceType: 'POS Receipt',
    };

    addInvoice(generatedInv);
    setRecentPosReceipt(generatedInv);
    setPosCart([]);
    
    // Auto-trigger the A4 normal printer invoice formatting!
    if (onPrintInvoice) {
      onPrintInvoice(generatedInv);
    }
  };

  // ==========================================
  // Quotation Handlers
  // ==========================================
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === quoteCustomerId);
    if (!cust || quoteItems.length === 0) return;

    const items = quoteItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const total = item.quantity * item.unitPrice * (1 - item.discount / 100);
      return {
        productId: item.productId,
        sku: prod?.sku || 'LIV-CUSTOM',
        name: prod?.name || 'Custom Product',
        category: prod?.category || 'Furniture',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discount,
        total,
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.total, 0);
    const vatAmount = Number((subtotal * 0.05).toFixed(2)); // Nepal VAT 5%
    const grandTotal = subtotal + vatAmount;

    const today = new Date();
    const validDate = new Date();
    validDate.setDate(today.getDate() + quoteValidDays);

    addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      projectTitle: quoteProjectTitle || 'Luxury Furnishing Proposal',
      projectAddress: quoteAddress || cust.address,
      validUntil: validDate.toISOString().split('T')[0],
      items,
      subtotal,
      vatRate: 5,
      vatAmount,
      discountAmount: 0,
      grandTotal,
      status: 'Sent',
      preparedBy: 'Elena Rostova (Principal Designer)',
    });

    setIsQuoteModalOpen(false);
    setQuoteProjectTitle('');
    setQuoteAddress('');
    setQuoteItems([]);
  };

  // ==========================================
  // Customer Handlers
  // ==========================================
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    addCustomer(newCustomer);
    setIsCustomerModalOpen(false);
    setNewCustomer({
      name: '',
      companyName: '',
      type: 'Residential',
      phone: '',
      email: '',
      address: '',
      city: 'Dubai',
      taxNumber: '',
    });
  };

  // ==========================================
  // Attendance Handlers
  // ==========================================
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((em) => em.id === newAttendanceRecord.employeeId);
    if (!emp) return;

    addAttendance({
      employeeId: emp.id,
      employeeName: emp.name,
      status: newAttendanceRecord.status,
      checkIn: newAttendanceRecord.checkIn,
      checkOut: newAttendanceRecord.checkOut,
      overtimeHours: Number(newAttendanceRecord.overtimeHours),
      notes: newAttendanceRecord.notes,
    });

    setIsAttendanceModalOpen(false);
  };

  // ==========================================
  // Invoice Payment Settle
  // ==========================================
  const handleSettleInvoicePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleInvoiceModal || settlePaymentAmount <= 0) return;
    recordInvoicePayment(settleInvoiceModal.id, settlePaymentAmount, settlePaymentMode);
    setSettleInvoiceModal(null);
    setSettlePaymentAmount(0);
  };

  const totalPayrollAmount = payroll.reduce((acc, p) => acc + p.netPay, 0);
  const totalCommissionPool = commissions.reduce((acc, c) => acc + c.totalCommission, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-stone-900 text-stone-100">
              Module 4
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Billing & Payroll</h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Showroom POS, Quotations, Invoices, Customer Database, Attendance, Payroll, and Sales Commissions.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-create-quote"
            onClick={() => setIsQuoteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-stone-100 rounded-lg hover:bg-stone-800 text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
          <button
            id="btn-add-customer"
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 border border-stone-300 text-stone-800 rounded-lg hover:bg-stone-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 7 Direct Navigation Tabs matching User Request */}
      <div className="flex overflow-x-auto border-b border-stone-200 gap-1 pb-1 scrollbar-thin">
        {[
          { id: 'pos', label: 'POS / Billing', icon: ShoppingCart },
          { id: 'quotation', label: 'Quotation', badge: quotations.length, icon: FileText },
          { id: 'invoice', label: 'Invoice', badge: invoices.length, icon: Receipt },
          { id: 'customers', label: 'Customer Database', badge: customers.length, icon: Users2 },
          { id: 'attendance', label: 'Employee Attendance', badge: 'Daily', icon: CalendarCheck2 },
          { id: 'payroll', label: 'Salary / Payroll', badge: `${employees.length} Staff`, icon: DollarSign },
          { id: 'commission', label: 'Commission / Incentives', badge: commissions.length, icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`billing-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs md:text-sm font-semibold whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-stone-900 text-stone-900 bg-stone-100/80 shadow-sm'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-stone-900 text-stone-100 font-bold'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. POS / BILLING TAB */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Catalog & Search */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="pos-search-input"
                    type="text"
                    placeholder="Search furniture by name, SKU, collection..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <select
                  id="pos-category-select"
                  value={posCategory}
                  onChange={(e) => setPosCategory(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Sofa">Sofa</option>
                  <option value="Bed">Bed</option>
                  <option value="Wardrobe">Wardrobe</option>
                  <option value="Dining">Dining</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Curtains/Parda">Curtains/Parda</option>
                  <option value="Carpet">Carpet</option>
                  <option value="Home décor">Home décor</option>
                </select>
              </div>
              {/* Scan Error Banner */}
              {scanError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold">
                  <span>⚠️</span>
                  <span>{scanError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto p-1">
                {filteredPosProducts.map((product) => (
                  <div
                    key={product.id}
                    id={`pos-item-${product.id}`}
                    onClick={() => addToCart(product)}
                    className="bg-white border border-stone-200 hover:border-stone-900 rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md group"
                  >
                    <div className="aspect-video bg-stone-100 rounded mb-2 overflow-hidden relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 right-1 bg-stone-900/80 text-white text-[9px] px-1 rounded">
                        {product.currentStock} in stock
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-mono">{product.sku}</div>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-stone-700">
                        {product.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold text-stone-900">{formatCurrency(product.sellingPrice)}</span>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        + Add
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Bill & Checkout Counter */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-200 bg-stone-50/75 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-stone-700" />
                  <h3 className="text-sm font-bold text-stone-900">Showroom Checkout Counter</h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">{posCart.length} items</span>
              </div>

              {/* Customer Selector */}
              <div className="p-3 border-b border-stone-200 bg-white">
                <label className="block text-[11px] font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  Billed To Client:
                </label>
                <select
                  id="pos-customer-select"
                  value={posCustomerId}
                  onChange={(e) => setPosCustomerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs font-medium text-stone-800"
                >
                  <option value="walk-in-001">Walk-in Customer (Default)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="p-3 divide-y divide-stone-100 max-h-[300px] overflow-y-auto">
                {posCart.length > 0 ? (
                  posCart.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">{item.product.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {formatCurrency(item.product.sellingPrice)} each
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-bold text-stone-900 w-16 text-right">
                        {formatCurrency(item.product.sellingPrice * item.quantity)}
                      </div>

                      <button
                        onClick={() => updateCartQty(item.product.id, -item.quantity)}
                        className="text-stone-400 hover:text-rose-600 text-xs p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    Cart is empty. Select products from the catalogue to start billing.
                  </div>
                )}
              </div>

              {/* Total Breakdown & Payment */}
              {posCart.length > 0 && (
                <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (5%)</span>
                      <span className="font-mono">{formatCurrency(cartVat)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-200 pt-2">
                      <span>Grand Total</span>
                      <span>{formatCurrency(cartGrandTotal)}</span>
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1 uppercase">Payment Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Credit Card', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPosPaymentMethod(mode)}
                          className={`py-1.5 text-xs font-semibold rounded border transition-all ${
                            posPaymentMethod === mode
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    id="btn-complete-pos-sale"
                    onClick={handleCompletePosSale}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Sale & Print Receipt ({formatCurrency(cartGrandTotal)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUOTATION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'quotation' && (
        <div className="space-y-6">
          {/* Quotation Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Quotations</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{quotations.length}</div>
              <p className="text-xs text-stone-400 mt-1">Active client proposals</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Quoted Pipeline Value</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(quotations.reduce((acc, q) => acc + q.grandTotal, 0))}
              </div>
              <p className="text-xs text-stone-400 mt-1">Total prospective revenue</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Approved Quotes</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {quotations.filter((q) => q.status === 'Approved' || q.status === 'Converted to Order').length}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Ready for production</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Draft Proposal</span>
                <div className="text-sm font-semibold text-stone-900 mt-1">Create Luxury Quote</div>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
              >
                + Create
              </button>
            </div>
          </div>

          {/* Quotations List */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-base font-bold text-stone-900">Bespoke Interior Quotations</h3>
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Quotation</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Quote #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4 text-right">Items</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-stone-900 text-xs">{q.quoteNumber}</td>
                      <td className="py-3 px-4 font-medium text-stone-800">{q.customerName}</td>
                      <td className="py-3 px-4 text-stone-600 text-xs">{q.projectTitle}</td>
                      <td className="py-3 px-4 text-xs text-stone-500">{formatDate(q.date)}</td>
                      <td className="py-3 px-4 text-xs text-stone-500">{formatDate(q.validUntil)}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs">{q.items.length}</td>
                      <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(q.grandTotal)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(q.status)}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`view-quote-${q.id}`}
                            onClick={() => {
                              if (onPrintQuotation) onPrintQuotation(q);
                              else setPreviewQuotation(q);
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold transition-colors"
                          >
                            Print
                          </button>
                          {q.status !== 'Converted to Order' && (
                            <button
                              id={`convert-quote-${q.id}`}
                              onClick={() => convertQuoteToOrder(q.id)}
                              className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold transition-colors"
                            >
                              Convert to Order
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INVOICE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'invoice' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Invoiced</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(invoices.reduce((a, b) => a + b.grandTotal, 0))}
              </div>
              <p className="text-xs text-stone-400 mt-1">{invoices.length} invoices generated</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Collected</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(invoices.reduce((a, b) => a + b.amountPaid, 0))}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Settled payments</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
              <span className="text-xs font-medium text-blue-800 uppercase tracking-wider">Outstanding Due</span>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {formatCurrency(invoices.reduce((a, b) => a + (b.grandTotal - b.amountPaid), 0))}
              </div>
              <p className="text-xs text-blue-700 mt-1">Pending collection</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Unpaid Invoices</span>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {invoices.filter((i) => i.paymentStatus === 'Unpaid').length}
              </div>
              <p className="text-xs text-stone-400 mt-1">Requires follow up</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-base font-bold text-stone-900">Tax Invoices Register</h3>
              <span className="text-xs text-stone-500 font-medium">{invoices.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {invoices.map((inv) => {
                    const balance = inv.grandTotal - inv.amountPaid;
                    return (
                      <tr key={inv.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-stone-900 text-xs">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 font-medium text-stone-800">{inv.customerName}</td>
                        <td className="py-3 px-4 text-xs text-stone-500">{formatDate(inv.date)}</td>
                        <td className="py-3 px-4 text-xs text-stone-500">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-stone-600">{formatCurrency(inv.subtotal)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(inv.grandTotal)}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-700">{formatCurrency(inv.amountPaid)}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {balance > 0 ? (
                            <span className="text-amber-700">{formatCurrency(balance)}</span>
                          ) : (
                            <span className="text-stone-400">$0.00</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(inv.paymentStatus)}`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`print-inv-${inv.id}`}
                              onClick={() => {
                                if (onPrintInvoice) onPrintInvoice(inv);
                                else setPreviewInvoice(inv);
                              }}
                              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold transition-colors"
                            >
                              Print
                            </button>
                            {balance > 0 && (
                              <button
                                id={`pay-inv-${inv.id}`}
                                onClick={() => {
                                  setSettleInvoiceModal(inv);
                                  setSettlePaymentAmount(balance);
                                }}
                                className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold transition-colors"
                              >
                                Record Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER DATABASE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customers by name, company, phone, email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Company / Entity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">City / Area</th>
                    <th className="py-3 px-4 text-right">Lifetime Spend</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {customers
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.phone.includes(customerSearch) ||
                        (c.companyName && c.companyName.toLowerCase().includes(customerSearch.toLowerCase()))
                    )
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">{cust.name}</td>
                        <td className="py-3 px-4 text-stone-600">{cust.companyName || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-800">
                            {cust.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-700 font-medium">{cust.phone}</td>
                        <td className="py-3 px-4 text-stone-500">{cust.email}</td>
                        <td className="py-3 px-4 text-stone-600">{cust.city}</td>
                        <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(cust.totalSpent)}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {cust.outstandingBalance > 0 ? (
                            <span className="text-amber-700">{formatCurrency(cust.outstandingBalance)}</span>
                          ) : (
                            <span className="text-stone-400">$0.00</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EMPLOYEE ATTENDANCE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase">Attendance Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800"
              />
            </div>
            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Staff Attendance</span>
            </button>
          </div>

          {/* Attendance Cards KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Present in Showroom</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {attendance.filter((a) => a.status === 'Present').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">On-Site Client Visits</span>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {attendance.filter((a) => a.status === 'On-Site').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">On Leave / Half Day</span>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {attendance.filter((a) => a.status === 'Leave' || a.status === 'Half Day').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Total Logged Overtime</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)} hrs
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50/50">
              <h3 className="text-sm font-bold text-stone-900">Attendance Register</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4 text-center">Overtime Hours</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Notes / Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-stone-50/80">
                      <td className="py-3 px-4 font-bold text-stone-900">{rec.employeeName}</td>
                      <td className="py-3 px-4 text-stone-500">{formatDate(rec.date)}</td>
                      <td className="py-3 px-4 font-mono">{rec.checkIn}</td>
                      <td className="py-3 px-4 font-mono">{rec.checkOut}</td>
                      <td className="py-3 px-4 text-center font-bold text-stone-800">{rec.overtimeHours || 0} hrs</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'On-Site' ? 'bg-blue-100 text-blue-800' :
                          rec.status === 'Leave' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 truncate max-w-xs">{rec.notes || 'Normal Showroom Shift'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SALARY / PAYROLL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600 uppercase">Payroll Month:</span>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>
            <button
              onClick={() => processPayroll(payrollMonth)}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Process Monthly Payroll</span>
            </button>
          </div>

          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Total Net Payroll</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalPayrollAmount)}</div>
              <p className="text-xs text-stone-400 mt-1">Disbursed to staff bank accounts</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Base Salary Total</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(payroll.reduce((a, b) => a + b.baseSalary, 0))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Sales Commissions</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(payroll.reduce((a, b) => a + (b.salesCommission || 0), 0))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Employees on Payroll</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{employees.length} Staff</div>
            </div>
          </div>

          {/* Payroll Register Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Payroll Register - {payrollMonth}</h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Payslips</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4 text-right">Base Salary</th>
                    <th className="py-3 px-4 text-right">Allowances</th>
                    <th className="py-3 px-4 text-right">Overtime</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-right">Deductions</th>
                    <th className="py-3 px-4 text-right">Net Pay</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {payroll.map((pay) => (
                    <tr key={pay.id} className="hover:bg-stone-50/80">
                      <td className="py-3 px-4 font-bold text-stone-900">{pay.employeeName}</td>
                      <td className="py-3 px-4 text-stone-600">{pay.designation}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(pay.baseSalary)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(pay.allowances)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatCurrency(pay.overtimePay)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatCurrency(pay.salesCommission)}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">({formatCurrency(pay.deductions)})</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(pay.netPay)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. COMMISSION / INCENTIVES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          {/* Commission Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Total Incentive Pool</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalCommissionPool)}</div>
              <p className="text-xs text-stone-400 mt-1">Earned this cycle</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Top Performer</span>
              <div className="text-xl font-bold text-emerald-800 mt-1">Elena Rostova</div>
              <p className="text-xs text-emerald-600 mt-1">140% Quota Attainment</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Average Target Attainment</span>
              <div className="text-xl font-bold text-blue-800 mt-1">124%</div>
              <p className="text-xs text-blue-600 mt-1">Across design & sales consultants</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase">Commission Model</span>
              <div className="text-xl font-bold text-stone-900 mt-1">2.0% - 2.5%</div>
              <p className="text-xs text-stone-400 mt-1">+ Milestone completion bonuses</p>
            </div>
          </div>

          {/* Commission Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Sales Consultant & Designer Incentive Roster</h3>
                <p className="text-xs text-stone-500">Transparent performance commission tracking and payout approvals</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Consultant / Designer</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Sales Target</th>
                    <th className="py-3 px-4 text-right">Achieved Sales</th>
                    <th className="py-3 px-4 text-center">Attainment</th>
                    <th className="py-3 px-4 text-right">Commission Rate</th>
                    <th className="py-3 px-4 text-right">Incentive ($)</th>
                    <th className="py-3 px-4 text-right">Bonus ($)</th>
                    <th className="py-3 px-4 text-right">Total Payout</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{c.employeeName}</td>
                      <td className="py-3 px-4 text-stone-600">{c.role}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(c.salesTarget)}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-stone-900">{formatCurrency(c.achievedSales)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.targetPercent >= 120 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {c.targetPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{c.commissionRate}%</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatCurrency(c.incentiveAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-700">+{formatCurrency(c.bonusAmount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(c.totalCommission)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {c.status === 'Pending Review' ? (
                          <button
                            id={`approve-comm-${c.id}`}
                            onClick={() => updateCommissionStatus(c.id, 'Approved')}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold"
                          >
                            Approve
                          </button>
                        ) : c.status === 'Approved' ? (
                          <button
                            id={`pay-comm-${c.id}`}
                            onClick={() => updateCommissionStatus(c.id, 'Paid')}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Disbursed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Create Quotation */}
      {/* ========================================================================= */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Create Bespoke Quotation</h3>
                <p className="text-xs text-stone-500">Draft luxury furniture proposal with custom items and specs</p>
              </div>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Customer</label>
                  <select
                    value={quoteCustomerId}
                    onChange={(e) => setQuoteCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Project / Quote Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Palm Jumeirah Signature Villa Living Room"
                    value={quoteProjectTitle}
                    onChange={(e) => setQuoteProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Project Site Address</label>
                <input
                  type="text"
                  placeholder="e.g. Villa 14, Frond N, Palm Jumeirah, Dubai"
                  value={quoteAddress}
                  onChange={(e) => setQuoteAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Items */}
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 uppercase">Quotation Items</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuoteItems((prev) => [
                        ...prev,
                        { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sellingPrice || 1000, discount: 0 },
                      ])
                    }
                    className="text-xs font-semibold text-stone-900 hover:underline"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const pr = products.find((p) => p.id === pId);
                            setQuoteItems((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, productId: pId, unitPrice: pr?.sellingPrice || 1000 } : it
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatCurrency(p.sellingPrice)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setQuoteItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)));
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const pr = Number(e.target.value);
                            setQuoteItems((prev) => prev.map((it, i) => (i === idx ? { ...it, unitPrice: pr } : it)));
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => setQuoteItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {quoteItems.length === 0 && (
                    <div className="text-center py-4 text-stone-400 text-xs">
                      Click "+ Add Product" to add items to this quotation.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quoteItems.length === 0}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                >
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Record Invoice Payment */}
      {/* ========================================================================= */}
      {settleInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Record Invoice Payment</h3>
                <p className="text-xs text-stone-500">{settleInvoiceModal.invoiceNumber} • {settleInvoiceModal.customerName}</p>
              </div>
              <button onClick={() => setSettleInvoiceModal(null)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleInvoicePayment} className="mt-4 space-y-4">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Invoice Total:</span>
                  <span className="font-semibold text-stone-900">{formatCurrency(settleInvoiceModal.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Already Received:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(settleInvoiceModal.amountPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1 font-bold">
                  <span className="text-stone-800">Remaining Due:</span>
                  <span className="text-blue-800">
                    {formatCurrency(settleInvoiceModal.grandTotal - settleInvoiceModal.amountPaid)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Receipt Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max={settleInvoiceModal.grandTotal - settleInvoiceModal.amountPaid}
                  value={settlePaymentAmount}
                  onChange={(e) => setSettlePaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={settlePaymentMode}
                  onChange={(e) => setSettlePaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                >
                  <option value="Credit Card">Credit Card (POS Terminal)</option>
                  <option value="Bank Transfer">Bank Wire / Swift</option>
                  <option value="Cash">Cash (Showroom Vault)</option>
                  <option value="Cheque">Corporate Cheque</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSettleInvoiceModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add Customer */}
      {/* ========================================================================= */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Add New Customer</h3>
                <p className="text-xs text-stone-500">Register residential client or corporate partner</p>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={newCustomer.companyName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Category</label>
                  <select
                    value={newCustomer.type}
                    onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Residential">Residential Client</option>
                    <option value="Commercial / Corporate">Commercial / Corporate</option>
                    <option value="Architect / Designer">Architect / Interior Designer</option>
                    <option value="Retail Client">Retail Walk-in</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / Emirate</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Mark Employee Attendance */}
      {/* ========================================================================= */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Mark Staff Attendance</h3>
                <p className="text-xs text-stone-500">Log daily check-in, check-out or on-site status</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Staff Member</label>
                <select
                  value={newAttendanceRecord.employeeId}
                  onChange={(e) => setNewAttendanceRecord({ ...newAttendanceRecord, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Attendance Status</label>
                <select
                  value={newAttendanceRecord.status}
                  onChange={(e) =>
                    setNewAttendanceRecord({ ...newAttendanceRecord, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                >
                  <option value="Present">Present (Showroom)</option>
                  <option value="On-Site">On-Site (Client Villa / Measurement)</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave / Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Clock In</label>
                  <input
                    type="time"
                    value={newAttendanceRecord.checkIn}
                    onChange={(e) => setNewAttendanceRecord({ ...newAttendanceRecord, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Clock Out</label>
                  <input
                    type="time"
                    value={newAttendanceRecord.checkOut}
                    onChange={(e) => setNewAttendanceRecord({ ...newAttendanceRecord, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Overtime Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newAttendanceRecord.overtimeHours}
                  onChange={(e) =>
                    setNewAttendanceRecord({ ...newAttendanceRecord, overtimeHours: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POS Receipt Preview */}
      {/* ========================================================================= */}
      {recentPosReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-pos-receipt, #printable-pos-receipt * { visibility: visible; }
              #printable-pos-receipt { position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; }
              /* Hide the close/print buttons during print */
              .receipt-actions { display: none !important; }
            }
          `}</style>
          <div id="printable-pos-receipt" className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-center font-mono print:border-none print:shadow-none print:p-2">
            <div className="border-b border-stone-300 pb-3">
              <h2 className="text-base font-bold text-stone-900 tracking-wider">LIVO LUXURY LIVING</h2>
              <p className="text-[11px] text-stone-500">Dubai Design District, Building 4</p>
              <p className="text-[10px] text-stone-400">TRN: 100489201900003</p>
            </div>

            <div className="py-3 border-b border-dashed border-stone-300 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{recentPosReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(recentPosReceipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">{recentPosReceipt.customerName}</span>
              </div>
            </div>

            <div className="py-3 border-b border-dashed border-stone-300 text-xs text-left space-y-2 max-h-48 overflow-y-auto">
              {recentPosReceipt.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div>{it.name}</div>
                    <div className="text-[10px] text-stone-500">
                      {it.quantity} x {formatCurrency(it.unitPrice)}
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(it.taxableAmount)}</span>
                </div>
              ))}
            </div>

            <div className="py-3 text-xs text-left space-y-1 border-b border-stone-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(recentPosReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%):</span>
                <span>{formatCurrency(recentPosReceipt.vatTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-200">
                <span>TOTAL PAID:</span>
                <span>{formatCurrency(recentPosReceipt.grandTotal)}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-2 receipt-actions">
              <button
                onClick={() => setRecentPosReceipt(null)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg font-sans"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg font-sans flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Simple Quotation Preview (fallback) */}
      {/* ========================================================================= */}
      {previewQuotation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200">
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Quotation {previewQuotation.quoteNumber}</h3>
                <p className="text-xs text-stone-500">{previewQuotation.projectTitle} • {previewQuotation.customerName}</p>
              </div>
              <button onClick={() => setPreviewQuotation(null)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>
            <div className="py-4 space-y-2 text-xs divide-y divide-stone-100">
              {previewQuotation.items.map((it, idx) => (
                <div key={idx} className="pt-2 flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono font-bold">{formatCurrency(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between font-bold text-sm">
              <span>Grand Total (incl 5% VAT):</span>
              <span>{formatCurrency(previewQuotation.grandTotal)}</span>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPreviewQuotation(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
              >
                Print PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Simple Invoice Preview (fallback) */}
      {/* ========================================================================= */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200">
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Invoice {previewInvoice.invoiceNumber}</h3>
                <p className="text-xs text-stone-500">{previewInvoice.customerName} • {formatDate(previewInvoice.date)}</p>
              </div>
              <button onClick={() => setPreviewInvoice(null)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>
            <div className="py-4 space-y-2 text-xs divide-y divide-stone-100">
              {previewInvoice.items.map((it, idx) => (
                <div key={idx} className="pt-2 flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono font-bold">{formatCurrency(it.taxableAmount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(previewInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>VAT (5%):</span>
                <span className="font-mono">{formatCurrency(previewInvoice.vatTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                <span>Grand Total:</span>
                <span>{formatCurrency(previewInvoice.grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
              >
                Print PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
