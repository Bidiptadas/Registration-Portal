/** MyRegistrationsPage — List of registered events. */
import { useEffect, useState } from 'react';
import registrationApi from '../../services/registrationApi';
import eventApi from '../../services/eventApi';
import RegistrationCard from '../../components/cards/RegistrationCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');
  const toast = useNotification();

  async function loadRegistrations() {
    try {
      setError('');
      const [registrationResponse, eventResponse] = await Promise.all([
        registrationApi.getMyRegistrations(),
        eventApi.getAll(),
      ]);
      const eventsById = new Map(eventResponse.data.data.events.map((event) => [event.eventId, event]));
      setRegistrations(registrationResponse.data.data.map((registration) => ({
        ...registration,
        event: eventsById.get(registration.eventId),
      })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await registrationApi.cancel(cancelId);
      toast.success('Registration cancelled successfully.');
      loadRegistrations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  if (loading) return <Loader />;

  const now = new Date();
  const isPast = (registration) => {
    const value = registration.event?.date;
    const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
    return date && date < now;
  };
  const groupedRegistrations = {
    upcoming: registrations.filter((registration) => registration.status === 'registered' && !isPast(registration)),
    completed: registrations.filter((registration) => registration.status === 'attended' || (registration.status === 'registered' && isPast(registration))),
    cancelled: registrations.filter((registration) => registration.status === 'cancelled'),
  };
  const visibleRegistrations = groupedRegistrations[activeTab];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>My Registrations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>View and manage your registered events</p>

      {error ? (
        <div className="rounded-xl p-5" style={{ border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}>{error}</div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Registration status">
            {Object.entries({ upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' }).map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={activeTab === key} onClick={() => setActiveTab(key)} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: activeTab === key ? 'var(--color-primary)' : 'var(--color-surface)', color: activeTab === key ? '#fff' : 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>{label} ({groupedRegistrations[key].length})</button>
            ))}
          </div>
          {visibleRegistrations.length === 0 ? (
            <EmptyState title={`No ${activeTab} registrations`} description="Your event registration activity will appear here." icon="📝" />
          ) : (
            <div className="flex flex-col gap-4 max-w-3xl">
              {visibleRegistrations.map((registration) => <RegistrationCard key={registration.registrationId} registration={registration} onCancel={activeTab === 'upcoming' ? setCancelId : undefined} />)}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Registration"
        message="Are you sure you want to cancel registration for this event?"
      />
    </div>
  );
}
