/** ManageEventsPage — CRUD operations for events. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventApi from '../../services/eventApi';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/formatDate';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const toast = useNotification();

  async function loadEvents() {
    try {
      const res = await eventApi.getAll({ active_only: false });
      setEvents(res.data.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await eventApi.delete(deleteId);
      toast.success('Event deleted successfully.');
      loadEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const columns = [
    { key: 'title', label: 'Event Title' },
    { key: 'category', label: 'Category' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'venue', label: 'Venue' },
    { key: 'currentRegistrations', label: 'Registered' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/events/${row.eventId}/edit`)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(row.eventId)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Manage Events</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Add, edit, or delete event listings</p>
        </div>
        <Button onClick={() => navigate('/admin/events/new')}>+ Add Event</Button>
      </div>

      <DataTable columns={columns} data={events} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
