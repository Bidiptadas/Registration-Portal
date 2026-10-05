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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>My Registrations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>View and manage your registered events</p>

      {error ? (
        <div className="rounded-xl p-5" style={{ border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}>{error}</div>
      ) : registrations.length === 0 ? (
        <EmptyState title="No registrations yet" description="Your event registration activity will appear here." />
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {registrations.map((registration) => (
            <RegistrationCard
              key={registration.registrationId}
              registration={registration}
              onCancel={registration.status === 'registered' ? setCancelId : undefined}
            />
          ))}
        </div>
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
