/** MyRegistrationsPage — List of registered events. */
import { useEffect, useState } from 'react';
import registrationApi from '../../services/registrationApi';
import RegistrationCard from '../../components/cards/RegistrationCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const toast = useNotification();

  async function loadRegistrations() {
    try {
      const res = await registrationApi.getMyRegistrations();
      setRegistrations(res.data.data);
    } catch (err) {
      console.error(err);
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

  const activeRegs = registrations.filter(r => r.status === 'registered');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>My Registrations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>View and manage your registered events</p>

      {activeRegs.length === 0 ? (
        <EmptyState title="No registered events" description="Explore the events section and register for some events!" icon="📝" />
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {activeRegs.map(reg => (
            <RegistrationCard key={reg.registrationId} registration={reg} onCancel={setCancelId} />
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
