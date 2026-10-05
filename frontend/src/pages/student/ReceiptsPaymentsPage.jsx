import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import PaymentModal from '../../components/common/PaymentModal';
import { registrationApi } from '../../services/registrationApi';
import { formatDate } from '../../utils/formatDate';
import { useNotification } from '../../context/NotificationContext';

export default function ReceiptsPaymentsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [status, setStatus] = useState('loading');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payingRegistration, setPayingRegistration] = useState(null);
  const toast = useNotification();

  const loadData = () => {
    setStatus('loading');
    registrationApi
      .getMyRegistrations()
      .then((response) => {
        const list = response.data.data || [];
        setRegistrations(list);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
    setPayingRegistration(null);
    loadData();
  };



  const getStatusVariant = (pStatus) => {
    const s = (pStatus || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'CONFIRMED' || s === 'FREE') return 'active';
    if (s === 'PENDING' || s === 'PAYMENT_PENDING') return 'warning';
    return 'closed';
  };

  if (status === 'loading') return <Loader fullScreen />;
  if (status === 'error') {
    return <EmptyState title="Receipts unavailable" description="Please sign in again or try later." />;
  }

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
            Receipts / Payments
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Participant registration records, payment receipts, and transaction status.
          </p>
        </div>


      </div>

      {registrations.length === 0 ? (
        <EmptyState
          title="No receipts found"
          description={
            'No registration or payment history available yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((registration) => {

            const amount = Number(registration.amount ?? 0);
            const pStatus = (registration.paymentStatus || (amount === 0 ? 'SUCCESS' : 'PENDING')).toUpperCase();
            const rStatus = (registration.registrationStatus || (pStatus === 'SUCCESS' ? 'CONFIRMED' : 'PAYMENT_PENDING')).toUpperCase();
            const dateStr = formatDate(registration.paidAt || registration.registeredAt);

            return (
              <div
                key={registration.registrationId}
                className="rounded-2xl p-5 border flex flex-col justify-between transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* Receipt Card Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-primary)' }}>
                        Payment Receipt
                      </span>
                    </div>
                    <Badge variant={getStatusVariant(pStatus)}>
                      {pStatus}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {registration.eventName || registration.eventTitle || 'College Event'}
                  </h3>

                  {/* Receipt Details List */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Registration ID:</span>
                      <span className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {registration.registrationId}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Amount Paid:</span>
                      <span className="font-bold text-sm" style={{ color: amount > 0 ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                        {amount > 0 ? `₹${amount}` : 'Free (₹0)'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Payment Status:</span>
                      <span className={`font-semibold ${pStatus === 'SUCCESS' ? 'text-green-500' : pStatus === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>
                        {pStatus}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Registration Status:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {rStatus}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Payment / Trans ID:</span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {registration.paymentId || (pStatus === 'PENDING' ? 'Awaiting Payment' : 'FREE_EVENT')}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Date:</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {dateStr || 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--color-border)' }}>
                  {pStatus === 'PENDING' ? (
                    <Button
                      size="sm"
                      onClick={() => setPayingRegistration(registration)}
                      className="w-full text-xs font-semibold"
                    >
                      Complete Payment (₹{amount})
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(registration)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-white/5 transition-colors w-full text-center"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      View Full Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                College Event Payment Receipt
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Technophite Association / St. Joseph&apos;s University
              </p>
            </div>

            <div
              className="p-4 rounded-xl border font-mono text-xs space-y-2 leading-relaxed"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="text-center font-bold pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                ---------------------------------<br />
                PAYMENT RECEIPT<br />
                ---------------------------------
              </div>
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="font-bold">{selectedReceipt.eventName || selectedReceipt.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Registration ID:</span>
                <span>{selectedReceipt.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold">₹{selectedReceipt.amount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-green-500 font-bold">{selectedReceipt.paymentStatus || 'SUCCESS'}</span>
              </div>
              <div className="flex justify-between">
                <span>Registration Status:</span>
                <span>{selectedReceipt.registrationStatus || 'CONFIRMED'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <span>{selectedReceipt.paymentId || 'FREE_EVENT'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(selectedReceipt.paidAt || selectedReceipt.registeredAt)}</span>
              </div>
              <div className="text-center pt-2 border-t text-[11px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                Beneficiary: Designated College Account
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.print()} variant="secondary" className="flex-1 text-xs">
                Print Receipt
              </Button>
              <Button onClick={() => setSelectedReceipt(null)} className="flex-1 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for Pending items */}
      {payingRegistration && (
        <PaymentModal
          isOpen={Boolean(payingRegistration)}
          onClose={() => setPayingRegistration(null)}
          eventId={payingRegistration.eventId}
          eventTitle={payingRegistration.eventName || payingRegistration.eventTitle}
          registrationId={payingRegistration.registrationId}
          amount={payingRegistration.amount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
}
