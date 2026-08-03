/**
 * Loader component — spinner with optional full-screen mode.
 */

export default function Loader({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: '1.5rem', md: '2.5rem', lg: '3.5rem' };

  const spinner = (
    <div
      className="animate-spin rounded-full border-4 border-current"
      style={{
        width: sizes[size],
        height: sizes[size],
        borderColor: 'var(--color-border)',
        borderTopColor: 'var(--color-primary)',
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
