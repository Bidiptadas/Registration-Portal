import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import studentContentApi from '../../services/studentContentApi';

import Footer from '../../components/navigation/Footer';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    studentContentApi.getAnnouncementById(id)
      .then((response) => { setAnnouncement(response.data.data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <Loader fullScreen />;
  if (status === 'error') return <EmptyState title="Announcement not found" description="This announcement may no longer be available." />;

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-background)' }}>
      <main className="mx-auto max-w-3xl px-6 py-12 flex-1 w-full">
        <Link to="/" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>← Back to Home</Link>
        <article className="mt-6 rounded-2xl p-7" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-wrap items-center gap-2"><Badge variant={announcement.isImportant ? 'pending' : 'info'}>{announcement.category || 'Announcement'}</Badge>{announcement.isImportant && <Badge variant="closed">Important</Badge>}</div>
          <h1 className="mt-4 text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{announcement.title}</h1>
          {announcement.createdAt && <time className="mt-3 block text-sm" style={{ color: 'var(--color-text-muted)' }}>{studentContentApi.formatDate(announcement.createdAt)?.toLocaleDateString()}</time>}
          <p className="mt-8 whitespace-pre-line text-base leading-8" style={{ color: 'var(--color-text-secondary)' }}>{announcement.message || announcement.description}</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}