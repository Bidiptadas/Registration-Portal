/** StatsCard — dashboard metric card. */
export default function StatsCard({ title, value, icon, color = 'var(--color-primary)' }) {
  return (
    <div
      className="flex items-center gap-6 rounded-2xl p-6 sm:p-8 hover-lift"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl text-3xl sm:text-4xl"
        style={{
          width: '4rem',
          height: '4rem',
          backgroundColor: `${color}15`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm sm:text-base font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </p>
        <p className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
