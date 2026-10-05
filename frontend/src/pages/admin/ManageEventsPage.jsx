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

import Badge from '../../components/common/Badge';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const toast = useNotification();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = eventApi.subscribeToEvents(
      (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      },
      (error) => {
        console.error('Real-time events error:', error);
        toast.error('Failed to load events from Firestore');
        setLoading(false);
      },
      { active_only: false }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);


  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await eventApi.delete(deleteId);
      toast.success('Event deleted successfully.');
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete event: ' + (err.message || 'Unknown error'));
    }
  };

  const columns = [
    { key: 'title', label: 'Event Title' },
    { key: 'category', label: 'Category' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'venue', label: 'Venue' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'active' : 'closed'}>
          {row.status ? row.status.toUpperCase() : (row.isActive ? 'OPEN' : 'CLOSED')}
        </Badge>
      ),
    },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-1"
          >
            <span>←</span> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Manage Events</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Add, edit, or delete event listings</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/admin/events/new')}>+ Add Event</Button>
        </div>
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
