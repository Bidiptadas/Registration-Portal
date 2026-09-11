import { useState } from 'react';

export default function HelpDeskPage() {
  const [message, setMessage] = useState('');
  const supportEmail = 'tecnophite.support@college.edu';

  const handleSubmit = (event) => {
    event.preventDefault();
    window.location.href = `mailto:${supportEmail}?subject=Registration Portal Support&body=${encodeURIComponent(message)}`;
  };

  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Help Desk</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Send a registration or association query to the support team.</p>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }} htmlFor="support-message">How can we help?</label>
        <textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} required rows="6" className="w-full rounded-lg border p-3" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
        <button type="submit" className="rounded-lg px-4 py-2 font-medium" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>Contact support</button>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Support email: {supportEmail}</p>
      </form>
    </section>
  );
}
