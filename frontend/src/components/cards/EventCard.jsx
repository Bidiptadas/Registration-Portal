/** EventCard — event preview card for grid/list views. */
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';
export default function EventCard({ event }) {
  const statusVariant = event.isActive ? 'active' : 'closed';
  return (
    <Link to={`/events/${event.eventId}`} className="block rounded-xl overflow-hidden hover-lift" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
      <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600" style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2"><Badge variant={statusVariant}>{event.isActive ? 'Active' : 'Closed'}</Badge><span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{event.category}</span></div>
        <h3 className="font-semibold mb-1 line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>{event.title}</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>📅 {formatDate(event.date)} · 📍 {event.venue}</p>
        <div className="flex items-center justify-between text-xs"><span style={{ color: 'var(--color-text-muted)' }}>{event.availableSpots >= 0 ? `${event.availableSpots} spots left` : 'Unlimited'}</span></div>
      </div>
    </Link>
  );
}
