/** AdminDashboard — analytics and overview stats. */
import { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import StatsCard from '../../components/cards/StatsCard';
import Loader from '../../components/common/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminApi.getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Overview of Tecnophite statistics</p>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Students" value={stats.totalStudents} icon="🎓" color="var(--color-primary)" />
          <StatsCard title="Total Events" value={stats.totalEvents} icon="🎉" color="var(--color-secondary)" />
          <StatsCard title="Active Events" value={stats.activeEvents} icon="⚡" color="var(--color-success)" />
          <StatsCard title="Total Registrations" value={stats.totalRegistrations} icon="📋" color="var(--color-accent)" />
        </div>
      )}
    </div>
  );
}
