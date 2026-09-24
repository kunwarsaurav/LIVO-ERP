import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  Download,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Plus,
  Eye,
  Check,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product, ProductCategory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PrintedCataloguesProps {
  onSelectProductForTag?: (product: Product) => void;
}

export const PrintedCatalogues: React.FC<PrintedCataloguesProps> = ({
  onSelectProductForTag,
}) => {
  const { products } = useERP();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [catalogLayout, setCatalogLayout] = useState<'lookbook' | 'spec-grid' | 'print-sheet'>('lookbook');
  const [activeQuickView, setActiveQuickView] = useState<Product | null>(null);

  // The 11 specific categories requested by the user:
  const catalogueCategories = [
    'All',
    'Sofa',
    'Bed',
    'Wardrobe',
    'Kitchen',
    'Kitchen accessories/hardware',
    'Dining',
    'Office furniture',
    'Curtains/Parda',
    'Carpet',
    'Gypsum products',
    'Home décor',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(p.category.toLowerCase());

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.colorFinish.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;

    return matchesCat && matchesSearch && matchesBrand;
  });

  const handlePrintCatalogue = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            Printed Catalogues & Architectural Lookbooks
          </h2>
          <p className="text-xs text-stone-500">
            High-fashion furniture lookbook, client presentation catalogues, and technical finish swatch guides across all 11 departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 text-xs font-semibold">
            <button
              onClick={() => setCatalogLayout('lookbook')}
              className={`px-3 py-1 rounded-md transition-all ${
                catalogLayout === 'lookbook'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lookbook View
            </button>
            <button
              onClick={() => setCatalogLayout('spec-grid')}
              className={`px-3 py-1 rounded-md transition-all ${
                catalogLayout === 'spec-grid'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Spec Sheet Grid
            </button>
            <button
              onClick={() => setCatalogLayout('print-sheet')}
              className={`px-3 py-1 rounded-md transition-all ${
                catalogLayout === 'print-sheet'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Editorial Print A4
            </button>
          </div>

          <button
            onClick={handlePrintCatalogue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Lookbook ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Category Pills (Horizontal scrolling bar) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {catalogueCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search finishes, bouclé fabrics, marble types, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Brand Atelier:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
          >
            <option value="All">All Brands</option>
            {Array.from(new Set(products.map((p) => p.brand))).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LAYOUT 1: LUXURY EDITORIAL LOOKBOOK */}
      {catalogLayout === 'lookbook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo showcase */}
                <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-60"></div>

                  <span className="absolute top-3 left-3 text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-900/90 text-amber-300 px-2 py-0.5 rounded backdrop-blur-xs">
                    {p.brand}
                  </span>

                  <span className="absolute top-3 right-3 text-[10px] font-semibold bg-white/95 text-stone-900 px-2 py-0.5 rounded shadow-xs">
                    {p.category}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] font-mono text-stone-300">Model: {p.modelNumber}</div>
                    <h3 className="font-serif font-bold text-base leading-tight drop-shadow-xs">
                      {p.name}
                    </h3>
                  </div>
                </div>

                {/* Specs breakdown */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Dimensions:</span>
                    <span className="font-medium text-stone-800 text-right max-w-[170px] truncate">
                      {p.sizeDimensions}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Colour & Finish:</span>
                    <span className="font-medium text-stone-800 text-right max-w-[170px] truncate">
                      {p.colorFinish}
                    </span>
                  </div>

                  {p.material && (
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Material Swatch:</span>
                      <span className="font-medium text-stone-800 text-right max-w-[170px] truncate">
                        {p.material}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Warranty:</span>
                    <span className="font-semibold text-emerald-700">
                      {p.warrantyYears}-Year Guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & Tag Generation */}
              <div className="p-4 pt-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                    Showroom Price
                  </div>
                  <div className="font-serif font-bold text-base font-mono text-stone-900">
                    {formatCurrency(p.sellingPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {onSelectProductForTag && (
                    <button
                      onClick={() => onSelectProductForTag(p)}
                      title="Generate Product Tag / Barcode"
                      className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Tag</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LAYOUT 2: TECHNICAL SPEC SHEET GRID */}
      {catalogLayout === 'spec-grid' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Thumbnail</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Product Name & Model</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3">Dimensions</th>
                  <th className="py-3 px-3">Finish / Material</th>
                  <th className="py-3 px-3 text-right">MRP</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Warranty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-md border border-stone-200 bg-stone-100"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{p.name}</div>
                      <div className="text-[10px] font-mono text-stone-400">
                        SKU: {p.sku} • Model: {p.modelNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">{p.brand}</td>
                    <td className="py-2.5 px-3 text-stone-600">{p.sizeDimensions}</td>
                    <td className="py-2.5 px-3 text-stone-600">
                      <div>{p.colorFinish}</div>
                      <div className="text-[10px] text-stone-400">{p.material}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-400 line-through">
                      {formatCurrency(p.mrp)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.warrantyYears} Yrs
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LAYOUT 3: EDITORIAL A4 PRINT PREVIEW */}
      {catalogLayout === 'print-sheet' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Cover Page Simulation */}
          <div className="bg-stone-950 text-white rounded-2xl p-12 shadow-xl border border-stone-800 text-center space-y-6">
            <div className="font-serif text-3xl md:text-5xl font-bold tracking-[0.25em] text-amber-200 uppercase">
              LIVO FURNITURE
            </div>
            <div className="text-xs uppercase tracking-[0.35em] text-stone-400">
              Autumn / Winter Luxury Interior Collection • Volume VIII
            </div>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto"></div>
            <p className="max-w-xl mx-auto text-xs text-stone-300 leading-relaxed font-light">
              Featuring bespoke Italian sofas, handcrafted walk-in wardrobes, modular German Blum kitchen solutions, pure silk carpets, and architectural gypsum flutings.
            </p>
          </div>

          {/* Catalog Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-stone-300 p-6 shadow-sm space-y-4"
              >
                <div className="h-56 w-full rounded-lg overflow-hidden bg-stone-100">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="border-b border-stone-200 pb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold">
                      {p.brand}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-900">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-stone-900 mt-1">{p.name}</h4>
                  <div className="text-[11px] text-stone-500">Model: {p.modelNumber} • Category: {p.category}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase">Dimensions</span>
                    <span className="font-medium text-stone-800">{p.sizeDimensions}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase">Finish</span>
                    <span className="font-medium text-stone-800">{p.colorFinish}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase">Material</span>
                    <span className="font-medium text-stone-800">{p.material}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase">Warranty</span>
                    <span className="font-medium text-emerald-700">{p.warrantyYears}-Year Replacement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
