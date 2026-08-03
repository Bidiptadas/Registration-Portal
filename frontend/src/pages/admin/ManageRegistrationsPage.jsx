/** ManageRegistrationsPage — View and manage student registrations. */
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

  const statusColors = { registered: 'active', attended: 'info', cancelled: 'closed' };

  const columns = [
    { key: 'userName', label: 'Student' },
    { key: 'eventTitle', label: 'Event Name' },
    { key: 'registeredAt', label: 'Date', render: (row) => formatDate(row.registeredAt) },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'registered' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(row.registrationId, 'attended')}>Mark Attendance</Button>
              <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(row.registrationId, 'cancelled')}>Cancel</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Manage Registrations</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Track student participation and take attendance</p>
        </div>
        <Button onClick={handleExport} variant="secondary">📥 Export to CSV</Button>
      </div>

      <DataTable columns={columns} data={registrations} />
    </div>
  );
}
