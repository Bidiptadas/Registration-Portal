/**
 * EventDetailModal
 * Shows full event details in a slide-up modal overlay.
 * Includes real-time registration status + register / payment flow.
 */
import { useEffect, useState } from 'react';
import Badge from './Badge';
import Button from './Button';
import Loader from './Loader';
import { formatDate } from '../../utils/formatDate';
import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';
import { useNotification } from '../../context/NotificationContext';

const asDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function EventDetailModal({ eventId, onClose }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const toast = useNotification();

  // ── Load event + registration status ──────────────────
  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setConfirmed(false);

    let unsubEvent = null;
    let unsubReg = null;

    try {
      unsubEvent = eventApi.subscribeToEvent(eventId, (ev) => {
        setEvent(ev);
        setLoading(false);
      });
    } catch {
      eventApi.getById(eventId)
        .then((res) => setEvent(res.data.data))
        .catch(() => toast.error('Could not load event'))
        .finally(() => setLoading(false));
    }

    try {
      unsubReg = registrationApi.subscribeToMyRegistrations((regs) => {
        setIsRegistered(regs.some((r) => r.eventId === eventId && r.status === 'registered'));
      });
    } catch { /* ignore */ }

    return () => {
      if (unsubEvent) unsubEvent();
      if (unsubReg) unsubReg();
    };
  }, [eventId]);

  // ── Close on Escape key ────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ── Register handler ───────────────────────────────────
  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registrationApi.register(eventId);
      setIsRegistered(true);
      setConfirmed(true);
      toast.success('Successfully registered!');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  // ── Derived values ─────────────────────────────────────
  const eventDate = event ? asDate(event.date) : null;
  const deadline = event ? asDate(event.registrationDeadline) : null;
  const currentRegistrations = Number(event?.currentRegistrations || 0);
  const maxParticipants = Number(event?.maxParticipants ?? event?.max_participants ?? 0);
  const availableSpots = event?.availableSpots ?? (maxParticipants ? Math.max(0, maxParticipants - currentRegistrations) : null);
  const deadlinePassed = Boolean(deadline && deadline < new Date());
  const registrationClosed = event?.isActive === false || deadlinePassed;
  const eventCompleted = Boolean(eventDate && eventDate < new Date());
  const teamHeads = Array.isArray(event?.teamHeads) ? event.teamHeads : [];

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* ── Panel ── */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Close"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader /></div>
        ) : !event ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>Event not found.</div>
        ) : (
          <>
            {/* ── Hero Banner ── */}
            <div
              className="min-h-[160px] w-full bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 flex flex-col justify-end p-5 relative overflow-hidden"
              style={{
                backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={event.isActive ? 'active' : 'closed'}>
                    {isRegistered ? '✓ Registered' : (event.isActive ? 'Open' : 'Closed')}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}>
                    {event.category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {event.title}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Confirmed Banner ── */}
              {confirmed && (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                  <span className="text-xl">✓</span>
                  <div>
                    <p className="font-bold text-sm">Registration Confirmed!</p>
                    <p className="text-xs">You're all set for {event.title}.</p>
                  </div>
                </div>
              )}

              {/* ── Description ── */}
              {event.description && (
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{event.description}</p>
                </div>
              )}

              {/* ── Info Grid ── */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Date & Time</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {eventDate ? formatDate(eventDate) : 'Date TBA'} · {event.time || 'Time TBA'}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Venue</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{event.venue || 'Venue TBA'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Seats</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {maxParticipants ? `${currentRegistrations} / ${maxParticipants} filled` : `${currentRegistrations} registered`}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Registration Fee</p>
                  <p className="text-sm font-semibold" style={{ color: Number(event.registrationFee) > 0 ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    {Number(event.registrationFee) > 0 ? `₹${event.registrationFee}` : 'Free'}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Eligibility</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{event.eligibility || 'Open to all students'}</p>
                </div>
              </div>

              {/* ── Team Heads ── */}
              {teamHeads.length > 0 && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Event Head(s)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teamHeads.map((head, i) => (
                      <div key={i} className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{head.name}</p>
                        {head.contact && <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{head.contact}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Rules ── */}
              {event.rules?.length > 0 && (
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Rules</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {event.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                  </ul>
                </div>
              )}

              {/* ── Brochure — displayed directly inline ── */}
              {event.brochureUrl && (
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    Event Brochure
                  </p>
                  <div
                    className="rounded-xl overflow-hidden border flex items-center justify-center p-2"
                    style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    {event.brochureUrl.toLowerCase().includes('.pdf') ? (
                      <iframe
                        src={event.brochureUrl}
                        title="Event Brochure"
                        width="100%"
                        height="480"
                        style={{ display: 'block', border: 'none', background: '#fff' }}
                      />
                    ) : (
                      <img
                        src={event.brochureUrl}
                        alt="Event Brochure"
                        className="w-full max-h-[500px] object-contain rounded-lg"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              )}


              {/* ── Register CTA ── */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Available spots:{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {availableSpots === null ? 'Not specified' : availableSpots}
                  </strong>
                </span>

                {isRegistered ? (
                  <Button variant="secondary" disabled>✓ Registered</Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                    loading={registering}
                    disabled={registrationClosed || eventCompleted || availableSpots === 0}
                  >
                    {registrationClosed || eventCompleted
                      ? 'Registration Closed'
                      : availableSpots === 0
                        ? 'Event Full'
                        : Number(event.registrationFee) > 0
                          ? `Register · ₹${event.registrationFee}`
                          : 'Register Now'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
