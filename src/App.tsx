import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { StockManagement } from './components/stock/StockManagement';
import { AccountingModule } from './components/accounting/AccountingModule';
import { BillingPayrollModule } from './components/billing/BillingPayrollModule';
import { ProductTagSystem } from './components/mrp/ProductTagSystem';
import { PrintedCatalogues } from './components/catalogues/PrintedCatalogues';
import { SupplierManagement } from './components/suppliers/SupplierManagement';
import { SalesCRMModule } from './components/crm/SalesCRMModule';
import { PrintDocumentModal } from './components/common/PrintDocumentModal';
import { Product, Invoice, Quotation } from './types';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductForTag, setSelectedProductForTag] = useState<Product | undefined>(undefined);
  const [printDocument, setPrintDocument] = useState<
    | { type: 'invoice'; data: Invoice }
    | { type: 'quotation'; data: Quotation }
    | null
  >(null);

  const handleOpenTagStudio = (product: Product) => {
    setSelectedProductForTag(product);
    setCurrentTab('mrp');
  };

  const handleQuickNewProduct = () => {
    setCurrentTab('stock');
  };

  const handleQuickPOS = () => {
    setCurrentTab('billing');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onQuickNewProduct={handleQuickNewProduct}
        onQuickPOS={handleQuickPOS}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main App Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Content View Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <OverviewDashboard
              onNavigate={setCurrentTab}
              onOpenPOS={() => setCurrentTab('billing')}
            />
          )}

          {currentTab === 'stock' && (
            <StockManagement onOpenTagModal={handleOpenTagStudio} />
          )}

          {currentTab === 'accounting' && <AccountingModule />}

          {currentTab === 'billing' && (
            <BillingPayrollModule
              onPrintInvoice={(invoice) =>
                setPrintDocument({ type: 'invoice', data: invoice })
              }
              onPrintQuotation={(quotation) =>
                setPrintDocument({ type: 'quotation', data: quotation })
              }
            />
          )}

          {currentTab === 'mrp' && (
            <ProductTagSystem initialSelectedProduct={selectedProductForTag} />
          )}

          {currentTab === 'catalogue' && (
            <PrintedCatalogues onSelectProductForTag={handleOpenTagStudio} />
          )}

          {currentTab === 'suppliers' && <SupplierManagement />}

          {currentTab === 'crm' && <SalesCRMModule />}
        </main>
      </div>

      {/* Official Tax Invoice & Quotation Printable Modal */}
      {printDocument && (
        <PrintDocumentModal
          document={printDocument}
          onClose={() => setPrintDocument(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <MainApp />
    </ERPProvider>
  );
}
