/** EmptyState — "No data" placeholder with illustration. */
export default function EmptyState({ title = 'No data found', description = 'There is nothing to display here yet.', action, icon = '📭' }) {
  return (<div className="flex flex-col items-center justify-center py-16 text-center"><span className="text-6xl mb-4">{icon}</span><h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3><p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', maxWidth: '24rem' }}>{description}</p>{action && action}</div>);
}
