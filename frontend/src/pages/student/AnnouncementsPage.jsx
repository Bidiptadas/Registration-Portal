import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import studentContentApi from '../../services/studentContentApi';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;
    studentContentApi.getAnnouncements()
      .then((response) => {
        if (isMounted) {
          setAnnouncements(response.data.data || []);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (isMounted) setStatus('error');
      });
    return () => { isMounted = false; };
  }, []);

  if (status === 'loading') return <Loader fullScreen />;
  if (status === 'error') return <EmptyState title="Announcements unavailable" description="Please try again later." />;

  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Announcements</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Updates from the association and university.</p>
      {announcements.length === 0 ? <EmptyState title="No announcements yet" description="New updates will appear here." /> : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.announcementId || announcement.id || announcement.title} className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{announcement.title}</h2>
              <p className="mt-2 text-sm whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>{announcement.message || announcement.description}</p>
              {announcement.createdAt && <time className="block mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{studentContentApi.formatDate(announcement.createdAt)?.toLocaleDateString()}</time>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
