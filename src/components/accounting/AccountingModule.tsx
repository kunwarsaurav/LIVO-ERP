import React, { useState } from 'react';
import {
  Receipt,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Building,
  CreditCard,
  FileSpreadsheet,
  PieChart,
  ShoppingBag,
  Users,
  Clock,
  Printer,
  ChevronRight,
  AlertTriangle,
  ArrowRightLeft,
  Search,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import { Expense, PurchaseBill } from '../../types';

export const AccountingModule: React.FC = () => {
  const {
    invoices,
    purchases,
    expenses,
    transactions,
    customers,
    suppliers,
    totalReceivables,
    totalPayables,
    addExpense,
    addPurchaseBill,
    recordPurchasePayment,
    recordInvoicePayment,
  } = useERP();

  // Exactly matching user's requested 8 Accounting sections
  const [activeTab, setActiveTab] = useState<
    'purchase' | 'sales' | 'expenses' | 'ledger' | 'receivables-payables' | 'cash-bank' | 'pl' | 'vat'
  >('purchase');

  // Purchase Bill Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [newPurchaseSupplierId, setNewPurchaseSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseBillDate, setPurchaseBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseDueDate, setPurchaseDueDate] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([
    { itemName: '', sku: '', quantity: 1, unitCost: 0, total: 0 },
  ]);
  const [purchaseAmountPaid, setPurchaseAmountPaid] = useState<number>(0);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState('Bank Transfer');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'date'>>({
    category: 'Marketing & Photography',
    description: '',
    amount: 1200,
    vatPaid: 60,
    account: 'Bank - Emirates NBD',
    paidTo: '',
    referenceNo: `EXP-${Date.now().toString().slice(-4)}`,
    status: 'Paid',
  });

  // Pay Bill / Receive Payment Quick Modal
  const [settlePurchaseModal, setSettlePurchaseModal] = useState<PurchaseBill | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  // Customer / Supplier Ledger state
  const [ledgerType, setLedgerType] = useState<'customer' | 'supplier'>('customer');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');

  // Cash / Bank state
  const [bankAccounts, setBankAccounts] = useState([
    { id: 'enbd', name: 'Emirates NBD Primary Corporate Checking', type: 'Checking', balance: 285450, currency: 'USD' },
    { id: 'hdfc', name: 'HDFC Current Account (Foreign Procurement)', type: 'Trade Current', balance: 74200, currency: 'USD' },
    { id: 'vault', name: 'Showroom Cash Vault (Immediate Cash)', type: 'Cash Safe', balance: 14800, currency: 'USD' },
    { id: 'petty', name: 'Site Installation Petty Cash Float', type: 'Petty Cash', balance: 2800, currency: 'USD' },
  ]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState('vault');
  const [transferTo, setTransferTo] = useState('enbd');
  const [transferAmount, setTransferAmount] = useState<number>(5000);

  // Financial Calculations
  const totalPurchasesCost = purchases.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalPurchasesPaid = purchases.reduce((acc, p) => acc + p.amountPaid, 0);

  const totalSalesRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalSalesTaxable = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalSalesCollected = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);

  const totalOperatingExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const cogsEstimated = totalPurchasesCost > 0 ? totalPurchasesCost * 0.75 : totalSalesRevenue * 0.52;
  const grossProfit = totalSalesRevenue - cogsEstimated;
  const grossMarginPct = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0';
  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netMarginPct = totalSalesRevenue > 0 ? ((netOperatingProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  // VAT calculations (5% UAE Standard VAT)
  const outputVatCollected = invoices.reduce((acc, inv) => acc + inv.vatTotal, 0);
  const inputVatPurchases = purchases.reduce((acc, p) => acc + p.vatAmount, 0);
  const inputVatExpenses = expenses.reduce((acc, exp) => acc + exp.vatPaid, 0);
  const totalInputVat = inputVatPurchases + inputVatExpenses;
  const netVatPayable = outputVatCollected - totalInputVat;

  const totalLiquidity = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  // Save new purchase bill
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPurchaseSupplierId);
    if (!sup) return;

    const subtotal = purchaseItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    const vatAmount = Number((subtotal * 0.05).toFixed(2));
    const grandTotal = subtotal + vatAmount;
    const paid = Math.min(grandTotal, Number(purchaseAmountPaid));
    const status = paid >= grandTotal ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

    addPurchaseBill({
      supplierId: sup.id,
      supplierName: sup.name,
      billDate: purchaseBillDate,
      dueDate: purchaseDueDate || purchaseBillDate,
      items: purchaseItems.map((item) => ({
        ...item,
        total: item.quantity * item.unitCost,
      })),
      subtotal,
      vatAmount,
      grandTotal,
      amountPaid: paid,
      paymentStatus: status,
      paymentMethod: purchasePaymentMethod,
      notes: purchaseNotes,
    });

    setIsPurchaseModalOpen(false);
    setPurchaseItems([{ itemName: '', sku: '', quantity: 1, unitCost: 0, total: 0 }]);
    setPurchaseAmountPaid(0);
    setPurchaseNotes('');
  };

  // Save new expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.paidTo || newExpense.amount <= 0) return;

    addExpense({
      ...newExpense,
      amount: Number(newExpense.amount),
      vatPaid: Number(newExpense.vatPaid),
    });

    setIsExpenseModalOpen(false);
    setNewExpense({
      category: 'Marketing & Photography',
      description: '',
      amount: 1000,
      vatPaid: 50,
      account: 'Bank - Emirates NBD',
      paidTo: '',
      referenceNo: `EXP-${Date.now().toString().slice(-4)}`,
      status: 'Paid',
    });
  };

  // Settle purchase bill
  const handleSettlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlePurchaseModal || settleAmount <= 0) return;
    recordPurchasePayment(settlePurchaseModal.id, settleAmount);
    setSettlePurchaseModal(null);
    setSettleAmount(0);
  };

  // Handle bank transfer
  const handleTransferFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo || transferAmount <= 0) return;

    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferFrom) {
          return { ...acc, balance: Math.max(0, acc.balance - transferAmount) };
        }
        if (acc.id === transferTo) {
          return { ...acc, balance: acc.balance + transferAmount };
        }
        return acc;
      })
    );
    setIsTransferModalOpen(false);
  };

  // Selected party for ledger
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  // Customer ledger items
  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === selectedCustomer?.id || inv.customerName === selectedCustomer?.name
  );

  // Supplier ledger items
  const supplierBills = purchases.filter(
    (p) => p.supplierId === selectedSupplier?.id || p.supplierName === selectedSupplier?.name
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-stone-900 text-stone-100">
              Module 3
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Accounting & Financials</h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Complete financial management: Purchase, Sales, Expenses, Ledgers, Cash/Bank, P&L, and VAT Reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="accounting-btn-new-purchase"
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-stone-100 rounded-lg hover:bg-stone-800 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Purchase</span>
          </button>
          <button
            id="accounting-btn-new-expense"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 border border-stone-300 text-stone-800 rounded-lg hover:bg-stone-200 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 8 Direct Navigation Tabs matching User Request */}
      <div className="flex overflow-x-auto border-b border-stone-200 gap-1 pb-1 scrollbar-thin">
        {[
          { id: 'purchase', label: 'Purchase', badge: purchases.length },
          { id: 'sales', label: 'Sales', badge: invoices.length },
          { id: 'expenses', label: 'Expenses', badge: expenses.length },
          { id: 'ledger', label: 'Customer / Supplier Ledger' },
          {
            id: 'receivables-payables',
            label: 'Receivables / Payables',
            badge: totalPayables > 0 || totalReceivables > 0 ? 'Active' : null,
          },
          { id: 'cash-bank', label: 'Cash / Bank', badge: formatCurrency(totalLiquidity) },
          { id: 'pl', label: 'Profit & Loss' },
          { id: 'vat', label: 'VAT / Tax Reports', badge: '5% Standard' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`accounting-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs md:text-sm font-semibold whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-stone-900 text-stone-900 bg-stone-100/80 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
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
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. PURCHASE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'purchase' && (
        <div className="space-y-6">
          {/* Purchase Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Purchases</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalPurchasesCost)}</div>
              <p className="text-xs text-stone-400 mt-1">{purchases.length} supplier bills recorded</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Paid to Suppliers</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalPurchasesPaid)}</div>
              <p className="text-xs text-emerald-600 mt-1">Cleared via Bank Transfer / LC</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
              <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">Outstanding Payables</span>
              <div className="text-xl font-bold text-amber-900 mt-1">{formatCurrency(totalPayables)}</div>
              <p className="text-xs text-amber-700 mt-1">Pending vendor settlement</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Input VAT on Purchases</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(inputVatPurchases)}</div>
              <p className="text-xs text-stone-400 mt-1">5% Recoverable Tax Credit</p>
            </div>
          </div>

          {/* Purchases List Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
              <div>
                <h3 className="text-base font-bold text-stone-900">Purchase Bills Register</h3>
                <p className="text-xs text-stone-500">Inbound procurement bills from furniture artisans and hardware manufacturers</p>
              </div>
              <button
                id="purchase-table-record-btn"
                onClick={() => setIsPurchaseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Bill</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Supplier / Vendor</th>
                    <th className="py-3 px-4">Bill Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Items / Details</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {purchases.map((bill) => {
                    const balance = bill.grandTotal - bill.amountPaid;
                    return (
                      <tr key={bill.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-stone-900 text-xs">{bill.billNumber}</td>
                        <td className="py-3 px-4 font-medium text-stone-800">{bill.supplierName}</td>
                        <td className="py-3 px-4 text-xs text-stone-500">{formatDate(bill.billDate)}</td>
                        <td className="py-3 px-4 text-xs text-stone-500">{formatDate(bill.dueDate)}</td>
                        <td className="py-3 px-4 text-xs text-stone-600 max-w-xs truncate">
                          {bill.items.map((it) => `${it.quantity}x ${it.itemName}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(bill.grandTotal)}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-700">{formatCurrency(bill.amountPaid)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-800">
                          {balance > 0 ? (
                            <span className="text-amber-700">{formatCurrency(balance)}</span>
                          ) : (
                            <span className="text-stone-400">$0.00</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(bill.paymentStatus)}`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {balance > 0 ? (
                            <button
                              id={`settle-bill-${bill.id}`}
                              onClick={() => {
                                setSettlePurchaseModal(bill);
                                setSettleAmount(balance);
                              }}
                              className="text-xs px-2.5 py-1 bg-stone-900 text-white rounded font-medium hover:bg-stone-800 transition-colors"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          )}
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
      {/* 2. SALES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sales Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Gross Sales Revenue</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalSalesRevenue)}</div>
              <p className="text-xs text-stone-400 mt-1">{invoices.length} invoices generated</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Cash & Bank Collected</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalSalesCollected)}</div>
              <p className="text-xs text-emerald-600 mt-1">Realized into accounts</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
              <span className="text-xs font-medium text-blue-800 uppercase tracking-wider">Outstanding Receivables</span>
              <div className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(totalReceivables)}</div>
              <p className="text-xs text-blue-700 mt-1">Uncollected client balances</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Output VAT on Sales</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(outputVatCollected)}</div>
              <p className="text-xs text-stone-400 mt-1">5% Standard Rate</p>
            </div>
          </div>

          {/* Sales Invoices Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
              <div>
                <h3 className="text-base font-bold text-stone-900">Sales Invoices & Transactions</h3>
                <p className="text-xs text-stone-500">Itemized sales records, customer billing, and settlement status</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">VAT (5%)</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Payment Mode</th>
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
                        <td className="py-3 px-4 text-xs">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200">
                            {inv.invoiceType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-stone-600">{formatCurrency(inv.subtotal)}</td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-stone-600">{formatCurrency(inv.vatTotal)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(inv.grandTotal)}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-700">{formatCurrency(inv.amountPaid)}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {balance > 0 ? (
                            <span className="text-blue-700">{formatCurrency(balance)}</span>
                          ) : (
                            <span className="text-stone-400">$0.00</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(inv.paymentStatus)}`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-stone-600 font-medium">
                          {inv.paymentMethod || 'Credit Card / Wire'}
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
      {/* 3. EXPENSES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Operating Expenses</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalOperatingExpenses)}</div>
              <p className="text-xs text-stone-400 mt-1">{expenses.length} vouchers logged</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Input VAT on Expenses</span>
              <div className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(inputVatExpenses)}</div>
              <p className="text-xs text-stone-400 mt-1">Claimable tax offset</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Largest Expense Category</span>
              <div className="text-xl font-bold text-stone-900 mt-1">Showroom Rent</div>
              <p className="text-xs text-stone-400 mt-1">$35,000 / month prime facility</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Record New</span>
                <div className="text-sm font-semibold text-stone-800 mt-1">Operating Voucher</div>
              </div>
              <button
                id="expense-btn-add"
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-base font-bold text-stone-900">Expenses Log</h3>
              <span className="text-xs text-stone-500 font-medium">{expenses.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Paid To</th>
                    <th className="py-3 px-4">Account Paid From</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">VAT Paid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs text-stone-500">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 font-mono text-xs font-medium text-stone-800">{exp.referenceNo}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-900 font-medium text-xs">{exp.description}</td>
                      <td className="py-3 px-4 text-xs text-stone-600">{exp.paidTo}</td>
                      <td className="py-3 px-4 text-xs text-stone-500">{exp.account}</td>
                      <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(exp.amount)}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-stone-600">{formatCurrency(exp.vatPaid)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {exp.status}
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
      {/* 4. CUSTOMER / SUPPLIER LEDGER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Toggle Customer vs Supplier */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Ledger Book:</span>
              <div className="flex bg-stone-100 p-1 rounded-lg">
                <button
                  id="ledger-toggle-customer"
                  onClick={() => setLedgerType('customer')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    ledgerType === 'customer' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Customer Ledger
                </button>
                <button
                  id="ledger-toggle-supplier"
                  onClick={() => setLedgerType('supplier')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    ledgerType === 'supplier' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Supplier Ledger
                </button>
              </div>
            </div>

            {/* Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Select Account:</span>
              {ledgerType === 'customer' ? (
                <select
                  id="ledger-customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  id="ledger-supplier-select"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Party Account Card */}
          <div className="bg-stone-900 text-stone-100 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                {ledgerType === 'customer' ? 'Customer Account Statement' : 'Supplier Account Statement'}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {ledgerType === 'customer' ? selectedCustomer?.name : selectedSupplier?.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-stone-300 mt-2">
                <span>Phone: {ledgerType === 'customer' ? selectedCustomer?.phone : selectedSupplier?.phone}</span>
                <span>Email: {ledgerType === 'customer' ? selectedCustomer?.email : selectedSupplier?.email}</span>
                <span>TRN/Tax: {ledgerType === 'customer' ? selectedCustomer?.taxNumber || 'Non-Taxable' : selectedSupplier?.taxVatNumber}</span>
              </div>
            </div>

            <div className="flex gap-6 bg-stone-800/80 px-4 py-3 rounded-lg border border-stone-700">
              <div>
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Invoiced / Billed</span>
                <div className="text-base font-bold text-stone-100">
                  {formatCurrency(
                    ledgerType === 'customer'
                      ? customerInvoices.reduce((a, b) => a + b.grandTotal, 0)
                      : supplierBills.reduce((a, b) => a + b.grandTotal, 0)
                  )}
                </div>
              </div>
              <div className="border-l border-stone-700 pl-6">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Net Balance</span>
                <div className="text-base font-bold text-amber-400">
                  {formatCurrency(
                    ledgerType === 'customer'
                      ? customerInvoices.reduce((a, b) => a + (b.grandTotal - b.amountPaid), 0)
                      : supplierBills.reduce((a, b) => a + (b.grandTotal - b.amountPaid), 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Ledger Transactions Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-sm font-bold text-stone-900">Ledger Entries & Running Balance</h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference No</th>
                    <th className="py-3 px-4">Description / Narration</th>
                    <th className="py-3 px-4 text-right">Debit (+)</th>
                    <th className="py-3 px-4 text-right">Credit (-)</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {ledgerType === 'customer' ? (
                    customerInvoices.length > 0 ? (
                      customerInvoices.map((inv, idx) => {
                        const bal = inv.grandTotal - inv.amountPaid;
                        return (
                          <React.Fragment key={inv.id}>
                            {/* Invoice Debit Entry */}
                            <tr className="hover:bg-stone-50/80">
                              <td className="py-3 px-4 text-stone-500">{formatDate(inv.date)}</td>
                              <td className="py-3 px-4 font-mono font-medium text-stone-900">{inv.invoiceNumber}</td>
                              <td className="py-3 px-4 text-stone-800">
                                Sales Invoice - {inv.items.map((i) => i.name).join(', ')}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(inv.grandTotal)}</td>
                              <td className="py-3 px-4 text-right text-stone-400">-</td>
                              <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(inv.grandTotal)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(inv.paymentStatus)}`}>
                                  {inv.paymentStatus}
                                </span>
                              </td>
                            </tr>
                            {/* Payment Credit Entry if paid */}
                            {inv.amountPaid > 0 && (
                              <tr className="bg-emerald-50/30 hover:bg-emerald-50/60">
                                <td className="py-3 px-4 text-stone-500">{formatDate(inv.date)}</td>
                                <td className="py-3 px-4 font-mono text-emerald-800">RCPT-{inv.invoiceNumber.slice(-4)}</td>
                                <td className="py-3 px-4 text-emerald-900 font-medium">
                                  Payment received ({inv.paymentMethod || 'Wire/Card'})
                                </td>
                                <td className="py-3 px-4 text-right text-stone-400">-</td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-700">{formatCurrency(inv.amountPaid)}</td>
                                <td className="py-3 px-4 text-right font-bold text-stone-800">{formatCurrency(bal)}</td>
                                <td className="py-3 px-4 text-center text-emerald-700 font-semibold text-[10px]">Settled</td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                          No transactions found for this customer.
                        </td>
                      </tr>
                    )
                  ) : (
                    supplierBills.length > 0 ? (
                      supplierBills.map((bill) => {
                        const bal = bill.grandTotal - bill.amountPaid;
                        return (
                          <React.Fragment key={bill.id}>
                            <tr className="hover:bg-stone-50/80">
                              <td className="py-3 px-4 text-stone-500">{formatDate(bill.billDate)}</td>
                              <td className="py-3 px-4 font-mono font-medium text-stone-900">{bill.billNumber}</td>
                              <td className="py-3 px-4 text-stone-800">
                                Purchase Bill - {bill.items.map((i) => i.itemName).join(', ')}
                              </td>
                              <td className="py-3 px-4 text-right text-stone-400">-</td>
                              <td className="py-3 px-4 text-right font-semibold text-stone-900">{formatCurrency(bill.grandTotal)}</td>
                              <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(bill.grandTotal)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(bill.paymentStatus)}`}>
                                  {bill.paymentStatus}
                                </span>
                              </td>
                            </tr>
                            {bill.amountPaid > 0 && (
                              <tr className="bg-emerald-50/30 hover:bg-emerald-50/60">
                                <td className="py-3 px-4 text-stone-500">{formatDate(bill.billDate)}</td>
                                <td className="py-3 px-4 font-mono text-emerald-800">PMT-{bill.billNumber.slice(-4)}</td>
                                <td className="py-3 px-4 text-emerald-900 font-medium">
                                  Disbursed via {bill.paymentMethod || 'Bank Wire'}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-700">{formatCurrency(bill.amountPaid)}</td>
                                <td className="py-3 px-4 text-right text-stone-400">-</td>
                                <td className="py-3 px-4 text-right font-bold text-stone-800">{formatCurrency(bal)}</td>
                                <td className="py-3 px-4 text-center text-emerald-700 font-semibold text-[10px]">Paid</td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                          No purchase bills found for this supplier.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RECEIVABLES / PAYABLES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'receivables-payables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accounts Receivable Panel */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-200 bg-blue-50/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                    Accounts Receivable (Customers Owe Us)
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5">Unpaid client invoices & project balances</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-800">Total Receivable</span>
                  <div className="text-lg font-bold text-blue-900">{formatCurrency(totalReceivables)}</div>
                </div>
              </div>

              <div className="divide-y divide-stone-200 flex-1 overflow-y-auto max-h-[420px]">
                {invoices
                  .filter((inv) => inv.grandTotal - inv.amountPaid > 0)
                  .map((inv) => {
                    const balance = inv.grandTotal - inv.amountPaid;
                    return (
                      <div key={inv.id} className="p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-stone-900">{inv.customerName}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Inv #{inv.invoiceNumber} • Due: {formatDate(inv.dueDate)}
                          </div>
                          <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                            Due {formatCurrency(balance)}
                          </span>
                        </div>
                        <button
                          id={`rcv-pay-${inv.id}`}
                          onClick={() => recordInvoicePayment(inv.id, balance, 'Bank Transfer')}
                          className="px-2.5 py-1 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-800 transition-colors"
                        >
                          Mark Paid
                        </button>
                      </div>
                    );
                  })}
                {invoices.filter((inv) => inv.grandTotal - inv.amountPaid > 0).length === 0 && (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    All client invoices are fully settled! Zero overdue receivables.
                  </div>
                )}
              </div>
            </div>

            {/* Accounts Payable Panel */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-200 bg-amber-50/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    Accounts Payable (We Owe Suppliers)
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">Supplier bills & overseas procurement dues</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-800">Total Payable</span>
                  <div className="text-lg font-bold text-amber-900">{formatCurrency(totalPayables)}</div>
                </div>
              </div>

              <div className="divide-y divide-stone-200 flex-1 overflow-y-auto max-h-[420px]">
                {purchases
                  .filter((p) => p.grandTotal - p.amountPaid > 0)
                  .map((bill) => {
                    const balance = bill.grandTotal - bill.amountPaid;
                    return (
                      <div key={bill.id} className="p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-stone-900">{bill.supplierName}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Bill #{bill.billNumber} • Due: {formatDate(bill.dueDate)}
                          </div>
                          <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded">
                            Due {formatCurrency(balance)}
                          </span>
                        </div>
                        <button
                          id={`pay-settle-${bill.id}`}
                          onClick={() => {
                            setSettlePurchaseModal(bill);
                            setSettleAmount(balance);
                          }}
                          className="px-2.5 py-1 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors"
                        >
                          Settle Bill
                        </button>
                      </div>
                    );
                  })}
                {purchases.filter((p) => p.grandTotal - p.amountPaid > 0).length === 0 && (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    All supplier bills are paid in full!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CASH / BANK TAB */}
      {/* ========================================================================= */}
      {activeTab === 'cash-bank' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-xs text-stone-500 uppercase font-semibold">Consolidated Liquidity</span>
              <div className="text-2xl font-bold text-stone-900 mt-0.5">{formatCurrency(totalLiquidity)}</div>
              <p className="text-xs text-stone-400">Total liquid reserves across commercial banks & showroom safe</p>
            </div>
            <button
              id="btn-transfer-funds"
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Internal Fund Transfer</span>
            </button>
          </div>

          {/* Bank Accounts Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{acc.type}</span>
                    <Building className="w-4 h-4 text-stone-400" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mt-2">{acc.name}</h4>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase">Available Balance</span>
                  <div className="text-lg font-bold text-emerald-800">{formatCurrency(acc.balance)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cash & Bank Transactions Register */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-base font-bold text-stone-900">Cash & Bank Movement History</h3>
              <span className="text-xs text-stone-500 font-medium">{transactions.length} movements recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/75 text-stone-700 font-semibold text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Party / Counterpart</th>
                    <th className="py-3 px-4">Account Used</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Debit Out (-)</th>
                    <th className="py-3 px-4 text-right">Credit In (+)</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 text-stone-500">{formatDate(tx.date)}</td>
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          tx.type === 'SALE' ? 'bg-emerald-100 text-emerald-800' :
                          tx.type === 'PURCHASE' ? 'bg-rose-100 text-rose-800' :
                          'bg-stone-100 text-stone-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900">{tx.partyName}</td>
                      <td className="py-3 px-4 text-stone-500">{tx.account}</td>
                      <td className="py-3 px-4 font-mono text-stone-700">{tx.referenceNo}</td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-700">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 truncate max-w-xs">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PROFIT & LOSS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'pl' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Profit & Loss Statement (Income Statement)</h3>
                <p className="text-xs text-stone-500">Period: Year-to-Date 2026 • Currency: USD</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold border border-stone-300 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export P&L Report</span>
              </button>
            </div>

            {/* Income Section */}
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <div className="flex items-center justify-between font-bold text-stone-900 py-2 border-b border-stone-300">
                  <span className="uppercase text-xs tracking-wider">1. Operating Revenue</span>
                  <span>{formatCurrency(totalSalesTaxable)}</span>
                </div>
                <div className="divide-y divide-stone-100 pl-4 text-xs text-stone-600 py-1">
                  <div className="flex justify-between py-1.5">
                    <span>Showroom Retail Sales & Direct Orders</span>
                    <span className="font-mono">{formatCurrency(totalSalesTaxable * 0.65)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Bespoke Luxury Interior Architectural Contracts</span>
                    <span className="font-mono">{formatCurrency(totalSalesTaxable * 0.35)}</span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div>
                <div className="flex items-center justify-between font-bold text-stone-900 py-2 border-b border-stone-300">
                  <span className="uppercase text-xs tracking-wider">2. Cost of Goods Sold (COGS)</span>
                  <span className="text-rose-700">({formatCurrency(cogsEstimated)})</span>
                </div>
                <div className="divide-y divide-stone-100 pl-4 text-xs text-stone-600 py-1">
                  <div className="flex justify-between py-1.5">
                    <span>Direct Material Procurement & Imports</span>
                    <span className="font-mono">{formatCurrency(cogsEstimated * 0.8)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Custom Woodwork & Fabrication Subcontracts</span>
                    <span className="font-mono">{formatCurrency(cogsEstimated * 0.2)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit Highlight */}
              <div className="flex items-center justify-between font-bold text-base bg-stone-100 p-3 rounded-lg border border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-stone-900">Gross Profit</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    {grossMarginPct}% Margin
                  </span>
                </div>
                <span className="text-emerald-800">{formatCurrency(grossProfit)}</span>
              </div>

              {/* Operating Expenses */}
              <div>
                <div className="flex items-center justify-between font-bold text-stone-900 py-2 border-b border-stone-300">
                  <span className="uppercase text-xs tracking-wider">3. Operating Expenses (OPEX)</span>
                  <span className="text-rose-700">({formatCurrency(totalOperatingExpenses)})</span>
                </div>
                <div className="divide-y divide-stone-100 pl-4 text-xs text-stone-600 py-1">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between py-1.5">
                      <span>{exp.category}: {exp.description}</span>
                      <span className="font-mono">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Profit Bottom Line */}
              <div className="flex items-center justify-between font-bold text-lg bg-emerald-900 text-white p-4 rounded-xl shadow-sm">
                <div>
                  <div>Net Operating Profit</div>
                  <div className="text-xs font-normal text-emerald-200">Net Profit Margin: {netMarginPct}%</div>
                </div>
                <span className="text-emerald-100 text-xl">{formatCurrency(netOperatingProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. VAT / TAX REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'vat' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-bold rounded">FTA COMPLIANT</span>
                  <h3 className="text-lg font-bold text-stone-900">VAT 201 Periodic Tax Return</h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">Standard 5% Value Added Tax Calculation</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download VAT Return</span>
              </button>
            </div>

            {/* VAT Breakdown Grid */}
            <div className="mt-6 space-y-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-3">VAT on Supplies (Output VAT - Collected)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">Box 1: Standard Rated Supplies (5% Furniture Sales)</span>
                    <div className="flex gap-6">
                      <span className="font-mono text-stone-700">Taxable: {formatCurrency(totalSalesTaxable)}</span>
                      <span className="font-mono font-bold text-stone-900">VAT: {formatCurrency(outputVatCollected)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-3">VAT on Expenses & Purchases (Input VAT - Claimable)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-600">Box 8: Standard Rated Expenses & Supplies Input VAT</span>
                    <div className="flex gap-6">
                      <span className="font-mono text-stone-700">
                        Taxable: {formatCurrency(totalPurchasesCost + totalOperatingExpenses)}
                      </span>
                      <span className="font-mono font-bold text-emerald-800">VAT: {formatCurrency(totalInputVat)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net VAT Calculation */}
              <div className="bg-stone-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-semibold text-stone-400">Box 12: Net Tax Payable to Tax Authority</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {formatCurrency(Math.max(0, netVatPayable))}
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1">Output VAT ({formatCurrency(outputVatCollected)}) minus Input VAT ({formatCurrency(totalInputVat)})</p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-semibold">
                  Status: Ready for Filing
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Record Purchase Bill */}
      {/* ========================================================================= */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Record Inbound Purchase Bill</h3>
                <p className="text-xs text-stone-500">Log incoming stock or raw material invoice from supplier</p>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Supplier</label>
                  <select
                    id="purchase-supplier-input"
                    value={newPurchaseSupplierId}
                    onChange={(e) => setNewPurchaseSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.paymentTerms})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Bill Date</label>
                    <input
                      id="purchase-bill-date"
                      type="date"
                      value={purchaseBillDate}
                      onChange={(e) => setPurchaseBillDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Due Date</label>
                    <input
                      id="purchase-due-date"
                      type="date"
                      value={purchaseDueDate}
                      onChange={(e) => setPurchaseDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Items in Bill */}
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 uppercase">Bill Line Items</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPurchaseItems((prev) => [
                        ...prev,
                        { itemName: '', sku: '', quantity: 1, unitCost: 0, total: 0 },
                      ])
                    }
                    className="text-xs font-semibold text-stone-900 hover:underline"
                  >
                    + Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          placeholder="Item Name / Description"
                          value={item.itemName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPurchaseItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, itemName: val } : it))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPurchaseItems((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, quantity: val, total: val * it.unitCost } : it
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-center"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Unit Cost ($)"
                          min="0"
                          value={item.unitCost || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPurchaseItems((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, unitCost: val, total: it.quantity * val } : it
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-right"
                          required
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {purchaseItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPurchaseItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Amount Paid Immediately</label>
                  <input
                    id="purchase-paid-amount"
                    type="number"
                    min="0"
                    value={purchaseAmountPaid}
                    onChange={(e) => setPurchaseAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={purchasePaymentMethod}
                    onChange={(e) => setPurchasePaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Bank Transfer">Bank Transfer (Swift)</option>
                    <option value="Letter of Credit">Letter of Credit (LC)</option>
                    <option value="Corporate Cheque">Corporate Cheque</option>
                    <option value="Cash">Cash Safe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Bill Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Container BL# MSKU892019 - Customs cleared"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Save Purchase Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Record Expense */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Record Operating Expense</h3>
                <p className="text-xs text-stone-500">Log showroom rent, utilities, marketing or maintenance</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                >
                  <option value="Showroom Rent">Showroom Rent</option>
                  <option value="Warehouse Utilities">Warehouse Utilities</option>
                  <option value="Staff Travel & Logistics">Staff Travel & Logistics</option>
                  <option value="Marketing & Photography">Marketing & Photography</option>
                  <option value="Installation Tools">Installation Tools & Fasteners</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Maintenance">Facility Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Architectural photography for Palm Jumeirah project"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={newExpense.amount}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      setNewExpense({
                        ...newExpense,
                        amount: amt,
                        vatPaid: Number((amt * 0.05).toFixed(2)),
                      });
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">VAT Paid (5%)</label>
                  <input
                    type="number"
                    value={newExpense.vatPaid}
                    onChange={(e) => setNewExpense({ ...newExpense, vatPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Paid To (Vendor)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai Media Studio"
                    value={newExpense.paidTo}
                    onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Account</label>
                  <select
                    value={newExpense.account}
                    onChange={(e) => setNewExpense({ ...newExpense, account: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Bank - Emirates NBD">Bank - Emirates NBD</option>
                    <option value="Bank - HDFC Current">Bank - HDFC Current</option>
                    <option value="Cash">Showroom Cash Vault</option>
                    <option value="Petty Cash">Installation Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Settle Purchase Bill */}
      {/* ========================================================================= */}
      {settlePurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Settle Purchase Bill</h3>
                <p className="text-xs text-stone-500">{settlePurchaseModal.billNumber} • {settlePurchaseModal.supplierName}</p>
              </div>
              <button
                onClick={() => setSettlePurchaseModal(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettlePurchase} className="mt-4 space-y-4">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Grand Total:</span>
                  <span className="font-semibold text-stone-900">{formatCurrency(settlePurchaseModal.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(settlePurchaseModal.amountPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1 font-bold">
                  <span className="text-stone-800">Remaining Due:</span>
                  <span className="text-amber-800">
                    {formatCurrency(settlePurchaseModal.grandTotal - settlePurchaseModal.amountPaid)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Disbursement Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max={settlePurchaseModal.grandTotal - settlePurchaseModal.amountPaid}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSettlePurchaseModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Fund Transfer */}
      {/* ========================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Internal Fund Transfer</h3>
                <p className="text-xs text-stone-500">Move capital between banks and showroom cash vault</p>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferFunds} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Transfer From</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Transfer To</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Transfer Amount ($)</label>
                <input
                  type="number"
                  min="100"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
