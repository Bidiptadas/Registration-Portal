import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { auth, db } from '../../firebase/firebaseConfig';
import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';
import { buildDashboardStats } from '../../utils/dashboardUtils';
import { formatDate } from '../../utils/formatDate';

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEventDate = (event) => toDate(event.date || event.startDate);
const isUpcoming = (event) => {
  const date = getEventDate(event);
  return Boolean(date && date >= new Date() && event.isActive !== false);
};
const getEventTime = (event) => event.time || [event.startTime, event.endTime].filter(Boolean).join(' - ') || 'Time to be announced';

const StatCard = ({ label, value, tone }) => (
  <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
    <p className="mt-2 text-3xl font-bold" style={{ color: tone || 'var(--color-text-primary)' }}>{value}</p>
  </div>
);

const EventSummary = ({ event, registrationStatus }) => {
  const availableSpots = event.availableSpots ?? Math.max(0, Number(event.maxParticipants || 0) - Number(event.currentRegistrations || 0));
  return (
    <article className="flex flex-col gap-4 rounded-xl p-4 sm:flex-row" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="h-28 w-full shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 bg-cover bg-center sm:w-36" style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{event.category || 'Event'}</p><h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{event.title || 'Untitled event'}</h3></div>
          {registrationStatus && <Badge variant="active">{registrationStatus}</Badge>}
        </div>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(getEventDate(event))} · {getEventTime(event)} · {event.venue || 'Venue to be announced'}</p>
        {!registrationStatus && <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{availableSpots ? `${availableSpots} seats available` : 'Capacity information unavailable'}</p>}
        <Link to={`/events/${event.eventId}`} className="mt-3 inline-flex text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>View Event</Link>
      </div>
    </article>
  );
};

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const [dashboard, setDashboard] = useState({ events: [], registrations: [], announcements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [eventResponse, registrationResponse] = await Promise.all([eventApi.getAll({ active_only: true }), registrationApi.getMyRegistrations()]);
        let announcements = [];
        if (!auth.isMock) {
          const snapshot = await getDocs(collection(db, 'announcements'));
          announcements = snapshot.docs.map((document) => ({ ...document.data(), announcementId: document.id }))
            .filter((item) => !item.expiryDate || toDate(item.expiryDate) >= new Date())
            .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0)).slice(0, 3);
        }
        if (!cancelled) setDashboard({ events: eventResponse.data.data.events || [], registrations: registrationResponse.data.data || [], announcements });
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load your dashboard. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDashboard();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) return <Loader />;
  if (error) return <section className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-danger)' }}><h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard unavailable</h1><p className="mt-2 text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p></section>;

  const { events, registrations, announcements } = dashboard;
  const stats = buildDashboardStats(events, registrations);
  const registrationByEventId = new Map(registrations.map((item) => [item.eventId, item]));
  const upcomingRegisteredEvents = events.filter((event) => registrationByEventId.get(event.eventId)?.status === 'registered' && isUpcoming(event)).slice(0, 3);
  const availableEvents = events.filter((event) => isUpcoming(event) && !registrationByEventId.has(event.eventId)).slice(0, 3);
  const recentRegistrations = [...registrations].sort((left, right) => (toDate(right.registeredAt)?.getTime() || 0) - (toDate(left.registeredAt)?.getTime() || 0)).slice(0, 4);
  const displayName = userProfile?.displayName || userProfile?.display_name || user?.displayName || 'Student';

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-2xl p-6 sm:flex-row sm:items-center" style={{ background: 'var(--gradient-primary)', color: '#fff' }}><div><p className="text-sm font-semibold uppercase tracking-wide opacity-80">Student home</p><h1 className="mt-2 text-3xl font-bold">Welcome, {displayName}!</h1><p className="mt-2 text-sm opacity-90">Here is your event activity at SIT.</p></div><Avatar src={userProfile?.profileImageUrl} name={displayName} size="xl" className="ring-4 ring-white/30" /></section>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard label="Registered Events" value={stats.registered} /><StatCard label="Upcoming Events" value={stats.upcoming} tone="var(--color-primary)" /><StatCard label="Completed Events" value={stats.completed} /><StatCard label="Available Events" value={stats.available} tone="var(--color-success)" /></section>
      <section><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Upcoming registered events</h2><Link to="/my-registrations" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>View all</Link></div>{upcomingRegisteredEvents.length ? <div className="grid gap-4 lg:grid-cols-2">{upcomingRegisteredEvents.map((event) => <EventSummary key={event.eventId} event={event} registrationStatus="Registered" />)}</div> : <EmptyState title="No upcoming registrations" description="Your next event registration will appear here." icon="📅" />}</section>
      <section><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Available events</h2><Link to="/events" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Browse events</Link></div>{availableEvents.length ? <div className="grid gap-4 lg:grid-cols-2">{availableEvents.map((event) => <EventSummary key={event.eventId} event={event} />)}</div> : <EmptyState title="No upcoming events available" description="Check back soon for new SIT events." icon="🎫" />}</section>
      <div className="grid gap-8 lg:grid-cols-2"><section><h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Recent registrations</h2>{recentRegistrations.length ? <div className="space-y-3">{recentRegistrations.map((registration) => <Link key={registration.registrationId} to={`/events/${registration.eventId}`} className="flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><div><p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{registration.eventTitle || 'Event registration'}</p><p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>Registered {formatDate(toDate(registration.registeredAt))}</p></div><Badge variant={registration.status === 'registered' ? 'active' : 'default'}>{registration.status}</Badge></Link>)}</div> : <EmptyState title="No registrations yet" description="Register for an event to see it here." icon="📝" />}</section><section><h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Announcements</h2>{announcements.length ? <div className="space-y-3">{announcements.map((announcement) => <article key={announcement.announcementId} className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{announcement.title}</p><p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{announcement.description}</p></article>)}</div> : <EmptyState title="No active announcements" description="Important SIT updates will appear here." icon="📢" />}</section></div>
      <section><h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Quick actions</h2><div className="flex flex-wrap gap-3"><Link to="/events" className="rounded-lg px-4 py-3 text-sm font-semibold" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>Browse Events</Link><Link to="/my-registrations" className="rounded-lg px-4 py-3 text-sm font-semibold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>My Registrations</Link><Link to="/profile" className="rounded-lg px-4 py-3 text-sm font-semibold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>My Profile</Link></div></section>
    </div>
  );
}
