import EmptyState from '../../components/common/EmptyState';

export default function StudentPlaceholderPage({ title, description }) {
  return (
    <section className="max-w-3xl mx-auto rounded-xl p-6" style={{ backgroundColor: 'rgba(11, 18, 34, 0.72)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>{title}</h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>{description}</p>
      <EmptyState title="No information available" description="Content will appear here when it is available." />
    </section>
  );
}
