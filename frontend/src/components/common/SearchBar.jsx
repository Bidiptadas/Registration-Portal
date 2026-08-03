/** SearchBar — debounced search input. */
import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';
export default function SearchBar({ onSearch, placeholder = 'Search...', className = '' }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => { onSearch(debouncedQuery); }, [debouncedQuery]);
  return (<div className={`relative ${className}`}><span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>🔍</span><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }} /></div>);
}
