/** DataTable — sortable, filterable data table. */
export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{emptyMessage}</div>;
  }
  return (<div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}><table className="w-full text-sm"><thead><tr style={{ backgroundColor: 'var(--color-surface-secondary)' }}>{columns.map((col) => (<th key={col.key} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>{col.label}</th>))}</tr></thead><tbody>{data.map((row, i) => (<tr key={row.id || i} onClick={() => onRowClick?.(row)} className="transition-colors" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', cursor: onRowClick ? 'pointer' : 'default' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}>{columns.map((col) => (<td key={col.key} className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{col.render ? col.render(row) : row[col.key]}</td>))}</tr>))}</tbody></table></div>);
}
