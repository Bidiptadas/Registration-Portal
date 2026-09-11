/** EventCard — event preview card for grid/list views. */
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';
export default function EventCard({ event }) {
  const deadline = event.registrationDeadline?.toDate ? event.registrationDeadline.toDate() : new Date(event.registrationDeadline);
  const deadlinePassed = event.registrationDeadline && deadline < new Date();
  const availableSpots = event.availableSpots ?? Math.max(0, Number(event.maxParticipants || 0) - Number(event.currentRegistrations || 0));
  const isClosed = event.isActive === false || deadlinePassed;
  const statusVariant = !isClosed ? 'active' : 'closed';
  return (
    <Link to={`/events/${event.eventId}`} className="block rounded-xl overflow-hidden hover-lift" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
      <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600" style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2"><Badge variant={statusVariant}>{event.isRegistered ? 'Registered' : (isClosed ? 'Closed' : 'Open')}</Badge><span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{event.category}</span></div>
        <h3 className="font-semibold mb-1 line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>{event.title}</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>📅 {formatDate(event.date)} · 📍 {event.venue}</p>
        <div className="flex items-center justify-between text-xs"><span style={{ color: 'var(--color-text-muted)' }}>{availableSpots > 0 ? `${availableSpots} spots left` : (event.maxParticipants ? 'Registration Full' : 'Availability pending')}</span><span className="font-semibold" style={{ color: 'var(--color-primary)' }}>View Details</span></div>
      </div>
    </Link>
  );
}
