import { useEffect, useState } from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import eventApi from '../../services/eventApi';

import registrationApi from '../../services/registrationApi';

import Button from '../../components/common/Button';

import Loader from '../../components/common/Loader';

import Badge from '../../components/common/Badge';
import PaymentModal from '../../components/common/PaymentModal';

import { formatDate } from '../../utils/formatDate';

import { useNotification } from '../../context/NotificationContext';

const asDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value._seconds === 'number') return new Date(value._seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function EventDetailPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const toast = useNotification();


  const [event, setEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [registering, setRegistering] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationConfirmation, setRegistrationConfirmation] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);


  // --------------------------------------------------
  // REAL-TIME EVENT + REGISTRATION LISTENERS
  // --------------------------------------------------

  useEffect(() => {

    setLoading(true);


    // ----------------------------------------------
    // REAL-TIME EVENT LISTENER
    // ----------------------------------------------

    let unsubscribeEvent;

    try {

      unsubscribeEvent =
        eventApi.subscribeToEvent(
          id,
          (updatedEvent) => {

            if (!updatedEvent) {

              toast.error(
                'Event not found'
              );

              navigate('/events');

              return;
            }

            setEvent(updatedEvent);

            setLoading(false);
          }
        );

    } catch (err) {

      console.error(
        'Event listener error:',
        err
      );

      toast.error(
        'Unable to load event'
      );

      setLoading(false);
    }


    // ----------------------------------------------
    // REAL-TIME STUDENT REGISTRATION LISTENER
    // ----------------------------------------------

    let unsubscribeRegistrations;

    try {

      unsubscribeRegistrations =
        registrationApi.subscribeToMyRegistrations(
          (registrations) => {

            const registered =
              registrations.some(
                (registration) =>
                  registration.eventId === id &&
                  (registration.registrationStatus === 'CONFIRMED' || registration.status === 'registered')
              );

            setIsRegistered(registered);
          }
        );

    } catch (err) {

      console.error(
        'Registration listener error:',
        err
      );
    }


    // ----------------------------------------------
    // CLEANUP
    // ----------------------------------------------

    return () => {

      if (unsubscribeEvent) {
        unsubscribeEvent();
      }

      if (unsubscribeRegistrations) {
        unsubscribeRegistrations();
      }
    };

  }, [id, navigate, toast]);


  // --------------------------------------------------
  // REGISTER FOR EVENT / OPEN PAYMENT
  // --------------------------------------------------

  const handleRegister = async () => {

    if (isRegistered) {
      return;
    }

    setRegistering(true);

    try {

      const response = await registrationApi.register(id);
      const resData = response.data.data;

      if (resData.requiresPayment) {
        // Event has fixed registrationFee > 0 -> open payment interface
        setPendingPayment({
          registrationId: resData.registrationId,
          eventId: id,
          eventTitle: event.title || event.name,
          amount: resData.amount,
        });
        setPaymentModalOpen(true);
      } else {
        // Free event confirmed immediately
        setRegistrationConfirmation(resData.registration);
        setIsRegistered(true);
        toast.success('Successfully registered!');
      }

    } catch (err) {

      console.error(
        'Registration error:',
        err
      );

      toast.error(
        err.message ||
        'Registration failed'
      );

    } finally {

      setRegistering(false);
    }
  };

  const handlePaymentSuccess = (confirmedData) => {
    setRegistrationConfirmation(confirmedData);
    setIsRegistered(true);
    setPaymentModalOpen(false);
    toast.success('Payment verified! Registration confirmed.');
  };

  const handlePaymentFailure = (message) => {
    toast.error(message || 'Payment cancelled or failed.');
  };


  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <Loader />;
  }


  // --------------------------------------------------
  // EVENT NOT FOUND
  // --------------------------------------------------

  if (!event) {
    return null;
  }

  if (registrationConfirmation) {
    const feeAmount = registrationConfirmation.amount ?? event.registrationFee ?? 0;
    const isPaid = Number(feeAmount) > 0;

    return (
      <section className="mx-auto max-w-2xl rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>✓</div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Registration Confirmed</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your place has been successfully reserved for {event.title}.
        </p>

        <div className="my-6 rounded-xl p-5 text-left border space-y-3" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Registration ID</p>
              <p className="font-mono font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{registrationConfirmation.registrationId}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                CONFIRMED
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Event</p>
            <p className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {formatDate(event.date)} · {event.time || 'Time to be announced'} · {event.venue || 'Venue to be announced'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Amount Paid</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {isPaid ? `₹${feeAmount}` : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Payment Status</p>
              <p className="font-semibold text-sm" style={{ color: '#16a34a' }}>
                {registrationConfirmation.paymentStatus || 'SUCCESS'}
              </p>
            </div>
            {registrationConfirmation.paymentId && (
              <div className="col-span-2">
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Payment / Transaction ID</p>
                <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{registrationConfirmation.paymentId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate('/receipts-payments')}>View Receipt</Button>
          <Button variant="secondary" onClick={() => navigate('/my-registrations')}>My Registrations</Button>
          <Button variant="ghost" onClick={() => setRegistrationConfirmation(null)}>Back to Event</Button>
        </div>
      </section>
    );
  }

  const eventDate = asDate(event.date);
  const deadline = asDate(event.registrationDeadline);
  const currentRegistrations = Number(event.currentRegistrations || 0);
  const maxParticipants = Number(event.maxParticipants ?? event.max_participants ?? 0);
  const availableSpots = event.availableSpots ?? (maxParticipants ? Math.max(0, maxParticipants - currentRegistrations) : null);
  const deadlinePassed = Boolean(deadline && deadline < new Date());
  const registrationClosed = event.isActive === false || deadlinePassed;
  const eventCompleted = Boolean(eventDate && eventDate < new Date());


  const teamHeads = Array.isArray(event.teamHeads) ? event.teamHeads : [];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      <div
        className="rounded-2xl overflow-hidden shadow-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="p-6">
          {/* STATUS + CATEGORY */}
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant={
                event.isActive
                  ? 'active'
                  : 'closed'
              }
            >
              {event.isActive
                ? 'Active'
                : 'Closed'}
            </Badge>

            <span
              className="text-sm font-semibold"
              style={{
                color: 'var(--color-primary)',
              }}
            >
              {event.category?.toUpperCase()}
            </span>
          </div>

          {/* TITLE */}
          <h1
            className="text-3xl font-bold mb-4"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            {event.title}
          </h1>

          {/* DESCRIPTION */}
          <p
            className="text-sm mb-6"
            style={{
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {event.description}
          </p>

          {/* EVENT INFORMATION */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
            }}
          >
            <div>
              <p
                className="text-xs"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                Date & Time
              </p>
              <p className="text-sm font-semibold">
                {formatDate(event.date)} · {event.time || [event.startTime, event.endTime].filter(Boolean).join(' - ') || 'Time to be announced'}
              </p>
            </div>

            <div>
              <p
                className="text-xs"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                Venue
              </p>
              <p className="text-sm font-semibold">
                {event.venue || 'Venue to be announced'}
              </p>
            </div>
          </div>

          {/* TEAM HEADS SECTION */}
          {teamHeads.length > 0 && (
            <div
              className="mb-6 p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p
                className="text-xs uppercase tracking-wider font-semibold mb-3"
                style={{ color: 'var(--color-primary)' }}
              >
                Team Heads & Contact Information ({teamHeads.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamHeads.map((head, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {head.name}
                    </p>
                    {head.contact && (
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {head.contact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* METRICS & ELIGIBILITY */}
          <div
            className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl p-4"
            style={{ backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Registration Fee</p>
              <p className="text-sm font-bold" style={{ color: Number(event.registrationFee) > 0 ? 'var(--color-primary)' : 'inherit' }}>
                {Number(event.registrationFee) > 0 ? `₹${event.registrationFee}` : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Registration deadline</p>
              <p className="text-sm font-semibold">{formatDate(deadline)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Participation</p>
              <p className="text-sm font-semibold">
                {maxParticipants ? `${currentRegistrations} / ${maxParticipants} seats filled` : `${currentRegistrations} registered`}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status</p>
              <p className="text-sm font-semibold">
                {eventCompleted ? 'Completed' : (registrationClosed ? 'Registration closed' : 'Registration open')}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Eligibility Criteria</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {event.eligibility || 'Open to all students'}
              </p>
            </div>
          </div>

        {event.rules?.length > 0 && <section className="mb-6"><h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Rules</h2><ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{event.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></section>}

        {/* BROCHURE */}
        {event.brochureUrl && (
          <section className="mb-6">
            <h2 className="mb-2 text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              Event Brochure
            </h2>
            <div
              className="rounded-xl overflow-hidden border flex items-center justify-center p-2"
              style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
            >
              {event.brochureUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={event.brochureUrl}
                  title="Event Brochure"
                  width="100%"
                  height="480"
                  style={{ display: 'block', border: 'none', background: '#fff' }}
                />
              ) : (
                <img
                  src={event.brochureUrl}
                  alt="Event Brochure"
                  className="w-full max-h-[500px] object-contain rounded-lg"
                  loading="lazy"
                />
              )}
            </div>
          </section>
        )}


        {/* REGISTRATION */}

        <div className="flex items-center justify-between">

          <span
            className="text-sm"
            style={{
              color:
                'var(--color-text-secondary)',
            }}
          >

            Available spots:

            {' '}

            <strong
              style={{
                color:
                  'var(--color-text-primary)',
              }}
            >
                {availableSpots === null ? 'Not specified' : availableSpots}
            </strong>

          </span>


          {isRegistered ? (

            <Button
              variant="secondary"
              disabled
            >
              ✓ Registered
            </Button>

          ) : (

            <Button
              onClick={handleRegister}
              loading={registering}
              disabled={
                registrationClosed ||
                eventCompleted ||
                availableSpots === 0
              }
            >
              {registrationClosed || eventCompleted ? 'Registration Closed' : (availableSpots === 0 ? 'Registration Full' : (Number(event.registrationFee) > 0 ? `Register Now · ₹${event.registrationFee}` : 'Register Now'))}
            </Button>

          )}

        </div>


      </div>
    </div>

    {/* PAYMENT MODAL */}
    {paymentModalOpen && pendingPayment && (
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        eventId={pendingPayment.eventId}
        eventTitle={pendingPayment.eventTitle}
        registrationId={pendingPayment.registrationId}
        amount={pendingPayment.amount}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    )}
  </div>
);
}