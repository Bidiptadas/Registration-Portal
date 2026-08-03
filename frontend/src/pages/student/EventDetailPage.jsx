/** EventDetailPage — details for a single event + registration button. */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import { useNotification } from '../../context/NotificationContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useNotification();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const [eventRes, regsRes] = await Promise.all([
          eventApi.getById(id),
          registrationApi.getMyRegistrations()
        ]);
        const ev = eventRes.data.data;
        setEvent(ev);
        setIsRegistered(regsRes.data.data.some(r => r.eventId === id && r.status === 'registered'));
      } catch (err) {
        console.error(err);
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registrationApi.register(id);
      setIsRegistered(true);
      toast.success('Successfully registered!');
      // Refresh event count
      const updatedRes = await eventApi.getById(id);
      setEvent(updatedRes.data.data);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600" style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={event.isActive ? 'active' : 'closed'}>{event.isActive ? 'Active' : 'Closed'}</Badge>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{event.category.toUpperCase()}</span>
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{event.title}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{event.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Date & Time</p>
            <p className="text-sm font-semibold">{formatDate(event.date)} · {event.time}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Venue</p>
            <p className="text-sm font-semibold">{event.venue}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Event Head</p>
            <p className="text-sm font-semibold">{event.eventHeadName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Contact</p>
            <p className="text-sm font-semibold">{event.eventHeadPhone || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Available spots: <strong style={{ color: 'var(--color-text-primary)' }}>{event.availableSpots >= 0 ? event.availableSpots : 'Unlimited'}</strong>
          </span>
          {isRegistered ? (
            <Button variant="secondary" disabled>✓ Registered</Button>
          ) : (
            <Button onClick={handleRegister} loading={registering} disabled={!event.isActive || event.availableSpots === 0}>
              Register Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
