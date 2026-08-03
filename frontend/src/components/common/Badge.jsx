/** Badge component — colored status labels. */
const variants = { active: { bg: '#dcfce7', color: '#166534' }, closed: { bg: '#fee2e2', color: '#991b1b' }, pending: { bg: '#fef3c7', color: '#92400e' }, info: { bg: '#dbeafe', color: '#1e40af' }, default: { bg: '#f1f5f9', color: '#475569' } };
export default function Badge({ children, variant = 'default', className = '' }) {
  const style = variants[variant] || variants.default;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} style={{ backgroundColor: style.bg, color: style.color }}>{children}</span>;
}
