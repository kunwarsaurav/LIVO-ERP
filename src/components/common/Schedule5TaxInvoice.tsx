import React from 'react';
import { Invoice } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface Schedule5TaxInvoiceProps {
  invoice: Invoice;
}

export const Schedule5TaxInvoice: React.FC<Schedule5TaxInvoiceProps> = ({ invoice }) => {
  return (
    <div className="bg-white p-4 md:p-8 print:p-2 w-full max-w-4xl mx-auto text-black relative schedule5-container font-sans">
      {/* Watermark */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
        style={{ opacity: 0.08, zIndex: 0 }}
      >

      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <h1 className="font-serif text-xl font-bold underline mt-2">Tax Invoice</h1>
        </div>

        {/* Top Info */}
        <div className="flex justify-between mb-8 print:mb-4 text-sm">
          <div>
            <div className="flex gap-2 mb-1">
              <span className="w-64">Invoice Number:</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-64">Taxpayer Registration Number of the Seller:</span>
              <span className="font-mono">100349281900003</span>
            </div>
          </div>
          <div>
            <div className="flex gap-2 mb-1">
              <span className="w-48">Date of Transaction:</span>
              <span className="font-mono">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-48">Date of Issuance of Invoice:</span>
              <span className="font-mono">{formatDate(invoice.date)}</span>
            </div>
          </div>
        </div>

        {/* Buyer & Seller Info */}
        <div className="mb-6 print:mb-4 text-sm">
          <div className="flex gap-2 mb-1">
            <span className="w-64">Name of Seller:</span>
            <span className="font-semibold">LIVO FURNITURE</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="w-64">Address:</span>
            <span>Bhagwati Tole 04, Bharatpur, Chitwan, Nepal</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="w-64">Name of Buyer:</span>
            <span className="font-semibold">{invoice.customerName}</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="w-64">Address:</span>
            <span>{invoice.customerAddress || '-'}</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="w-64">Taxpayer's Registration Number of Buyer:</span>
            <span className="font-mono">{invoice.buyerPan || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-64">Mode of Payment:</span>
            <span className="font-semibold">{invoice.paymentMethod || '-'}</span>
          </div>
        </div>

        {/* Main Table */}
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black px-2 py-3 text-center w-16">S.No.</th>
              <th className="border border-black px-2 py-3 text-center">Detail</th>
              <th className="border border-black px-2 py-3 text-center w-24">Quantity</th>
              <th className="border border-black px-2 py-3 text-center w-32">Price per unit (Rs)</th>
              <th className="border border-black px-2 py-3 text-center w-40">Total Price<br />(Rs)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="border-x border-black px-2 py-2 text-center align-top">{index + 1}</td>
                <td className="border-x border-black px-2 py-2 align-top">{item.name} {item.sku && `(${item.sku})`}</td>
                <td className="border-x border-black px-2 py-2 text-center align-top">{item.quantity}</td>
                <td className="border-x border-black px-2 py-2 text-right align-top">{formatCurrency(item.unitPrice).replace('AED ', '')}</td>
                <td className="border-x border-black px-2 py-2 text-right align-top">{formatCurrency(item.quantity * item.unitPrice).replace('AED ', '')}</td>
              </tr>
            ))}

            {/* Fill empty rows to make it look like a full page table, optionally. For now just minimum empty row if few items */}
            {invoice.items.length < 5 && Array.from({ length: 5 - invoice.items.length }).map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border-x border-black px-2 py-2">&nbsp;</td>
                <td className="border-x border-black px-2 py-2">&nbsp;</td>
                <td className="border-x border-black px-2 py-2">&nbsp;</td>
                <td className="border-x border-black px-2 py-2">&nbsp;</td>
                <td className="border-x border-black px-2 py-2">&nbsp;</td>
              </tr>
            ))}

            {/* End of item rows, add bottom border */}
            <tr>
              <td className="border-t border-black p-0" colSpan={5}></td>
            </tr>

            {/* Summary Rows */}
            <tr>
              <td colSpan={3} className="border border-black px-2 py-2 text-right">
                Discount Rate
              </td>
              <td className="border border-black px-2 py-2 text-center">
                -
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {/* Calculate total discount */}
                {formatCurrency(invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0)).replace('AED ', '')}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-black px-2 py-2 text-left">
                Taxable Amount
              </td>
              <td className="border border-black px-2 py-2 text-center">
                -
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {formatCurrency(invoice.subtotal).replace('AED ', '')}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-black px-2 py-2 text-left">
                Tax Rate .......
              </td>
              <td className="border border-black px-2 py-2 text-center">
                13%
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {formatCurrency(invoice.vatTotal).replace('AED ', '')}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-black px-2 py-2 text-left font-bold">
                Total
              </td>
              <td className="border border-black px-2 py-2 text-center">
                -
              </td>
              <td className="border border-black px-2 py-2 text-right font-bold">
                {formatCurrency(invoice.grandTotal).replace('AED ', '')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .schedule5-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
