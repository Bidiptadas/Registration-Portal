import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import MemberCard from '../../components/cards/MemberCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';
import studentContentApi from '../../services/studentContentApi';
import associationApi from '../../services/associationApi';
import { buildDashboardStats } from '../../utils/dashboardUtils';
import { formatDate } from '../../utils/formatDate';
import './StudentDashboard.css';

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEventDate = (event) => toDate(event.date || event.startDate);
const isPast = (event) => {
  const date = getEventDate(event);
  return Boolean(date && date < new Date());
};
const isUpcoming = (event) => {
  return event.isActive !== false && !isPast(event);
};
const getEventTime = (event) => event.time || [event.startTime, event.endTime].filter(Boolean).join(' - ') || 'Time to be announced';

const StatCard = ({ label, value, tone }) => (
  <div className="student-stat-card">
    <p className="student-stat-card__label">{label}</p>
    <p className="student-stat-card__value" style={{ color: tone || '#fff' }}>{value}</p>
  </div>
);

const HERITAGE_CARDS = [
  {
    badge: 'Society of Jesus',
    title: 'The Jesuit Heritage',
    text: "St Joseph's University is run by a Catholic religious order known as the Society of Jesus (SJ). The members of the Society of Jesus are popularly known as the Jesuits. The origins of the Society of Jesus go back to Saint Ignatius of Loyola, a 16th century Spanish soldier. In 1521, he was seriously wounded in a battle against the French in Pamplona, Spain. Intense prayer over months of painful recuperation prompted a personal transformation. He gave up his military career and became a soldier for Jesus Christ possessed with a single vision of establishing a world of humanity and justice. He found friends who shared his vision and went on to establish the Society of Jesus in 1540.",
  },
  {
    badge: 'Global Mission',
    title: 'Jesuit Education',
    text: 'Saint Ignatius of Loyola had a keen desire to spread education and knowledge, media of liberation for a just and equitable society. The group he founded, the Society of Jesus, has been active in the field of education throughout the world since its origin. In the world, the Jesuits are responsible for 3,897 educational institutions in 96 countries. The education imparted by the Jesuits aims at the integral, personal formation of youth.',
  },
  {
    badge: 'University Motto',
    title: 'Fide et Labore',
    text: 'The patron of our university and model for us is Saint Joseph, the foster father of Jesus. A carpenter by profession, he toiled for his livelihood with deep faith in God. The motto of our university "fide et labore" which means "faith and toil" reflects the life and spirit of St Joseph. We want him to guide, protect and inspire us into a life of hard work and deep faith.',
  },
];

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState({
    events: [],
    registrations: [],
    announcements: [],
    achievements: [],
    members: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [
          eventRes,
          regRes,
          announcementRes,
          achievementRes,
          memberRes,
        ] = await Promise.allSettled([
          eventApi.getAll({ active_only: false }),
          registrationApi.getMyRegistrations(),
          studentContentApi.getAnnouncements(),
          studentContentApi.getAchievements(),
          associationApi.getMembers(),
        ]);

        if (!cancelled) {
          const events = (eventRes.status === 'fulfilled' && (eventRes.value?.data?.data?.events || eventRes.value?.data?.data)) || [];
          const registrations = (regRes.status === 'fulfilled' && regRes.value?.data?.data) || [];
          const announcements = (announcementRes.status === 'fulfilled' && announcementRes.value?.data?.data) || [];
          const achievements = (achievementRes.status === 'fulfilled' && achievementRes.value?.data?.data) || [];
          const members = (memberRes.status === 'fulfilled' && memberRes.value?.data?.data) || [];

          setContent({
            events,
            registrations,
            announcements,
            achievements,
            members,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const unsubscribeEvents = eventApi.subscribeToEvents(
      (updatedEvents) => {
        if (!cancelled) {
          setContent((prev) => ({ ...prev, events: updatedEvents }));
        }
      },
      (err) => console.warn('Real-time events dashboard warning:', err),
      { active_only: false }
    );

    return () => {
      cancelled = true;
      if (typeof unsubscribeEvents === 'function') {
        unsubscribeEvents();
      }
    };
  }, [user?.uid]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <section className="rounded-xl p-6" style={{ backgroundColor: 'rgba(11, 18, 34, 0.62)', border: '1px solid var(--color-danger)' }}>
        <h1 className="text-xl font-bold text-white">Dashboard unavailable</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
      </section>
    );
  }

  const { events, registrations, achievements, members } = content;
  const stats = buildDashboardStats(events, registrations);
  const displayName = userProfile?.displayName || userProfile?.display_name || user?.displayName || 'Student';

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <section className="student-dashboard__welcome">
        <div>
          <p className="home-page__eyebrow">Student home</p>
          <h1 className="student-dashboard__welcome-title">Welcome, {displayName}!</h1>
          <p className="student-dashboard__welcome-sub">Here is your event activity and updates from Technophite.</p>
        </div>
        <Avatar src={userProfile?.profileImageUrl} name={displayName} size="xl" className="ring-4 ring-white/20" />
      </section>

      {/* Summary Stats */}
      <section className="student-dashboard__stats">
        <StatCard label="Registered Events" value={stats.registered} />
        <StatCard label="Available Events" value={stats.available} tone="#38bdf8" />
      </section>

      {/* Pride in Progress — St Joseph's University Heritage */}
      <section className="home-achievements" aria-labelledby="heritage-title">
        <div className="home-section-heading">
          <div>
            <p className="home-page__eyebrow">Pride in progress</p>
            <h2 id="heritage-title">St. Joseph's University</h2>
          </div>
        </div>

        <div className="home-heritage__grid">
          {HERITAGE_CARDS.map((card) => (
            <article key={card.title} className="home-heritage-card">
              <div className="home-heritage-card__header">
                <span className="home-heritage-card__badge">{card.badge}</span>
                <h3 className="home-heritage-card__title">{card.title}</h3>
              </div>
              <p className="home-heritage-card__text">{card.text}</p>
            </article>
          ))}
        </div>

        {achievements.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            <div className="home-achievements__grid">
              {achievements.slice(0, 3).map((achievement) => (
                <article key={achievement.achievementId || achievement.id || achievement.title} className="home-achievement-card">
                  <div
                    className="home-achievement-card__image"
                    style={{ backgroundImage: achievement.imageUrl ? `url(${achievement.imageUrl})` : undefined }}
                    aria-label={achievement.title}
                    role="img"
                  >
                    {!achievement.imageUrl && (
                      <svg className="w-8 h-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                  </div>
                  <div className="home-achievement-card__body">
                    <div className="home-achievement-card__meta">
                      <Badge variant="pending">{achievement.category || 'Achievement'}</Badge>
                      {achievement.date && <time>{studentContentApi.formatDate(achievement.date)?.toLocaleDateString()}</time>}
                    </div>
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description || achievement.message}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Meet the Team */}
      <section className="home-info-section" aria-label="Technophite team">
        <div className="home-section-heading">
          <div>
            <p className="home-page__eyebrow">Association</p>
            <h2>Meet the Team</h2>
          </div>
          <Link
            to="/members"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-sky-500/10 transition-colors inline-flex items-center gap-1 shadow-sm"
            style={{ borderColor: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8' }}
          >
            <span>Meet all</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {members.slice(0, 3).map((member) => (
            <MemberCard key={member.memberId || member.id} member={member} />
          ))}
          {members.length === 0 && (
            <p className="home-panel-empty col-span-full">Team members will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
