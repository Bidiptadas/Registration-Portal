/** ManageRegistrationsPage — View and manage student registrations with payment tracking. */
import { useEffect, useState } from 'react';
import registrationApi from '../../services/registrationApi';
import adminApi from '../../services/adminApi';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportUtils';
import { useNotification } from '../../context/NotificationContext';

export default function ManageRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const toast = useNotification();

  async function loadRegistrations() {
    try {
      const res = await registrationApi.getAll({ limit: 100 });
      setRegistrations(res.data.data.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await registrationApi.updateStatus(id, status);
      toast.success('Status updated successfully');
      loadRegistrations();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportRegistrations();
      exportToCSV(res.data.data.registrations, 'tecnophite_registrations.csv');
      toast.success('Registration report exported successfully.');
    } catch {
      toast.error('Export failed');
    }
  };

  // Metrics calculation
  const totalRegistrations = registrations.length;
  const successfulPayments = registrations.filter(
    (r) => (r.paymentStatus || '').toUpperCase() === 'SUCCESS' || r.registrationStatus === 'CONFIRMED'
  ).length;
  const pendingPayments = registrations.filter(
    (r) => (r.paymentStatus || '').toUpperCase() === 'PENDING' || r.registrationStatus === 'PAYMENT_PENDING'
  ).length;
  const totalAmountCollected = registrations
    .filter((r) => (r.paymentStatus || '').toUpperCase() === 'SUCCESS' || r.registrationStatus === 'CONFIRMED')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Filter registrations based on selected payment status
  const filteredRegistrations = registrations.filter((r) => {
    if (statusFilter === 'ALL') return true;
    const pStatus = (r.paymentStatus || (Number(r.amount) > 0 ? 'PENDING' : 'SUCCESS')).toUpperCase();
    if (statusFilter === 'SUCCESS') return pStatus === 'SUCCESS';
    if (statusFilter === 'PENDING') return pStatus === 'PENDING';
    if (statusFilter === 'FAILED') return pStatus === 'FAILED';
    return true;
  });

  const getPaymentBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'SUCCESS') return <Badge variant="active">SUCCESS</Badge>;
    if (s === 'PENDING') return <Badge variant="warning">PENDING</Badge>;
    return <Badge variant="closed">{s}</Badge>;
  };

  const getRegStatusBadge = (regStatus, status) => {
    const s = (regStatus || (status === 'registered' ? 'CONFIRMED' : 'PAYMENT_PENDING')).toUpperCase();
    if (s === 'CONFIRMED' || s === 'REGISTERED') return <Badge variant="active">CONFIRMED</Badge>;
    if (s === 'ATTENDED') return <Badge variant="info">ATTENDED</Badge>;
    if (s === 'CANCELLED') return <Badge variant="closed">CANCELLED</Badge>;
    return <Badge variant="warning">PAYMENT_PENDING</Badge>;
  };

  const columns = [
    {
      key: 'eventTitle',
      label: 'Event',
      render: (row) => (
        <div>
          <span className="font-semibold block" style={{ color: 'var(--color-text-primary)' }}>
            {row.eventName || row.eventTitle || 'College Event'}
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
            ID: {row.eventId?.substring(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      key: 'participant',
      label: 'Participant',
      render: (row) => (
        <div>
          <span className="font-medium block" style={{ color: 'var(--color-text-primary)' }}>
            {row.participantName || row.userName || 'Student'}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {row.email || row.userEmail || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'registrationId',
      label: 'Registration ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {row.registrationId}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-bold text-sm" style={{ color: Number(row.amount) > 0 ? 'var(--color-primary)' : 'inherit' }}>
          {Number(row.amount) > 0 ? `₹${row.amount}` : 'Free'}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (row) => getPaymentBadge(row.paymentStatus || (Number(row.amount) > 0 ? 'PENDING' : 'SUCCESS')),
    },
    {
      key: 'registrationStatus',
      label: 'Registration Status',
      render: (row) => getRegStatusBadge(row.registrationStatus, row.status),
    },
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (row) => (
        <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {row.paymentId || (row.paymentStatus === 'PENDING' ? '—' : 'FREE_EVENT')}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registration Date',
      render: (row) => formatDate(row.paidAt || row.registeredAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {(row.status === 'registered' || row.registrationStatus === 'CONFIRMED') && (
            <>
              <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(row.registrationId, 'attended')}>
                Mark Attendance
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(row.registrationId, 'cancelled')}>
                Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Manage Registrations & Payments
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Track registrations, verify payment statuses, and monitor total revenue collected.
          </p>
        </div>
        <Button onClick={handleExport} variant="secondary">
          Export to CSV
        </Button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-xl border space-y-1"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Total Registrations
          </p>
          <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            {totalRegistrations}
          </p>
        </div>

        <div
          className="p-4 rounded-xl border space-y-1"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs uppercase font-semibold text-green-500">
            Successful Payments
          </p>
          <p className="text-2xl font-black text-green-500">
            {successfulPayments}
          </p>
        </div>

        <div
          className="p-4 rounded-xl border space-y-1"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs uppercase font-semibold text-amber-500">
            Pending Payments
          </p>
          <p className="text-2xl font-black text-amber-500">
            {pendingPayments}
          </p>
        </div>

        <div
          className="p-4 rounded-xl border space-y-1"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs uppercase font-semibold" style={{ color: 'var(--color-primary)' }}>
            Total Amount Collected
          </p>
          <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
            ₹{totalAmountCollected.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg p-1 border gap-1" style={{ borderColor: 'var(--color-border)' }}>
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                statusFilter === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Registrations' : `${tab} Payments`}
            </button>
          ))}
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Showing {filteredRegistrations.length} of {registrations.length} entries
        </span>
      </div>

      {/* Registrations Table */}
      <DataTable columns={columns} data={filteredRegistrations} />
    </div>
  );
}
