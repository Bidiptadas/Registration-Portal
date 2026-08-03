/** Toast notification component. */
import { useNotification } from '../../context/NotificationContext';
const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#0ea5e9' };
export default function Toast() {
  const { notifications, removeNotification } = useNotification();
  if (notifications.length === 0) return null;
  return (<div className="fixed top-4 right-4 z-50 flex flex-col gap-2">{notifications.map((n) => (<div key={n.id} className="animate-slide-in-right flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderLeft: `4px solid ${colors[n.type]}`, minWidth: '280px' }}><span className="flex-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>{n.message}</span><button onClick={() => removeNotification(n.id)} className="text-lg leading-none" style={{ color: 'var(--color-text-muted)' }}>×</button></div>))}</div>);
}
