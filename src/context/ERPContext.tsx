import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import {
  Product,
  StockMovement,
  Supplier,
  InboundDelivery,
  Customer,
  Quotation,
  Invoice,
  Expense,
  AccountingTransaction,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  Lead,
  SalesOrder,
  InstallationTask,
  CustomerFeedback,
  PurchaseBill,
  CommissionRecord,
} from '../types';

interface ERPContextType {
  products: Product[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  deliveries: InboundDelivery[];
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  purchases: PurchaseBill[];
  expenses: Expense[];
  transactions: AccountingTransaction[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  commissions: CommissionRecord[];
  leads: Lead[];
  orders: SalesOrder[];
  installations: InstallationTask[];
  feedback: CustomerFeedback[];

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'outstandingBalance'>) => void;
  addQuotation: (quotation: Omit<Quotation, 'id' | 'quoteNumber' | 'date'>) => void;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;
  convertQuoteToOrder: (quoteId: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque') => void;
  addPurchaseBill: (bill: Omit<PurchaseBill, 'id' | 'billNumber'>) => void;
  recordPurchasePayment: (billId: string, amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  addTransaction: (transaction: Omit<AccountingTransaction, 'id' | 'date'>) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'date'>) => void;
  processPayroll: (month: string) => void;
  updateCommissionStatus: (id: string, status: CommissionRecord['status']) => void;
  addLead: (lead: Omit<Lead, 'id' | 'leadNumber' | 'createdAt'>) => void;
  updateLeadStage: (id: string, stage: Lead['stage']) => void;
  updateOrderStatus: (id: string, status: SalesOrder['productionStatus']) => void;
  updateInstallationStatus: (id: string, status: InstallationTask['status'], snags?: string) => void;
  addFeedback: (fb: Omit<CustomerFeedback, 'id' | 'completionDate'>) => void;
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  addDelivery: (del: Omit<InboundDelivery, 'id'>) => void;

  totalStockValueCost: number;
  totalStockValueRetail: number;
  lowStockCount: number;
  totalReceivables: number;
  totalPayables: number;
  resetAllData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ['products'], queryFn: async () => (await api.get('/products')).data });
  const { data: stockMovements = [] } = useQuery<StockMovement[]>({ queryKey: ['stockMovements'], queryFn: async () => (await api.get('/stock-movements')).data });
  const { data: suppliers = [] } = useQuery<Supplier[]>({ queryKey: ['suppliers'], queryFn: async () => (await api.get('/suppliers')).data });
  const { data: deliveries = [] } = useQuery<InboundDelivery[]>({ queryKey: ['deliveries'], queryFn: async () => (await api.get('/deliveries')).data });
  const { data: customers = [] } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });
  const { data: quotations = [] } = useQuery<Quotation[]>({ queryKey: ['quotations'], queryFn: async () => (await api.get('/quotations')).data });
  const { data: invoices = [] } = useQuery<Invoice[]>({ queryKey: ['invoices'], queryFn: async () => (await api.get('/invoices')).data });
  const { data: purchases = [] } = useQuery<PurchaseBill[]>({ queryKey: ['purchases'], queryFn: async () => (await api.get('/purchases')).data });
  const { data: expenses = [] } = useQuery<Expense[]>({ queryKey: ['expenses'], queryFn: async () => (await api.get('/expenses')).data });
  const { data: transactions = [] } = useQuery<AccountingTransaction[]>({ queryKey: ['transactions'], queryFn: async () => (await api.get('/transactions')).data });
  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ['employees'], queryFn: async () => (await api.get('/employees')).data });
  const { data: attendance = [] } = useQuery<AttendanceRecord[]>({ queryKey: ['attendance'], queryFn: async () => (await api.get('/attendance')).data });
  const { data: payroll = [] } = useQuery<PayrollRecord[]>({ queryKey: ['payroll'], queryFn: async () => (await api.get('/payroll')).data });
  const { data: commissions = [] } = useQuery<CommissionRecord[]>({ queryKey: ['commissions'], queryFn: async () => (await api.get('/commissions')).data });
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ['leads'], queryFn: async () => (await api.get('/leads')).data });
  const { data: orders = [] } = useQuery<SalesOrder[]>({ queryKey: ['orders'], queryFn: async () => (await api.get('/orders')).data });
  const { data: installations = [] } = useQuery<InstallationTask[]>({ queryKey: ['installations'], queryFn: async () => (await api.get('/installations')).data });
  const { data: feedback = [] } = useQuery<CustomerFeedback[]>({ queryKey: ['feedback'], queryFn: async () => (await api.get('/feedback')).data });

  // Generic mutation creator
  const createMutation = (endpoint: string, key: string, method: 'post' | 'put' | 'delete' = 'post') => {
    return useMutation({
      mutationFn: async (data: any) => {
        if (method === 'post') return (await api.post(endpoint, data)).data;
        if (method === 'put') return (await api.put(`${endpoint}/${data.id}`, data)).data;
        if (method === 'delete') return (await api.delete(`${endpoint}/${data}`)).data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] })
    });
  };

  // Mutations
  const addProductMut = createMutation('/products', 'products');
  const updateProductMut = createMutation('/products', 'products', 'put');
  const deleteProductMut = createMutation('/products', 'products', 'delete');
  const addStockMovementMut = createMutation('/stock-movements', 'stockMovements');
  const addCustomerMut = createMutation('/customers', 'customers');
  const addQuotationMut = createMutation('/quotations', 'quotations');
  const updateQuotationMut = createMutation('/quotations', 'quotations', 'put');
  const convertQuoteMut = useMutation({
    mutationFn: async (quoteId: string) => (await api.post(`/quotations/${quoteId}/convert`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
  const addInvoiceMut = createMutation('/invoices', 'invoices');
  const recordInvoicePaymentMut = useMutation({
    mutationFn: async ({ id, amount, method }: { id: string, amount: number, method: string }) => (await api.post(`/invoices/${id}/payment`, { amount, method })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
  const addPurchaseBillMut = createMutation('/purchases', 'purchases');
  const recordPurchasePaymentMut = useMutation({
    mutationFn: async ({ id, amount }: { id: string, amount: number }) => (await api.post(`/purchases/${id}/payment`, { amount })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
  const addExpenseMut = createMutation('/expenses', 'expenses');
  const addTransactionMut = createMutation('/transactions', 'transactions');
  const addAttendanceMut = createMutation('/attendance', 'attendance');
  const processPayrollMut = useMutation({
    mutationFn: async (month: string) => (await api.post('/payroll/process', { month })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] })
  });
  const updateCommissionStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => (await api.put(`/commissions/${id}/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commissions'] })
  });
  const addLeadMut = createMutation('/leads', 'leads');
  const updateLeadStageMut = useMutation({
    mutationFn: async ({ id, stage }: { id: string, stage: string }) => (await api.put(`/leads/${id}/stage`, { stage })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
  });
  const updateOrderStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => (await api.put(`/orders/${id}/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] })
  });
  const updateInstallationStatusMut = useMutation({
    mutationFn: async ({ id, status, snags }: { id: string, status: string, snags?: string }) => (await api.put(`/installations/${id}/status`, { status, snags })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['installations'] })
  });
  const addFeedbackMut = createMutation('/feedback', 'feedback');
  const addSupplierMut = createMutation('/suppliers', 'suppliers');
  const addDeliveryMut = createMutation('/deliveries', 'deliveries');

  const resetAllDataMut = useMutation({
    mutationFn: async () => (await api.post('/system/reset')).data,
    onSuccess: () => queryClient.invalidateQueries()
  });

  // Action wrappers
  const addProduct = (p: Omit<Product, 'id'>) => addProductMut.mutate(p);
  const updateProduct = (id: string, updates: Partial<Product>) => updateProductMut.mutate({ id, ...updates });
  const deleteProduct = (id: string) => deleteProductMut.mutate(id);
  const addStockMovement = (m: Omit<StockMovement, 'id' | 'date'>) => addStockMovementMut.mutate(m);
  const addCustomer = (c: Omit<Customer, 'id' | 'totalSpent' | 'outstandingBalance'>) => addCustomerMut.mutate(c);
  const addQuotation = (q: Omit<Quotation, 'id' | 'quoteNumber' | 'date'>) => addQuotationMut.mutate(q);
  const updateQuotationStatus = (id: string, status: Quotation['status']) => updateQuotationMut.mutate({ id, status });
  const convertQuoteToOrder = (quoteId: string) => convertQuoteMut.mutate(quoteId);
  const addInvoice = (i: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => addInvoiceMut.mutate(i);
  const recordInvoicePayment = (id: string, amount: number, method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque') => recordInvoicePaymentMut.mutate({ id, amount, method });
  const addPurchaseBill = (b: Omit<PurchaseBill, 'id' | 'billNumber'>) => addPurchaseBillMut.mutate(b);
  const recordPurchasePayment = (id: string, amount: number) => recordPurchasePaymentMut.mutate({ id, amount });
  const addExpense = (e: Omit<Expense, 'id' | 'date'>) => addExpenseMut.mutate(e);
  const addTransaction = (t: Omit<AccountingTransaction, 'id' | 'date'>) => addTransactionMut.mutate(t);
  const addAttendance = (a: Omit<AttendanceRecord, 'id' | 'date'>) => addAttendanceMut.mutate(a);
  const processPayroll = (month: string) => processPayrollMut.mutate(month);
  const updateCommissionStatus = (id: string, status: CommissionRecord['status']) => updateCommissionStatusMut.mutate({ id, status });
  const addLead = (l: Omit<Lead, 'id' | 'leadNumber' | 'createdAt'>) => addLeadMut.mutate(l);
  const updateLeadStage = (id: string, stage: Lead['stage']) => updateLeadStageMut.mutate({ id, stage });
  const updateOrderStatus = (id: string, status: SalesOrder['productionStatus']) => updateOrderStatusMut.mutate({ id, status });
  const updateInstallationStatus = (id: string, status: InstallationTask['status'], snags?: string) => updateInstallationStatusMut.mutate({ id, status, snags });
  const addFeedback = (fb: Omit<CustomerFeedback, 'id' | 'completionDate'>) => addFeedbackMut.mutate(fb);
  const addSupplier = (sup: Omit<Supplier, 'id'>) => addSupplierMut.mutate(sup);
  const addDelivery = (del: Omit<InboundDelivery, 'id'>) => addDeliveryMut.mutate(del);
  const resetAllData = () => resetAllDataMut.mutate();

  // Metrics (computed from current data in cache)
  const totalStockValueCost = products.reduce((acc, p) => acc + p.purchasePrice * p.currentStock, 0);
  const totalStockValueRetail = products.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minAlertStock).length;
  const totalReceivables = invoices.reduce((acc, inv) => acc + (inv.grandTotal - inv.amountPaid), 0);
  const totalPayables = purchases.reduce((acc, p) => acc + (p.grandTotal - p.amountPaid), 0);

  return (
    <ERPContext.Provider
      value={{
        products,
        stockMovements,
        suppliers,
        deliveries,
        customers,
        quotations,
        invoices,
        purchases,
        expenses,
        transactions,
        employees,
        attendance,
        payroll,
        commissions,
        leads,
        orders,
        installations,
        feedback,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockMovement,
        addCustomer,
        addQuotation,
        updateQuotationStatus,
        convertQuoteToOrder,
        addInvoice,
        recordInvoicePayment,
        addPurchaseBill,
        recordPurchasePayment,
        addExpense,
        addTransaction,
        addAttendance,
        processPayroll,
        updateCommissionStatus,
        addLead,
        updateLeadStage,
        updateOrderStatus,
        updateInstallationStatus,
        addFeedback,
        addSupplier,
        addDelivery,
        totalStockValueCost,
        totalStockValueRetail,
        lowStockCount,
        totalReceivables,
        totalPayables,
        resetAllData,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
