export type ProductCategory = string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subCategory?: string;
  room?: string;
  modelNumber: string;
  sizeDimensions: string;
  colorFinish: string;
  material: string;
  purchasePrice: number;
  dealerPrice: number;
  sellingPrice: number;
  mrp: number;
  currentStock: number;
  reservedStock?: number;
  minAlertStock: number;
  supplierId: string;
  supplierName: string;
  barcode: string;
  warrantyYears: number;
  description: string;
  imageUrl: string;
  featuredInCatalogue: boolean;
  specifications?: string[];
  customizable?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: 'Purchase Receipt' | 'Showroom Sale' | 'Project Dispatch' | 'Damaged/Scrap' | 'Sample Display' | 'Return';
  referenceNo: string;
  date: string;
  performedBy: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxVatNumber: string;
  brandsSupplied: string[];
  paymentTerms: string; // e.g. 'Net 30 Days', '50% Advance 50% on Delivery'
  warrantyTerms: string;
  leadTimeDays: number;
  rating: number; // 1 to 5
}

export interface InboundDelivery {
  id: string;
  supplierId: string;
  supplierName: string;
  consignmentNo: string;
  carrierName: string;
  expectedDate: string;
  status: 'Dispatched' | 'In-Transit' | 'Customs Clearance' | 'Delivered' | 'Pending Inspection';
  itemsCount: number;
  totalValue: number;
  destinationWarehouse: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  type: 'Residential' | 'Commercial / Corporate' | 'Architect / Designer' | 'Retail Client';
  phone: string;
  email: string;
  address: string;
  city: string;
  taxNumber?: string;
  totalSpent: number;
  outstandingBalance: number;
}

export interface QuotationItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  roomSpace?: string; // e.g., 'Master Bedroom', 'Executive Suite'
  dimensions?: string;
  finish?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  projectTitle: string;
  projectAddress: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  vatRate: number; // e.g. 5 or 15 or 18
  vatAmount: number;
  discountAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Converted to Order';
  notes?: string;
  preparedBy: string;
}

export interface InvoiceItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  paymentMethod?: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Cheque';
  invoiceType: 'Tax Invoice' | 'POS Receipt' | 'Proforma';
}

export interface Expense {
  id: string;
  date: string;
  category: 'Showroom Rent' | 'Warehouse Utilities' | 'Staff Travel & Logistics' | 'Marketing & Photography' | 'Installation Tools' | 'Office Supplies' | 'Maintenance';
  description: string;
  amount: number;
  vatPaid: number;
  account: 'Cash' | 'Bank - Emirates NBD' | 'Bank - HDFC Current' | 'Petty Cash';
  paidTo: string;
  referenceNo: string;
  status: 'Paid' | 'Pending';
}

export interface AccountingTransaction {
  id: string;
  date: string;
  type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'RECEIPT' | 'PAYMENT';
  partyName: string;
  partyType: 'Customer' | 'Supplier' | 'Vendor' | 'Internal';
  account: 'Cash' | 'Bank - Primary' | 'Bank - Operations' | 'Petty Cash';
  referenceNo: string;
  debit: number;
  credit: number;
  vatAmount: number;
  description: string;
  balanceAfter?: number;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: 'Interior Design' | 'Showroom Sales' | 'Installation & Carpentry' | 'Warehouse & Logistics' | 'Management & Accounts';
  phone: string;
  email: string;
  joinDate: string;
  baseSalary: number;
  allowances: number;
  commissionRatePercent: number; // e.g. 2% on closed projects
  bankAccount: string;
  status: 'Active' | 'On Leave';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'On-Site' | 'Half Day' | 'Leave' | 'Overtime';
  checkIn: string;
  checkOut: string;
  overtimeHours: number;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  month: string; // e.g. 'September 2026'
  employeeId: string;
  employeeName: string;
  designation: string;
  baseSalary: number;
  allowances: number;
  overtimePay: number;
  salesCommission: number;
  deductions: number;
  netPay: number;
  status: 'Processed' | 'Paid';
  paymentDate?: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  clientName: string;
  clientType: 'Residential Villa' | 'Penthouse' | 'Corporate Office' | 'Boutique Hotel';
  phone: string;
  email: string;
  spaceSizeSqFt: number;
  budgetEst: number;
  stage: 'New Inquiry' | 'Consultation' | 'Site Measurement' | '3D Proposal' | 'Quotation Sent' | 'Won / Order' | 'Lost';
  assignedDesigner: string;
  createdAt: string;
  nextFollowUpDate: string;
  notes: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  projectType: string;
  orderDate: string;
  targetDeliveryDate: string;
  totalAmount: number;
  amountPaid: number;
  productionStatus: 'Ordered' | 'In Production / Procurement' | 'Warehouse Ready' | 'Out for Delivery' | 'Installed & Signed Off';
  deliveryAddress: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    dimensions: string;
    finish: string;
  }>;
}

export interface InstallationTask {
  id: string;
  orderId: string;
  orderNumber: string;
  clientName: string;
  siteAddress: string;
  scheduledDate: string;
  leadSupervisor: string;
  teamMembers: string[];
  status: 'Scheduled' | 'Site Prep' | 'In Progress' | 'Snag Resolution' | 'Completed & Approved';
  itemsToInstall: string;
  siteChecklistComplete: boolean;
  snagsReported?: string;
}

export interface CustomerFeedback {
  id: string;
  orderNumber: string;
  customerName: string;
  projectType: string;
  rating: number; // 1 to 5
  npsScore: number; // 0 to 10
  review: string;
  completionDate: string;
  testimonialApproved: boolean;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  billDate: string;
  dueDate: string;
  items: Array<{
    itemName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    total: number;
  }>;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  paymentMethod?: string;
  notes?: string;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  period: string;
  salesTarget: number;
  achievedSales: number;
  targetPercent: number;
  commissionRate: number;
  incentiveAmount: number;
  bonusAmount: number;
  totalCommission: number;
  status: 'Pending Review' | 'Approved' | 'Paid';
  paidDate?: string;
}
