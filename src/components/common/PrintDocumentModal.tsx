import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Invoice, Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

interface PrintDocumentModalProps {
  document:
    | { type: 'invoice'; data: Invoice }
    | { type: 'quotation'; data: Quotation }
    | null;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const isInvoice = document.type === 'invoice';
  const inv = isInvoice ? (document.data as Invoice) : null;
  const quote = !isInvoice ? (document.data as Quotation) : null;

  const qrValue = `https://livofurniture.com/verify-doc?doc=${isInvoice ? inv?.invoiceNumber : quote?.quoteNumber}&trn=100349281900003`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-stone-300 overflow-hidden my-6 print:border-none print:shadow-none print:my-0 print:max-w-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300">
            {isInvoice ? 'Official Tax Invoice Document' : 'Bespoke Design Quotation'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 md:p-12 text-stone-900 space-y-6 text-xs bg-white">
          {/* Company Brand Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-stone-900 pb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-[0.2em] text-stone-900 uppercase">
                LIVO FURNITURE
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold mt-0.5">
                HAUTE LIVING & INTERIOR ATELIER
              </p>
              <div className="mt-2 text-stone-500 space-y-0.5 text-[11px]">
                <div>Showroom: Al Quoz Industrial 1, Sheikh Zayed Road, Dubai, UAE</div>
                <div>Corporate Tax Registration TRN: 100349281900003</div>
                <div>Email: atelier@livofurniture.com • Phone: +971 4 388 9200</div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-stone-100 px-3 py-1 rounded font-serif font-bold text-sm tracking-wider uppercase text-stone-900 mb-2">
                {isInvoice ? 'TAX INVOICE' : 'FORMAL QUOTATION'}
              </div>
              <div className="font-mono text-sm font-bold text-amber-900">
                {isInvoice ? inv?.invoiceNumber : quote?.quoteNumber}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Date: {formatDate(isInvoice ? inv?.date! : quote?.date!)}
              </div>
              {isInvoice && (
                <div className="text-[11px] text-stone-500">
                  Due: {formatDate(inv?.dueDate!)}
                </div>
              )}
            </div>
          </div>

          {/* Client & Project Details */}
          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                Billed To (Client):
              </span>
              <div className="font-serif font-bold text-stone-900 text-sm">
                {isInvoice ? inv?.customerName : quote?.customerName}
              </div>
              <div className="text-stone-600 mt-0.5">
                {isInvoice ? inv?.customerAddress : quote?.projectAddress}
              </div>
              {!isInvoice && quote?.customerPhone && (
                <div className="text-stone-500 mt-0.5">Contact: {quote.customerPhone}</div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                Project Information:
              </span>
              <div className="font-semibold text-stone-800">
                {isInvoice ? inv?.invoiceType : quote?.projectTitle}
              </div>
              <div className="text-stone-500 mt-0.5">
                {isInvoice
                  ? `Payment Method: ${inv?.paymentMethod || 'Bank Wire'}`
                  : `Valid Until: ${formatDate(quote?.validUntil!)}`}
              </div>
              {isInvoice && (
                <div className="font-semibold text-emerald-700 mt-0.5">
                  Payment Status: {inv?.paymentStatus}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-stone-600 border-y border-stone-300 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">VAT (5%)</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {isInvoice &&
                  inv?.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-stone-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{it.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-stone-500">{it.sku}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.taxableAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                        {formatCurrency(it.vatAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))}

                {!isInvoice &&
                  quote?.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-stone-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{it.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {it.roomSpace} • {it.finish}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-stone-500">{it.sku}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.total)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                        {formatCurrency(it.total * 0.05)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(it.total * 1.05)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals and QR code */}
          <div className="pt-4 border-t border-stone-200 flex flex-col md:flex-row justify-between items-start gap-6">
            {/* QR verification & Terms */}
            <div className="flex items-center gap-4">
              <QRCodeSVG
                value={qrValue}
                size={80}
                level="M"
                includeMargin
                className="border border-stone-300 rounded bg-white"
              />
              <div className="space-y-0.5 text-[10px] text-stone-500 max-w-xs">
                <div className="font-bold text-stone-700">Official Federal Tax Verification</div>
                <p>This is an electronic tax document verified by LIVO Furniture Atelier.</p>
                <p>Goods once inspected and accepted are covered under 5-10 year warranty.</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="w-full md:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal (Net of Tax):</span>
                <span className="font-mono">
                  {formatCurrency(isInvoice ? inv?.subtotal! : quote?.subtotal!)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Standard VAT (5.00%):</span>
                <span className="font-mono">
                  {formatCurrency(isInvoice ? inv?.vatTotal! : quote?.vatAmount!)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-stone-900 text-base py-2 border-y-2 border-stone-900">
                <span>Grand Total:</span>
                <span className="font-mono text-amber-900">
                  {formatCurrency(isInvoice ? inv?.grandTotal! : quote?.grandTotal!)}
                </span>
              </div>

              {isInvoice && (
                <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                  <span>Amount Paid / Settled:</span>
                  <span className="font-mono">{formatCurrency(inv?.amountPaid!)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-12 text-center text-[10px] text-stone-500">
            <div>
              <div className="h-10 border-b border-stone-400 mx-auto w-48 mb-1"></div>
              <span>Authorized Signature & Seal</span>
              <div className="font-semibold text-stone-800">LIVO Furniture Atelier</div>
            </div>

            <div>
              <div className="h-10 border-b border-stone-400 mx-auto w-48 mb-1"></div>
              <span>Client Acceptance Sign-Off</span>
              <div className="font-semibold text-stone-800">
                {isInvoice ? inv?.customerName : quote?.customerName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
