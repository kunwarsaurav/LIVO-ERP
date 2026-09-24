import React from 'react';
import { X, Printer } from 'lucide-react';
import { Product } from '../../types';
import Barcode from 'react-barcode';

interface PrintBarcodeModalProps {
  product: Product | null;
  onClose: () => void;
}

export const PrintBarcodeModal: React.FC<PrintBarcodeModalProps> = ({ product, onClose }) => {
  if (!product) return null;


  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:items-start print:justify-start">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-300 overflow-hidden my-6 print:border-none print:shadow-none print:my-0 print:max-w-none print:w-auto print:rounded-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300">
            Print Warehouse Label
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label Body */}
        <div className="p-8 flex justify-center bg-stone-100 print:bg-white print:p-0">
          {/* The actual label - 50mm x 25mm */}
          <div className="bg-white border-2 border-stone-300 w-[50mm] h-[25mm] p-1 flex flex-col items-center justify-center overflow-hidden print:border-none print:w-[50mm] print:h-[25mm]">
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                @page {
                  size: 50mm 25mm;
                  margin: 0;
                }
                body * {
                  visibility: hidden;
                }
                #print-label-container, #print-label-container * {
                  visibility: visible;
                }
                #print-label-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  margin: 0;
                  padding: 2px;
                }
              }
            `}} />
            
            <div id="print-label-container" className="w-full text-center flex flex-col items-center justify-center h-full">
              <div className="text-[7px] font-bold uppercase tracking-wider mb-[1px] whitespace-nowrap overflow-hidden text-ellipsis px-1 text-black">
                LIVO - {product.brand}
              </div>
              <div className="w-full flex justify-center scale-[0.85] origin-top text-black">
                <Barcode 
                  value={product.barcode} 
                  width={1.2} 
                  height={30} 
                  displayValue={false}
                  margin={0} 
                  background="transparent" 
                  lineColor="#000000"
                />
              </div>
              <div className="text-[8px] font-mono font-bold mt-[1px] text-black">
                {product.barcode}
              </div>
              <div className="text-[7px] text-gray-500 font-mono mt-[1px] text-black">
                SKU: {product.sku}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
