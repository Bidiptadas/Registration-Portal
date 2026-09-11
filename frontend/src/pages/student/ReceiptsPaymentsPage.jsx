import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { registrationApi } from '../../services/registrationApi';

export default function ReceiptsPaymentsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    registrationApi.getMyRegistrations()
      .then((response) => { setRegistrations(response.data.data || []); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <Loader fullScreen />;
  if (status === 'error') return <EmptyState title="Receipts unavailable" description="Please sign in again or try later." />;

  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Receipts / Payments</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Registration records and payment status.</p>
      {registrations.length === 0 ? <EmptyState title="No receipts yet" description="Completed registrations will appear here." /> : (
        <div className="overflow-x-auto rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <table className="w-full text-left text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--color-border)' }}><th className="p-4">Event</th><th className="p-4">Registration ID</th><th className="p-4">Payment</th></tr></thead>
            <tbody>{registrations.map((registration) => <tr key={registration.registrationId} style={{ borderBottom: '1px solid var(--color-border)' }}><td className="p-4">{registration.eventTitle || 'Event registration'}</td><td className="p-4">{registration.registrationId}</td><td className="p-4">{registration.paymentStatus || 'Not required'}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
