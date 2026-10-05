/** EventCard — event preview card. Calls onSelect(eventId) instead of navigating. */
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';

export default function EventCard({ event, onSelect }) {
  const deadline = event.registrationDeadline?.toDate ? event.registrationDeadline.toDate() : new Date(event.registrationDeadline);
  const deadlinePassed = event.registrationDeadline && deadline < new Date();
  const isClosed = event.isActive === false || deadlinePassed;
  const statusVariant = !isClosed ? 'active' : 'closed';
  const teamHeads = Array.isArray(event.teamHeads) ? event.teamHeads : [];
  const spots = event.availableSpots ?? Math.max(0, Number(event.maxParticipants || 0) - Number(event.currentRegistrations || 0));

  return (
    <button
      type="button"
      onClick={() => onSelect(event.eventId)}
      className="block w-full text-left rounded-xl overflow-hidden hover-lift transition-all border flex flex-col h-full cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Banner Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Status + Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={statusVariant}>
            {event.isRegistered ? 'Registered' : (isClosed ? 'Closed' : 'Open')}
          </Badge>
          <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-primary)' }}>
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-1.5 line-clamp-1 text-left" style={{ color: 'var(--color-text-primary)' }}>
          {event.title}
        </h3>

        {/* Date & Venue */}
        <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{event.date ? formatDate(event.date) : 'Date TBA'}</span>
          <span>·</span>
          <span className="truncate">{event.venue || 'Venue TBA'}</span>
        </p>

        {/* Eligibility */}
        {event.eligibility && (
          <div className="mb-3 text-xs rounded-lg p-2.5 border text-left" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Eligibility: </span>
            <span className="line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{event.eligibility}</span>
          </div>
        )}

        {/* Team Heads */}
        {teamHeads.length > 0 && (
          <div className="mb-3 text-xs text-left" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Team Head{teamHeads.length > 1 ? 's' : ''}: {' '}
            </span>
            <span className="line-clamp-2">
              {teamHeads.map((head, idx) => (
                <span key={idx} className="inline-block mr-2">
                  {head.name}{head.contact ? ` (${head.contact})` : ''}{idx < teamHeads.length - 1 ? ',' : ''}
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between text-xs border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {spots > 0 ? `${spots} spots left` : 'Full capacity'}
          </span>
          <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
            View Details <span>→</span>
          </span>
        </div>
      </div>
    </button>
  );
}
