"use client";

import React, { useEffect } from 'react';
import Barcode from 'react-barcode';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '../../../../utils/api'; 

export default function PrintBarcodePage() {
  const params = useParams();
  const sku = params.sku as string;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const product = products.find((p: any) => p.sku === sku);

  // Auto-print after the label renders (correct Next.js pattern — no script tags)
  useEffect(() => {
    if (!isLoading && product) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, product]);

  if (isLoading) return <div className="p-4 text-center">Loading label...</div>;
  if (!product) return <div className="p-4 text-center">Product not found for SKU: {sku}</div>;

  return (
    <div className="print-container w-[50mm] h-[25mm] m-0 p-1 flex flex-col items-center justify-center bg-white overflow-hidden text-black mx-auto mt-10 print:mt-0">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 50mm 25mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          header, nav, footer, .sidebar, .no-print {
            display: none !important;
          }
        }
      `}} />
      
      <div className="w-full text-center">
        <div className="text-[7px] font-bold uppercase tracking-wider mb-[1px] whitespace-nowrap overflow-hidden text-ellipsis px-1">
          LIVO - {product.brand}
        </div>
        <div className="w-full flex justify-center scale-90 origin-top">
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
        <div className="text-[8px] font-mono font-bold mt-[1px]">
          {product.barcode}
        </div>
        <div className="text-[7px] text-gray-500 font-mono mt-[1px]">
          SKU: {product.sku}
        </div>
      </div>
    </div>
  );
}
