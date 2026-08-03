/**
 * Button component — primary, secondary, danger, ghost variants with loading state.
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    outline: 'none',
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.875rem 1.75rem', fontSize: '1rem' },
    lg: { padding: '1.125rem 2.25rem', fontSize: '1.125rem' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'var(--color-surface-secondary)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: '#ffffff',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      className={`hover-lift ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin rounded-full border-2 border-current"
          style={{ width: '1rem', height: '1rem', borderTopColor: 'transparent' }}
        />
      )}
      {children}
    </button>
  );
}
