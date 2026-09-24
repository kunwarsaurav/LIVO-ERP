import React, { useState } from 'react';
import {
  Users,
  Compass,
  PhoneCall,
  ClipboardList,
  Wrench,
  Star,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  MessageSquare,
  Building,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Lead, SalesOrder, InstallationTask, CustomerFeedback } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

export const SalesCRMModule: React.FC = () => {
  const {
    leads,
    orders,
    installations,
    feedback,
    addLead,
    updateLeadStage,
    updateOrderStatus,
    updateInstallationStatus,
    addFeedback,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'leads' | 'orders' | 'installations' | 'feedback'>('leads');

  // New Lead Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'leadNumber' | 'createdAt'>>({
    clientName: '',
    clientType: 'Residential Villa',
    phone: '',
    email: '',
    spaceSizeSqFt: 6500,
    budgetEst: 45000,
    stage: 'New Inquiry',
    assignedDesigner: 'Lead Design Director',
    nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes: 'Initial inquiry regarding Italian marble dining table and modular living room sofa.',
  });

  // Log Follow-up state
  const [activeLeadForFollowup, setActiveLeadForFollowup] = useState<Lead | null>(null);
  const [followupNotes, setFollowupNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
  );

  // New Feedback Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCustomer, setFeedbackCustomer] = useState('');
  const [feedbackProject, setFeedbackProject] = useState('Emirates Hills Villa Fitout');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.clientName) return;

    addLead({
      ...newLead,
      budgetEst: Number(newLead.budgetEst),
      spaceSizeSqFt: Number(newLead.spaceSizeSqFt),
    });

    setIsLeadModalOpen(false);
    setNewLead({
      clientName: '',
      clientType: 'Residential Villa',
      phone: '',
      email: '',
      spaceSizeSqFt: 6500,
      budgetEst: 45000,
      stage: 'New Inquiry',
      assignedDesigner: 'Lead Design Director',
      nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSaveFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadForFollowup || !followupNotes) return;

    // Update notes and next follow-up date
    activeLeadForFollowup.notes = `${activeLeadForFollowup.notes}\n[${new Date().toLocaleDateString()}]: ${followupNotes}`;
    activeLeadForFollowup.nextFollowUpDate = nextFollowupDate;

    setActiveLeadForFollowup(null);
    setFollowupNotes('');
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCustomer || !feedbackReview) return;

    addFeedback({
      orderNumber: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: feedbackCustomer,
      projectType: feedbackProject,
      rating: feedbackRating,
      npsScore: 10,
      review: feedbackReview,
      testimonialApproved: true,
    });

    setIsFeedbackModalOpen(false);
    setFeedbackCustomer('');
    setFeedbackReview('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-700" />
            Customer & Sales Management (CRM)
          </h2>
          <p className="text-xs text-stone-500">
            Luxury client pipeline, consultative follow-ups, order execution, white-glove site installation, and client satisfaction.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition-all"
          >
            <Star className="w-3.5 h-3.5 text-amber-600" />
            <span>Record Client Review</span>
          </button>
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Lead Opportunity</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'leads'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Leads & Pipeline ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" /> Confirmed Sales Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('installations')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'installations'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Site Installation Coordination ({installations.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent hover:text-stone-800'
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Customer Reviews & CSAT ({feedback.length})
        </button>
      </div>

      {/* TAB 1: LEADS & PIPELINE */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['New Inquiry', 'Consultation', 'Site Measurement', '3D Proposal'] as const).map(
              (stage) => {
                const stageLeads = leads.filter((l) => l.stage === stage);
                const stageTotal = stageLeads.reduce((acc, l) => acc + l.budgetEst, 0);

                return (
                  <div
                    key={stage}
                    className="bg-stone-100/70 p-3.5 rounded-xl border border-stone-200 flex flex-col justify-between min-h-[420px]"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
                        <span className="font-semibold text-stone-800 text-xs truncate max-w-[170px]">
                          {stage}
                        </span>
                        <span className="text-[10px] font-bold bg-white text-stone-700 px-2 py-0.5 rounded-full border border-stone-300">
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-xs hover:border-amber-400 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-serif font-bold text-stone-900 text-xs">
                                  {lead.clientName}
                                </h4>
                                <span className="text-[9px] text-stone-400 font-mono">{lead.leadNumber}</span>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-amber-800">
                                {formatCurrency(lead.budgetEst)}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-600 line-clamp-2">
                              {lead.notes}
                            </p>

                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                              <span>Designer: {lead.assignedDesigner}</span>
                              <span className="bg-stone-100 px-1.5 py-0.5 rounded">{lead.clientType}</span>
                            </div>

                            <div className="text-[10px] text-stone-500 font-mono">
                              Next Follow-up: {formatDate(lead.nextFollowUpDate)}
                            </div>

                            {/* Action row */}
                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                              <button
                                onClick={() => setActiveLeadForFollowup(lead)}
                                className="text-[10px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3" /> Follow-up
                              </button>

                              <select
                                value={lead.stage}
                                onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                                className="text-[10px] bg-stone-50 border border-stone-200 rounded px-1 py-0.5 text-stone-700"
                              >
                                <option value="New Inquiry">New Inquiry</option>
                                <option value="Consultation">Consultation</option>
                                <option value="Site Measurement">Site Measurement</option>
                                <option value="3D Proposal">3D Proposal</option>
                                <option value="Quotation Sent">Quotation Sent</option>
                                <option value="Won / Order">Won / Order</option>
                                <option value="Lost">Lost</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 text-center text-[10px] text-stone-500">
                      Pipeline Volume: <strong className="font-mono text-stone-800">{formatCurrency(stageTotal)}</strong>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIRMED SALES ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Executive Sales Orders Execution Register
            </h3>
            <span className="text-xs text-stone-500">{orders.length} Orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order # / Date</th>
                  <th className="py-3 px-3">Client & Project</th>
                  <th className="py-3 px-3">Items Spec</th>
                  <th className="py-3 px-3 text-right">Order Value</th>
                  <th className="py-3 px-3 text-right">Advance Paid</th>
                  <th className="py-3 px-3">Delivery Schedule</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-stone-900">{ord.orderNumber}</div>
                      <div className="text-[10px] text-stone-400">{formatDate(ord.orderDate)}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400 truncate max-w-xs">{ord.deliveryAddress}</div>
                    </td>

                    <td className="py-3 px-3 text-stone-700">
                      {ord.items.length} Custom Pieces ({ord.projectType})
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(ord.amountPaid)}
                    </td>

                    <td className="py-3 px-3 font-mono text-stone-600">
                      {formatDate(ord.targetDeliveryDate)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(ord.productionStatus)}`}>
                        {ord.productionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SITE INSTALLATION COORDINATION */}
      {activeTab === 'installations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {installations.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Order Ref: {inst.orderNumber}
                  </span>
                  <h4 className="font-serif font-bold text-stone-900 text-sm mt-1">
                    {inst.clientName}
                  </h4>
                  <div className="text-xs text-stone-500">{inst.siteAddress}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(inst.status)}`}>
                  {inst.status}
                </span>
              </div>

              {/* Items description */}
              <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Scope / Items</span>
                {inst.itemsToInstall}
              </div>

              {/* Team & Site Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Site Supervisor</span>
                  <span className="font-medium text-stone-800">{inst.leadSupervisor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Scheduled Date</span>
                  <span className="font-medium text-stone-800">{formatDate(inst.scheduledDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Installation Crew</span>
                  <span className="text-stone-700">{inst.teamMembers.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Checklist Verified</span>
                  <span className="font-medium text-emerald-700">
                    {inst.siteChecklistComplete ? 'Passed (Walls & Floor Protected)' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Snags & Status Update Button */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  {inst.snagsReported ? `Snags: ${inst.snagsReported}` : 'No snags reported'}
                </span>
                {inst.status !== 'Completed & Approved' && (
                  <button
                    onClick={() => updateInstallationStatus(inst.id, 'Completed & Approved')}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[10px] font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Sign-off Handover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CUSTOMER FEEDBACK & CSAT */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedback.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{formatDate(f.completionDate)}</span>
                </div>

                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "{f.review}"
                </p>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-serif font-bold text-stone-900">{f.customerName}</div>
                    <span className="text-[10px] text-amber-800 font-medium">{f.projectType}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{f.orderNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add Lead */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Create New Lead Opportunity
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter luxury client details, prospective budget, and project scope.
            </p>

            <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  value={newLead.clientName}
                  onChange={(e) => setNewLead({ ...newLead, clientName: e.target.value })}
                  placeholder="e.g. Al-Mansoor Family Penthouse"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Space Type</label>
                  <select
                    value={newLead.clientType}
                    onChange={(e) => setNewLead({ ...newLead, clientType: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  >
                    <option value="Residential Villa">Residential Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Boutique Hotel">Boutique Hotel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Estimated Budget ($)</label>
                  <input
                    type="number"
                    min="5000"
                    required
                    value={newLead.budgetEst}
                    onChange={(e) => setNewLead({ ...newLead, budgetEst: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+971 50..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="client@luxury.ae"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Project Scope & Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="e.g. 5-Bedroom luxury turnkey fit-out in Dubai Hills"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Follow-up */}
      {activeLeadForFollowup && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Log Client Follow-Up
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Recording consultative touchpoint for <strong>{activeLeadForFollowup.clientName}</strong>
            </p>

            <form onSubmit={handleSaveFollowup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Next Follow-Up Date</label>
                <input
                  type="date"
                  required
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Discussion Notes</label>
                <textarea
                  rows={3}
                  required
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="e.g. Reviewed 3D renders of living room and finalized Italian walnut finish samples."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveLeadForFollowup(null)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  Record Touchpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Feedback */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Record Client Review & CSAT
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Post-installation handover review and rating.
            </p>

            <form onSubmit={handleSaveFeedback} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  value={feedbackCustomer}
                  onChange={(e) => setFeedbackCustomer(e.target.value)}
                  placeholder="e.g. Dr. Mansoor Al-Nuaimi"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Overall Rating</label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-bold text-amber-700"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Satisfactory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Project Scope</label>
                  <input
                    type="text"
                    required
                    value={feedbackProject}
                    onChange={(e) => setFeedbackProject(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Review & Comments</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackReview}
                  onChange={(e) => setFeedbackReview(e.target.value)}
                  placeholder="e.g. Flawless joinery and pristine sofa upholstery. Delivered on schedule."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  Submit CSAT Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
