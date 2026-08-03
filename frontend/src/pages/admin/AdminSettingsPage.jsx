/** AdminSettingsPage — System configurations. */
import { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ app_name: '', max_events_per_student: 5, registration_open: true, maintenance_mode: false, contact_email: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useNotification();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminApi.getSettings();
        const s = res.data.data;
        setForm({
          app_name: s.appName,
          max_events_per_student: s.maxEventsPerStudent,
          registration_open: s.registrationOpen,
          maintenance_mode: s.maintenanceMode,
          contact_email: s.contactEmail,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.updateSettings(form);
      toast.success('System settings saved successfully!');
    } catch {
      toast.error('Failed to update system settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-xl mx-auto rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>System Settings</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Configure global registration flags and limits</p>

      <form onSubmit={handleSubmit}>
        <Input label="Application Name" name="app_name" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} required />
        <Input label="Max Event Registrations Per Student" name="max_events_per_student" type="number" value={form.max_events_per_student} onChange={(e) => setForm({ ...form, max_events_per_student: Number(e.target.value) })} required />
        <Input label="Contact Email Address" name="contact_email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />

        <div className="flex flex-col gap-3 mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.registration_open} onChange={(e) => setForm({ ...form, registration_open: e.target.checked })} />
            <span className="text-sm font-semibold">Enable Registration Flow</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.maintenance_mode} onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>Enable Maintenance Mode</span>
          </label>
        </div>

        <Button type="submit" loading={submitting} fullWidth>Save Configurations</Button>
      </form>
    </div>
  );
}
