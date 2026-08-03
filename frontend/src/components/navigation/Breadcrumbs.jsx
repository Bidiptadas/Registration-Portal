/** Breadcrumbs — breadcrumb trail navigation. */
import { Link } from 'react-router-dom';
export default function Breadcrumbs({ items = [] }) {
  return (<nav className="flex items-center gap-2 text-sm mb-4">{items.map((item, i) => (<span key={i} className="flex items-center gap-2">{i > 0 && <span style={{ color: 'var(--color-text-muted)' }}>/</span>}{item.href ? (<Link to={item.href} style={{ color: 'var(--color-primary)' }}>{item.label}</Link>) : (<span style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>)}</span>))}</nav>);
}
