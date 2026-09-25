import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  Award,
} from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProductTagSystemProps {
  initialSelectedProduct?: Product;
}

export const ProductTagSystem: React.FC<ProductTagSystemProps> = ({
  initialSelectedProduct,
}) => {
  const { products } = useERP();
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialSelectedProduct || products[0] || {} as Product
  );

  // Tag options
  const [tagFormat, setTagFormat] = useState<'hang-tag' | 'shelf-talker' | 'spec-sheet'>('hang-tag');
  const [showBarcode, setShowBarcode] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [showMrpStrike, setShowMrpStrike] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showSkuCode, setShowSkuCode] = useState(true);
  const [showModelNumber, setShowModelNumber] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showColorFinish, setShowColorFinish] = useState(true);
  const [customTagline, setCustomTagline] = useState('Bespoke Italian Craftsmanship');

  // Batch print mode
  const [batchCategory, setBatchCategory] = useState<string>('All');
  const [isBatchMode, setIsBatchMode] = useState(false);

  const qrValue = selectedProduct?.barcode
    ? `https://livofurniture.com/verify?barcode=${selectedProduct.barcode}&sku=${selectedProduct.sku}`
    : '';

  const batchProducts = products.filter(
    (p) => batchCategory === 'All' || p.category === batchCategory
  );

  const handlePrint = () => {
    window.print();
  };

  // Print CSS injected inline — isolates the tag from the rest of the app UI
  const printStyles = `
    @media print {
      @page { size: A5 portrait; margin: 8mm; }
      body * { visibility: hidden !important; }
      #printable-tag, #printable-tag * { visibility: visible !important; }
      #printable-tag {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 148mm !important;
        box-shadow: none !important;
        border: 1px solid #ccc !important;
        border-radius: 0 !important;
        margin: 0 !important;
      }
      #batch-print-grid { display: none !important; }
    }
    @media print.batch-mode {
      #printable-tag { display: none !important; }
      #batch-print-grid, #batch-print-grid * { visibility: visible !important; }
    }
  `;

  return (
    <div className="space-y-6">
      {/* Print isolation CSS */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-700" />
            MRP / Product Tag Studio
          </h2>
          <p className="text-xs text-stone-500">
            Generate and print luxury showroom hang tags, shelf talkers, and spec sheets with dynamic barcodes and warranty QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isBatchMode
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
            }`}
          >
            {isBatchMode ? 'Switch to Single Tag' : 'Batch Print Mode'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print {isBatchMode ? `All (${batchProducts.length})` : 'Tag'}</span>
          </button>
        </div>
      </div>

      {!isBatchMode ? (
        /* SINGLE TAG DESIGNER & PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Selector & Configuration (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Select Product to Tag
              </label>
              <select
                value={selectedProduct?.id}
                onChange={(e) => {
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Tag Layout Archetype
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hang-tag', label: 'Luxury Hang Tag' },
                  { id: 'shelf-talker', label: 'Shelf Display' },
                  { id: 'spec-sheet', label: 'Full Spec Sheet' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTagFormat(fmt.id as any)}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all ${
                      tagFormat === fmt.id
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Options Toggles */}
            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Display Elements
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Include Code-128 Barcode</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showQR}
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Include Digital Warranty & Verification QR</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showMrpStrike}
                  onChange={(e) => setShowMrpStrike(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show MRP Strike-through Price</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showWarranty}
                  onChange={(e) => setShowWarranty(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show Official Warranty Badge</span>
              </label>

              <div className="h-px w-full bg-stone-200 my-2"></div>
              
              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showSkuCode}
                  onChange={(e) => setShowSkuCode(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show SKU Code</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showModelNumber}
                  onChange={(e) => setShowModelNumber(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show Model Number</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show Dimensions / Size</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={showColorFinish}
                  onChange={(e) => setShowColorFinish(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Show Colour / Finish</span>
              </label>
            </div>

            <div>
              <label className="block text-stone-600 text-xs font-medium mb-1">
                Custom Tag Header Note
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder="e.g. Master Italian Craftsmanship"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            {/* Selected Product Quick Info */}
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <div>
                <strong>SKU:</strong> {selectedProduct.sku} • <strong>Model:</strong> {selectedProduct.modelNumber}
              </div>
              <div>
                <strong>Size:</strong> {selectedProduct.sizeDimensions}
              </div>
              <div>
                <strong>Finish:</strong> {selectedProduct.colorFinish}
              </div>
              <div>
                <strong>Warranty:</strong> {selectedProduct.warrantyYears} Years Replacement
              </div>
            </div>
          </div>

          {/* Right Column: Live High-Resolution Tag Preview (7 cols) */}
          <div className="lg:col-span-7 flex justify-center items-start">
            {/* The Tag Preview Card */}
            <div
              id="printable-tag"
              className={`bg-white border-2 border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden transition-all text-stone-900 ${
                tagFormat === 'hang-tag'
                  ? 'max-w-sm w-full min-h-[540px]'
                  : tagFormat === 'shelf-talker'
                  ? 'max-w-md w-full min-h-[380px]'
                  : 'max-w-xl w-full min-h-[600px]'
              }`}
            >
              {/* Luxury Hang Tag Hole punch simulation */}
              {tagFormat === 'hang-tag' && (
                <div className="w-4 h-4 rounded-full border-2 border-stone-800 bg-stone-100 mx-auto mb-3 shadow-inner"></div>
              )}

              {/* Brand Header */}
              <div className="text-center pb-3 border-b-2 border-stone-900 mb-4">
                <div className="font-serif font-bold tracking-[0.25em] text-sm uppercase text-stone-900">
                  LIVO FURNITURE
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-amber-800 font-semibold mt-0.5">
                  HAUTE LIVING & INTERIOR ATELIER
                </div>
                <div className="text-[8px] text-stone-400 tracking-wider uppercase mt-0.5">
                  {customTagline}
                </div>
              </div>

              {/* Brand & Product Name */}
              <div className="mb-3">
                <div className="text-[10px] font-mono tracking-wider uppercase text-amber-900 font-bold">
                  {selectedProduct.brand}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  {selectedProduct.name}
                </h3>
              </div>

              {/* Specs Grid */}
              {(showSkuCode || showModelNumber || showDimensions || showColorFinish || selectedProduct.material) && (
                <div className="bg-stone-50/80 p-3 rounded-lg border border-stone-200 text-[11px] space-y-1.5 mb-4">
                  {showSkuCode && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">SKU Code:</span>
                      <span className="font-mono font-bold text-stone-900">{selectedProduct.sku}</span>
                    </div>
                  )}
                  {showModelNumber && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Model Number:</span>
                      <span className="font-mono text-stone-800">{selectedProduct.modelNumber}</span>
                    </div>
                  )}
                  {showDimensions && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Dimensions / Size:</span>
                      <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                        {selectedProduct.sizeDimensions}
                      </span>
                    </div>
                  )}
                  {showColorFinish && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Colour / Finish:</span>
                      <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                        {selectedProduct.colorFinish}
                      </span>
                    </div>
                  )}
                  {selectedProduct.material && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Material:</span>
                      <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                        {selectedProduct.material}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Section */}
              <div className="bg-stone-900 text-white p-3.5 rounded-lg mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-amber-400 font-semibold">
                    Showroom Selling Price
                  </div>
                  <div className="font-serif text-xl font-bold font-mono text-white">
                    {formatCurrency(selectedProduct.sellingPrice)}
                  </div>
                  <div className="text-[8px] text-stone-400">Inclusive of 5% Tax & Assembly</div>
                </div>

                {showMrpStrike && (
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-stone-400">
                      Standard MRP
                    </div>
                    <div className="font-mono text-sm line-through text-stone-400">
                      {formatCurrency(selectedProduct.mrp)}
                    </div>
                    <span className="inline-block mt-0.5 text-[9px] font-semibold text-amber-300 bg-amber-900/50 px-1.5 py-0.2 rounded border border-amber-700/50">
                      Save {formatCurrency(selectedProduct.mrp - selectedProduct.sellingPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Barcode & QR Code Section */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-4">
                {showBarcode && selectedProduct?.barcode && (
                  <div className="flex-1 flex justify-center">
                    <Barcode
                      value={selectedProduct.barcode}
                      width={1.4}
                      height={48}
                      displayValue
                      fontSize={10}
                      margin={0}
                      background="transparent"
                      lineColor="#1c1917"
                    />
                  </div>
                )}

                {showQR && (
                  <div className="flex flex-col items-center shrink-0">
                    <QRCodeSVG
                      value={qrValue || 'https://livofurniture.com'}
                      size={56}
                      level="M"
                      includeMargin
                      className="border border-stone-300 p-0.5 rounded bg-white"
                    />
                    <span className="text-[8px] text-stone-500 mt-1 uppercase tracking-wider font-mono">
                      Scan Certificate
                    </span>
                  </div>
                )}
              </div>

              {/* Warranty Footer Badge */}
              {showWarranty && (
                <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-600">
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-semibold text-stone-800">
                      {selectedProduct.warrantyYears}-Year Manufacturer Warranty
                    </span>
                  </div>
                  <span className="font-mono text-stone-400 text-[9px]">
                    Verified Serial: {selectedProduct.barcode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* BATCH PRINT SHEET VIEW */
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Filter Category for Batch Printing:
              </span>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
              >
                <option value="All">All Categories ({products.length} Tags)</option>
                {Array.from(new Set(products.map((p) => p.category))).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Batch Sheet ({batchProducts.length} Tags)
            </button>
          </div>

          {/* Grid of Printable Cards */}
          <div id="batch-print-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {batchProducts.map((p) => (
              (
                <div
                  key={p.id}
                  className="bg-white border-2 border-stone-800 rounded-xl p-4 shadow-sm text-stone-900 space-y-2.5 relative"
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-stone-800 bg-stone-100 mx-auto"></div>

                  <div className="text-center border-b border-stone-800 pb-1.5">
                    <div className="font-serif font-bold tracking-widest text-xs uppercase">
                      LIVO FURNITURE
                    </div>
                    <div className="text-[8px] uppercase tracking-wider text-amber-800 font-semibold">
                      Haute Living Atelier
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-mono text-amber-900 font-bold">{p.brand}</div>
                    <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1">
                      {p.name}
                    </h4>
                  </div>

                  <div className="bg-stone-50 p-2 rounded text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">SKU / Model:</span>
                      <span className="font-mono font-bold">{p.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Dimensions:</span>
                      <span className="truncate max-w-[130px]">{p.sizeDimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Finish:</span>
                      <span className="truncate max-w-[130px]">{p.colorFinish}</span>
                    </div>
                  </div>

                  <div className="bg-stone-900 text-white p-2 rounded flex items-center justify-between">
                    <div>
                      <div className="text-[8px] uppercase text-amber-400 font-semibold">Price</div>
                      <div className="font-mono font-bold text-sm">{formatCurrency(p.sellingPrice)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-stone-400">MRP</div>
                      <div className="font-mono text-xs line-through text-stone-400">
                        {formatCurrency(p.mrp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex-1 flex justify-center">
                      <Barcode
                        value={p.barcode}
                        width={1.1}
                        height={36}
                        displayValue
                        fontSize={8}
                        margin={0}
                        background="transparent"
                        lineColor="#1c1917"
                      />
                    </div>
                    <QRCodeSVG
                      value={`https://livofurniture.com/verify?barcode=${p.barcode}&sku=${p.sku}`}
                      size={40}
                      level="M"
                      includeMargin
                      className="border border-stone-200 p-0.5 rounded shrink-0"
                    />
                  </div>

                  <div className="text-[8px] text-center text-stone-500 font-medium pt-1 border-t border-stone-200">
                    {p.warrantyYears}-Year Warranty • Verified Serial: {p.barcode}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
