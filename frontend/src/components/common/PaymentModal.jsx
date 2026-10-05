import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Loader from './Loader';
import { useAuth } from '../../hooks/useAuth';
import paymentApi from '../../services/paymentApi';

export default function PaymentModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  registrationId,
  amount,
  onPaymentSuccess,
  onPaymentFailure,
}) {
  const { userProfile } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showTestCards, setShowTestCards] = useState(true);
  const [activeTab, setActiveTab] = useState('razorpay');

  // Initialize payment order from backend (retrieves fixed fee securely from Firebase)
  useEffect(() => {
    if (!isOpen || !eventId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    paymentApi
      .createOrder({
        eventId,
        registrationId,
        participantName: userProfile?.displayName || userProfile?.name || '',
        email: userProfile?.email || '',
      })
      .then((data) => {
        if (mounted) {
          const resolvedOrder = data.data || data;
          setOrder(resolvedOrder);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to initialize payment order');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, eventId, registrationId, userProfile]);

  /**
   * Launch Razorpay Standard Test Checkout Modal
   */
  const handleRazorpayCheckout = async () => {
    if (!order) return;

    setProcessing(true);
    setError(null);

    try {
      const isLoaded = await paymentApi.loadScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: order.keyId || 'rzp_test_TgeKdZ4rXs1fYL',
        amount: order.amountInPaise || Math.round(order.amount * 100),
        currency: order.currency || 'INR',
        name: 'Technophite Association',
        description: `Registration for ${order.eventName || eventTitle}`,
        image: '/technophite-logo.png',
        order_id:
          order.orderId && order.orderId.startsWith('order_') && !order.orderId.includes('.')
            ? order.orderId
            : undefined,
        prefill: {
          name: userProfile?.displayName || userProfile?.name || 'Technophite Participant',
          email: userProfile?.email || 'participant@sju.edu.in',
          contact: userProfile?.phoneNumber || '9876543210',
        },
        notes: {
          eventId,
          registrationId,
          eventName: order.eventName || eventTitle,
        },
        theme: {
          color: '#0284c7', // Sky-600
        },
        modal: {
          ondismiss: async function () {
            setProcessing(false);
            console.log('[Razorpay] Checkout window dismissed');
            try {
              await paymentApi.cancelPayment({
                registrationId,
                reason: 'Payment checkout dismissed by user',
              });
            } catch (e) {
              console.warn('[Razorpay] Cancel callback warning:', e);
            }
          },
        },
        handler: async function (response) {
          console.log('[Razorpay] Payment successful response received:', response);
          setProcessing(true);
          try {
            const verifyRes = await paymentApi.verifyPayment({
              registrationId,
              eventId,
              orderId: response.razorpay_order_id || order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              signatureToken: order.signatureToken,
            });

            const confirmedData = verifyRes.data?.data || verifyRes.data || {
              registrationId,
              eventId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || order.orderId,
              amount: order.amount,
              paymentStatus: 'SUCCESS',
              registrationStatus: 'CONFIRMED',
            };

            setProcessing(false);
            if (onPaymentSuccess) {
              onPaymentSuccess(confirmedData);
            }
            onClose();
          } catch (verifyErr) {
            setProcessing(false);
            setError(verifyErr.message || 'Payment signature verification failed.');
            if (onPaymentFailure) {
              onPaymentFailure(verifyErr.message);
            }
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('[Razorpay] Payment failed:', response.error);
        setProcessing(false);
        const errMsg = response.error?.description || 'Payment transaction failed or declined.';
        setError(errMsg);
        if (onPaymentFailure) {
          onPaymentFailure(errMsg);
        }
      });

      razorpayInstance.open();
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Failed to open Razorpay checkout');
    }
  };

  /**
   * Fallback simulator for offline or direct sandbox testing
   */
  const handleSimulatePayment = async (status = 'SUCCESS') => {
    if (!order) return;

    setProcessing(true);
    setError(null);

    if (status === 'FAILURE') {
      try {
        await paymentApi.cancelPayment({
          registrationId,
          reason: 'Simulation: Payment cancelled by user',
        });
      } catch (err) {
        console.error('Cancel payment error:', err);
      }
      setProcessing(false);
      if (onPaymentFailure) {
        onPaymentFailure('Payment cancelled or simulated failed. Registration remains pending.');
      } else {
        setError('Payment cancelled. Your registration remains pending.');
      }
      return;
    }

    try {
      const generatedPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const verifyRes = await paymentApi.verifyPayment({
        registrationId,
        eventId,
        orderId: order.orderId,
        paymentId: generatedPaymentId,
        signatureToken: order.signatureToken,
      });

      const confirmedData = verifyRes.data?.data || verifyRes.data || {
        registrationId,
        eventId,
        paymentId: generatedPaymentId,
        orderId: order.orderId,
        amount: order.amount,
        paymentStatus: 'SUCCESS',
        registrationStatus: 'CONFIRMED',
      };

      setProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(confirmedData);
      }
      onClose();
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Payment verification failed');
      if (onPaymentFailure) {
        onPaymentFailure(err.message);
      }
    }
  };

  const displayAmount = order ? order.amount : amount || 0;

  return (
    <Modal isOpen={isOpen} onClose={processing ? () => {} : onClose} title="Event Registration Payment" size="md">
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <Loader />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Initializing secure Razorpay test order from server...
          </p>
        </div>
      ) : error && !order ? (
        <div className="py-4 space-y-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Razorpay Test Mode Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">Razorpay Test Mode Active</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">
              Key: {order?.keyId?.substring(0, 12)}...
            </span>
          </div>

          {/* Beneficiary College Account */}
          <div
            className="p-3 rounded-xl border flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div>
              <span className="font-semibold block" style={{ color: 'var(--color-text-primary)' }}>
                Designated College Account:
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {order?.collegeAccount || "Technophite Association / St. Joseph's University"}
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-semibold"
              style={{ backgroundColor: '#dcfce7', color: '#166534' }}
            >
              Verified
            </span>
          </div>

          {/* Event & Fixed Amount Card */}
          <div
            className="p-4 rounded-xl border space-y-2"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Event:</span>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {order?.eventName || eventTitle}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Registration ID:</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
                {registrationId}
              </span>
            </div>
            {order?.orderId && (
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--color-text-secondary)' }}>Razorpay Order ID:</span>
                <span className="font-mono text-[11px] text-sky-400 truncate max-w-[200px]">
                  {order.orderId}
                </span>
              </div>
            )}
            <div
              className="flex justify-between items-center pt-2 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Registration Fee:
                </span>
                <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>
                  Fixed by event · Non-editable
                </span>
              </div>
              <span
                className="text-2xl font-black px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--color-primary, #3b82f6)',
                }}
              >
                ₹{displayAmount}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg p-1 border gap-1 text-xs" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('razorpay')}
              className={`flex-1 py-1.5 font-semibold rounded transition-colors ${
                activeTab === 'razorpay' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Razorpay Gateway
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fallback')}
              className={`flex-1 py-1.5 font-semibold rounded transition-colors ${
                activeTab === 'fallback' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sandbox Simulator
            </button>
          </div>

          {/* Tab 1: Official Razorpay Test Checkout */}
          {activeTab === 'razorpay' && (
            <div className="space-y-3">
              <Button
                onClick={handleRazorpayCheckout}
                loading={processing}
                className="w-full py-3 text-base font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
              >
                <span>Pay ₹{displayAmount} via Razorpay (Test)</span>
              </Button>

              {/* Collapsible Test Card Reference */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer select-none font-semibold text-slate-300"
                  onClick={() => setShowTestCards(!showTestCards)}
                >
                  <span className="flex items-center gap-1.5">
                    Razorpay Test Credentials Guide
                  </span>
                  <span className="text-slate-400 text-sm">{showTestCards ? '▲' : '▼'}</span>
                </div>

                {showTestCards && (
                  <div className="space-y-2 pt-1 border-t border-white/10 text-slate-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Test Card (Visa)</span>
                        <code className="text-sky-300 font-mono text-[11px] select-all">4111 1111 1111 1111</code>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Exp: 12/30 · CVV: 123 · OTP: Any</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Test UPI VPA</span>
                        <code className="text-emerald-300 font-mono text-[11px] select-all">success@razorpay</code>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Failure test: failure@razorpay</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Click the button above to launch the Razorpay Checkout popup. Choose Card, UPI, or Net Banking using the test credentials above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Sandbox Simulator */}
          {activeTab === 'fallback' && (
            <div className="space-y-3 p-3 rounded-xl border border-white/10 bg-slate-900/40">
              <p className="text-xs text-slate-300">
                You can also run quick simulated gateway transactions directly to verify frontend receipt rendering and database state transitions:
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleSimulatePayment('SUCCESS')}
                  loading={processing}
                  className="w-full text-sm font-semibold"
                >
                  Simulate Immediate Success (₹{displayAmount})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleSimulatePayment('FAILURE')}
                  disabled={processing}
                  className="w-full text-xs"
                >
                  Simulate Payment Failure
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Secondary Dismiss Button */}
          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={processing}
              className="w-full text-xs"
            >
              Cancel / Pay Later
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
