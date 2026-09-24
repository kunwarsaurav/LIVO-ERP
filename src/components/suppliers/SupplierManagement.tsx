import React, { useState } from 'react';
import {
  Truck,
  Building,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Anchor,
  Box,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Supplier, InboundDelivery } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

export const SupplierManagement: React.FC = () => {
  const { suppliers, deliveries, addSupplier, addDelivery } = useERP();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'deliveries'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  // New Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'rating'>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxVatNumber: '',
    paymentTerms: '30% Advance, 70% against Bill of Lading',
    warrantyTerms: '10 Years Structural Guarantee',
    leadTimeDays: 45,
    brandsSupplied: ['Milano Atelier', 'Nordic Form'],
  });

  // New Inbound Delivery Shipment Modal
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [delSupplierId, setDelSupplierId] = useState(suppliers[0]?.id || '');
  const [delConsignmentNo, setDelConsignmentNo] = useState(`MSKU-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [delCarrier, setDelCarrier] = useState('Maersk Line / Mediterranean Shipping');
  const [delTotalValue, setDelTotalValue] = useState<number>(38000);
  const [delItemsCount, setDelItemsCount] = useState<number>(24);
  const [delExpectedDate, setDelExpectedDate] = useState(
    new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]
  );
  const [delWarehouse, setDelWarehouse] = useState('Al Quoz Central Warehouse (Bay 3)');

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    addSupplier({
      ...newSupplier,
      rating: 4.9,
    });
    setIsSupplierModalOpen(false);
    setNewSupplier({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxVatNumber: '',
      paymentTerms: '30% Advance, 70% against Bill of Lading',
      warrantyTerms: '10 Years Structural Guarantee',
      leadTimeDays: 45,
      brandsSupplied: ['Milano Atelier'],
    });
  };

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === delSupplierId);
    if (!sup) return;

    addDelivery({
      supplierId: sup.id,
      supplierName: sup.name,
      consignmentNo: delConsignmentNo,
      carrierName: delCarrier,
      expectedDate: delExpectedDate,
      status: 'In-Transit',
      itemsCount: Number(delItemsCount),
      totalValue: Number(delTotalValue),
      destinationWarehouse: delWarehouse,
    });

    setIsDeliveryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-700" />
            Distributor & Supplier Management
          </h2>
          <p className="text-xs text-stone-500">
            Global supplier directory, purchase rate terms, contract agreements, and container sea-freight inbound shipments tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Onboard Supplier</span>
          </button>
          <button
            onClick={() => setIsDeliveryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Log Container Inbound</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'suppliers'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Supplier Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'deliveries'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Anchor className="w-3.5 h-3.5" /> Inbound Container Shipments ({deliveries.length})
        </button>
      </div>

      {/* TAB 1: SUPPLIER DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suppliers by name, address, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-stone-500">
              Active Tier-1 Partners: <strong className="text-stone-900">{suppliers.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.brandsSupplied.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">
                        {supplier.name}
                      </h4>
                      <div className="text-[10px] text-stone-500">{supplier.contactPerson}</div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-stone-100 px-2 py-0.5 rounded">
                      ★ {supplier.rating}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Payment Terms:</span>
                      <span className="font-medium text-stone-800">{supplier.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Lead Time:</span>
                      <span className="font-medium text-stone-800">{supplier.leadTimeDays} Days (Sea Cargo)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Warranty:</span>
                      <span className="font-medium text-emerald-700">{supplier.warrantyTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tax / VAT ID:</span>
                      <span className="font-mono text-stone-700">{supplier.taxVatNumber}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                    {supplier.brandsSupplied.map((b) => (
                      <span
                        key={b}
                        className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND SHIPMENTS & CONTAINERS */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Inbound Freight Containers & Port Clearances
              </h3>
              <span className="text-xs text-stone-500">{deliveries.length} Shipments</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Container / Consignment</th>
                    <th className="py-3 px-3">Manufacturer Partner</th>
                    <th className="py-3 px-3">Ocean Carrier</th>
                    <th className="py-3 px-3 text-right">Items Count</th>
                    <th className="py-3 px-3 text-right">Total Cargo Value</th>
                    <th className="py-3 px-3">ETA Date</th>
                    <th className="py-3 px-3">Warehouse Destination</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {del.consignmentNo}
                      </td>

                      <td className="py-3 px-3 font-semibold text-stone-900">{del.supplierName}</td>

                      <td className="py-3 px-3 text-stone-600">{del.carrierName}</td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-stone-800">
                        {del.itemsCount} crates
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(del.totalValue)}
                      </td>

                      <td className="py-3 px-3 font-mono text-stone-600">
                        {formatDate(del.expectedDate)}
                      </td>

                      <td className="py-3 px-3 text-stone-600 truncate max-w-xs">
                        {del.destinationWarehouse}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(del.status)}`}>
                          {del.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Onboard Supplier */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Onboard Partner Supplier
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter manufacturer credentials, location, and payment terms.
            </p>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Venetian Glass & Marble SpA"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="e.g. Roberto Rossi"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Factory / Atelier Address</label>
                <input
                  type="text"
                  required
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="Via della Spiga, Milan, Italy"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Contract Payment Terms</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Tax / VAT ID</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.taxVatNumber}
                    onChange={(e) => setNewSupplier({ ...newSupplier, taxVatNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Inbound Container Delivery */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Log Inbound Sea-Freight Container
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Record arrival schedule and cargo valuation.
            </p>

            <form onSubmit={handleCreateDelivery} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Manufacturer</label>
                <select
                  value={delSupplierId}
                  onChange={(e) => setDelSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Consignment / Container No</label>
                  <input
                    type="text"
                    required
                    value={delConsignmentNo}
                    onChange={(e) => setDelConsignmentNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Ocean Carrier</label>
                  <input
                    type="text"
                    required
                    value={delCarrier}
                    onChange={(e) => setDelCarrier(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Cargo Valuation ($)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={delTotalValue}
                    onChange={(e) => setDelTotalValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Items / Crates Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={delItemsCount}
                    onChange={(e) => setDelItemsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Port ETA Date</label>
                <input
                  type="date"
                  required
                  value={delExpectedDate}
                  onChange={(e) => setDelExpectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Destination Warehouse</label>
                <input
                  type="text"
                  required
                  value={delWarehouse}
                  onChange={(e) => setDelWarehouse(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  Log Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
