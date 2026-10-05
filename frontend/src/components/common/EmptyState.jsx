/** EmptyState — Clean "No data" placeholder. */
export default function EmptyState({
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  message,
  action,
}) {
  const desc = description || message || 'There is nothing to display here yet.';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center mb-4 text-slate-400">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)', maxWidth: '24rem' }}>
        {desc}
      </p>
      {action}
    </div>
  );
}
