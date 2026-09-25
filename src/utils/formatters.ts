export function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function calculateTax(amount: number, ratePercent = 15): { taxable: number; tax: number; total: number } {
  const taxable = Number(amount) || 0;
  const tax = Number((taxable * (ratePercent / 100)).toFixed(2));
  const total = Number((taxable + tax).toFixed(2));
  return { taxable, tax, total };
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'delivered':
    case 'won / order':
    case 'completed & approved':
    case 'installed & signed off':
    case 'present':
    case 'active':
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'partial':
    case 'in-transit':
    case 'site measurement':
    case 'in production / procurement':
    case 'warehouse ready':
    case 'out for delivery':
    case 'in progress':
    case 'half day':
    case 'on-site':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'unpaid':
    case 'rejected':
    case 'lost':
    case 'overdue':
    case 'leave':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'draft':
    case 'new inquiry':
    case 'ordered':
    case 'scheduled':
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
}
