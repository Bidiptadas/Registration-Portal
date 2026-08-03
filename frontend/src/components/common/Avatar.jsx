/** Avatar component with image and fallback initials. */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizes = { sm: '2rem', md: '2.5rem', lg: '3.5rem', xl: '5rem' };
  const fontSizes = { sm: '0.75rem', md: '0.875rem', lg: '1.25rem', xl: '1.5rem' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} style={{ width: sizes[size], height: sizes[size] }} />;
  return <div className={`flex items-center justify-center rounded-full font-semibold ${className}`} style={{ width: sizes[size], height: sizes[size], fontSize: fontSizes[size], background: 'var(--gradient-primary)', color: '#fff' }}>{initials || '?'}</div>;
}
