/** StudentDashboard — Personalized dashboard for students. */
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StatsCard from '../../components/cards/StatsCard';
import registrationApi from '../../services/registrationApi';
import eventApi from '../../services/eventApi';
import Loader from '../../components/common/Loader';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ registeredCount: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [regsRes, eventsRes] = await Promise.all([
          registrationApi.getMyRegistrations(),
          eventApi.getAll({ limit: 100 })
        ]);
        const activeRegs = regsRes.data.data.filter(r => r.status === 'registered');
        setStats({
          registeredCount: activeRegs.length,
          upcomingEvents: eventsRes.data.data.events?.length || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Welcome back, {userProfile?.displayName}!
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Here is your Tecnophite overview.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <StatsCard title="Registered Events" value={stats.registeredCount} icon="📝" color="var(--color-primary)" />
        <StatsCard title="Available Events" value={stats.upcomingEvents} icon="🎉" color="var(--color-secondary)" />
      </div>
    </div>
  );
}
