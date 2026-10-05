/** ProfileForm — student profile edit form. */
import { useEffect, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ProfileForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState({
    display_name: initialData.displayName || initialData.display_name || '',
    phone: initialData.phone || '',
    college: initialData.college || initialData.collegeName || '',
  });

  useEffect(() => {
    setForm({
      display_name: initialData.displayName || initialData.display_name || '',
      phone: initialData.phone || '',
      college: initialData.college || initialData.collegeName || '',
    });
  }, [initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };
  const handleCancel = () => {
    setForm({
      display_name: initialData.displayName || initialData.display_name || '',
      phone: initialData.phone || '',
      college: initialData.college || initialData.collegeName || '',
    });
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="display_name"
        value={form.display_name}
        onChange={handleChange}
        required
      />
      <Input
        label="Contact Number"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <Input
        label="College Name"
        name="college"
        value={form.college}
        onChange={handleChange}
        required
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} disabled={loading}>Save Changes</Button>
        <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
      </div>
    </form>
  );
}
