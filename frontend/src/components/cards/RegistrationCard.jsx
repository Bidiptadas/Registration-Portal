/** RegistrationCard — registration summary card. */
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';
const statusMap = { registered: 'active', attended: 'info', cancelled: 'closed' };
export default function RegistrationCard({ registration, onCancel }) {
  return (<div className="flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}><div><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{registration.eventTitle}</h3><p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Registered on {formatDate(registration.registeredAt)}</p></div><div className="flex items-center gap-3"><Badge variant={statusMap[registration.status] || 'default'}>{registration.status}</Badge>{registration.status === 'registered' && onCancel && (<button onClick={() => onCancel(registration.registrationId)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>Cancel</button>)}</div></div>);
}
