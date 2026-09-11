/** ProfileForm — student profile edit form. */
import { useEffect, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { ACADEMIC_YEARS } from '../../config/constants';
export default function ProfileForm({ initialData = {}, onSubmit, onCancel, onImageChange, loading = false }) {
  const [form, setForm] = useState({ display_name: '', phone: '', year: 1, ...initialData });

  useEffect(() => {
    setForm({ display_name: '', phone: '', year: 1, ...initialData });
  }, [initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };
  const handleCancel = () => {
    setForm({ display_name: '', phone: '', year: 1, ...initialData });
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" name="display_name" value={form.display_name || form.displayName || ''} onChange={handleChange} required />
      <Input label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} required />
      <div>
        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }} htmlFor="profile-image">
          Profile picture
        </label>
        <input id="profile-image" name="profileImage" type="file" accept="image/*" onChange={(event) => onImageChange?.(event.target.files?.[0] || null)} />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }} htmlFor="year">Year</label>
        <select id="year" name="year" value={form.year || 1} onChange={handleChange} className="w-full rounded-lg p-2.5 text-sm" style={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
          {ACADEMIC_YEARS.map((year) => <option key={year.value} value={year.value}>{year.label}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={loading} disabled={loading}>Save Changes</Button>
        <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}
