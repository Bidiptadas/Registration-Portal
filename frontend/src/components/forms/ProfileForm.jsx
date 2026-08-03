/** ProfileForm — student profile edit form. */
import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { ACADEMIC_YEARS } from '../../config/constants';
export default function ProfileForm({ initialData = {}, onSubmit, loading = false }) {
  const [form, setForm] = useState({ display_name: '', phone: '', college: '', department: '', year: 1, roll_number: '', ...initialData });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };
  return (<form onSubmit={handleSubmit}><Input label="Full Name" name="display_name" value={form.display_name} onChange={handleChange} required /><Input label="Phone" name="phone" value={form.phone} onChange={handleChange} /><Input label="College" name="college" value={form.college} onChange={handleChange} /><div className="grid grid-cols-2 gap-4"><Input label="Department" name="department" value={form.department} onChange={handleChange} /><div className="mb-4"><label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Year</label><select name="year" value={form.year} onChange={handleChange} className="w-full rounded-lg p-2.5 text-sm" style={{ backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>{ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}</select></div></div><Input label="Roll Number" name="roll_number" value={form.roll_number} onChange={handleChange} /><Button type="submit" loading={loading} fullWidth className="mt-2">Update Profile</Button></form>);
}
