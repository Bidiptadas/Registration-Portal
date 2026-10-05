/** RegistrationCard — registration summary card. */
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';
const statusMap = { registered: 'active', attended: 'info', cancelled: 'closed' };
export default function RegistrationCard({ registration }) {
  const event = registration.event;
  return (<div className="flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}><div><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{registration.eventTitle || event?.title || 'Event registration'}</h3><p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{event?.date ? `${formatDate(event.date)} · ${event.time || event.venue || ''}` : `Registered on ${formatDate(registration.registeredAt)}`}</p><p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>Registration ID: {registration.registrationId}</p></div><div className="flex flex-wrap items-center gap-3"><Badge variant={statusMap[registration.status] || 'default'}>{registration.status}</Badge>{registration.eventId && <Link to={`/events/${registration.eventId}`} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>View Event</Link>}</div></div>);
}
