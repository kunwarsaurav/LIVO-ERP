const fs = require('fs');
const path = 'src/components/billing/BillingPayrollModule.tsx';
const code = fs.readFileSync(path, 'utf8');

// 1. Create POSBillingModule
let posCode = code.replace(/BillingPayrollModule/g, 'POSBillingModule');
posCode = posCode.replace(/Billing & Payroll/g, 'POS & Billing Dashboard');
posCode = posCode.replace(/Module 4/g, 'Sales & POS');
posCode = posCode.replace(/Showroom POS, Quotations, Invoices, Customer Database, Attendance, Payroll, and Sales Commissions./g, 'Showroom POS, Quotations, Invoices, and Customer Database.');
// Update the tabs state
posCode = posCode.replace(/useState<\n\s*'pos' \| 'quotation' \| 'invoice' \| 'customers' \| 'attendance' \| 'payroll' \| 'commission'\n\s*>\('pos'\);/g, `useState<'pos' | 'quotation' | 'invoice' | 'customers'>('pos');`);
posCode = posCode.replace(/useState<\s*'pos' \| 'quotation' \| 'invoice' \| 'customers' \| 'attendance' \| 'payroll' \| 'commission'\s*>\('pos'\);/g, `useState<'pos' | 'quotation' | 'invoice' | 'customers'>('pos');`);

// Remove HR tabs from navigation array
posCode = posCode.replace(/\{\s*id:\s*'attendance'[\s\S]*?icon:\s*CalendarCheck2\s*\},/g, '');
posCode = posCode.replace(/\{\s*id:\s*'payroll'[\s\S]*?icon:\s*DollarSign\s*\},/g, '');
posCode = posCode.replace(/\{\s*id:\s*'commission'[\s\S]*?icon:\s*Award\s*\},/g, '');

fs.writeFileSync('src/components/billing/POSBillingModule.tsx', posCode);

// 2. Create HRPayrollModule
let hrCode = code.replace(/BillingPayrollModule/g, 'HRPayrollModule');
hrCode = hrCode.replace(/Billing & Payroll/g, 'HR & Payroll');
hrCode = hrCode.replace(/Module 4/g, 'Human Resources');
hrCode = hrCode.replace(/Showroom POS, Quotations, Invoices, Customer Database, Attendance, Payroll, and Sales Commissions./g, 'Employee Attendance, Salary/Payroll, and Sales Commissions.');
// Update the tabs state
hrCode = hrCode.replace(/useState<\n\s*'pos' \| 'quotation' \| 'invoice' \| 'customers' \| 'attendance' \| 'payroll' \| 'commission'\n\s*>\('pos'\);/g, `useState<'attendance' | 'payroll' | 'commission'>('attendance');`);
hrCode = hrCode.replace(/useState<\s*'pos' \| 'quotation' \| 'invoice' \| 'customers' \| 'attendance' \| 'payroll' \| 'commission'\s*>\('pos'\);/g, `useState<'attendance' | 'payroll' | 'commission'>('attendance');`);

// Remove POS tabs from navigation array
hrCode = hrCode.replace(/\{\s*id:\s*'pos'[\s\S]*?icon:\s*ShoppingCart\s*\},/g, '');
hrCode = hrCode.replace(/\{\s*id:\s*'quotation'[\s\S]*?icon:\s*FileText\s*\},/g, '');
hrCode = hrCode.replace(/\{\s*id:\s*'invoice'[\s\S]*?icon:\s*Receipt\s*\},/g, '');
hrCode = hrCode.replace(/\{\s*id:\s*'customers'[\s\S]*?icon:\s*Users2\s*\},/g, '');

fs.writeFileSync('src/components/billing/HRPayrollModule.tsx', hrCode);

console.log('Files generated successfully.');
