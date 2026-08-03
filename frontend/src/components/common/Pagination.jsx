/** Pagination controls component. */
import Button from './Button';
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (<div className="flex items-center justify-center gap-2 mt-6"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</Button><span className="text-sm px-3" style={{ color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span><Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next →</Button></div>);
}
