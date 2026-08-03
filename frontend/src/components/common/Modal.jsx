/** Modal component — accessible dialog overlay. */
import { useEffect } from 'react';
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => { if (isOpen) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  if (!isOpen) return null;
  const sizes = { sm: '24rem', md: '32rem', lg: '48rem' };
  return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}><div className="animate-scale-in w-full rounded-xl p-6" style={{ maxWidth: sizes[size], backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>{title && <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>}{children}</div></div>);
}
