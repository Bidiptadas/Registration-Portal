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

import { formatDate } from '../../utils/formatDate';

import { useNotification } from '../../context/NotificationContext';

const asDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
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

  const [isRegistered, setIsRegistered] =
    useState(false);
  const [registrationConfirmation, setRegistrationConfirmation] = useState(null);


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
                  registration.status ===
                    'registered'
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
  // REGISTER FOR EVENT
  // --------------------------------------------------

  const handleRegister = async () => {

    if (isRegistered) {
      return;
    }

    setRegistering(true);

    try {

      const response = await registrationApi.register(id);
      setRegistrationConfirmation(response.data.data);
      setIsRegistered(true);

      /*
       * We don't need to manually call getById()
       * anymore.
       *
       * Firestore onSnapshot() will automatically
       * update:
       *
       * event.currentRegistrations
       * event.availableSpots
       * isRegistered
       */

      toast.success(
        'Successfully registered!'
      );

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
    return (
      <section className="mx-auto max-w-2xl rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>✓</div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Registration Successful</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Your place has been reserved for {event.title}.</p>
        <div className="my-6 rounded-xl p-4 text-left" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Registration ID</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{registrationConfirmation.registrationId}</p>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Event</p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(event.date)} · {event.time || 'Time to be announced'} · {event.venue || 'Venue to be announced'}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3"><Button onClick={() => navigate('/my-registrations')}>My Registrations</Button><Button variant="secondary" onClick={() => setRegistrationConfirmation(null)}>Back to Event</Button></div>
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


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg"
      style={{
        backgroundColor:
          'var(--color-surface)',
      }}
    >

      {/* EVENT IMAGE */}

      <div
        className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600"
        style={{
          backgroundImage:
            event.imageUrl
              ? `url(${event.imageUrl})`
              : undefined,

          backgroundSize: 'cover',

          backgroundPosition: 'center',
        }}
      />


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
              color:
                'var(--color-primary)',
            }}
          >
            {event.category?.toUpperCase()}
          </span>

        </div>


        {/* TITLE */}

        <h1
          className="text-3xl font-bold mb-4"
          style={{
            color:
              'var(--color-text-primary)',
          }}
        >
          {event.title}
        </h1>


        {/* DESCRIPTION */}

        <p
          className="text-sm mb-6"
          style={{
            color:
              'var(--color-text-secondary)',

            whiteSpace: 'pre-wrap',
          }}
        >
          {event.description}
        </p>


        {/* EVENT INFORMATION */}

        <div
          className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg"
          style={{
            backgroundColor:
              'var(--color-surface-secondary)',
          }}
        >

          <div>

            <p
              className="text-xs"
              style={{
                color:
                  'var(--color-text-muted)',
              }}
            >
              Date & Time
            </p>

            <p className="text-sm font-semibold">{formatDate(event.date)} · {event.time || [event.startTime, event.endTime].filter(Boolean).join(' - ') || 'Time to be announced'}</p>

          </div>


          <div>

            <p
              className="text-xs"
              style={{
                color:
                  'var(--color-text-muted)',
              }}
            >
              Venue
            </p>

            <p className="text-sm font-semibold">
              {event.venue}
            </p>

          </div>


          <div>

            <p
              className="text-xs"
              style={{
                color:
                  'var(--color-text-muted)',
              }}
            >
              Event Head
            </p>

            <p className="text-sm font-semibold">
              {event.organizer || event.eventHeadName || 'N/A'}
            </p>

          </div>


          <div>

            <p
              className="text-xs"
              style={{
                color:
                  'var(--color-text-muted)',
              }}
            >
              Contact
            </p>

            <p className="text-sm font-semibold">
              {event.coordinator || event.eventHeadPhone || 'N/A'}
            </p>

          </div>

        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
          <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Registration deadline</p><p className="text-sm font-semibold">{formatDate(deadline)}</p></div>
          <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Participation</p><p className="text-sm font-semibold">{maxParticipants ? `${currentRegistrations} / ${maxParticipants} seats filled` : `${currentRegistrations} registered`}</p></div>
          <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Eligibility</p><p className="text-sm font-semibold">{event.eligibility || 'Open to eligible SIT students'}</p></div>
          <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status</p><p className="text-sm font-semibold">{eventCompleted ? 'Completed' : (registrationClosed ? 'Registration closed' : 'Registration open')}</p></div>
        </div>

        {event.rules?.length > 0 && <section className="mb-6"><h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Rules</h2><ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{event.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></section>}


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
              {registrationClosed || eventCompleted ? 'Registration Closed' : (availableSpots === 0 ? 'Registration Full' : 'Register Now')}
            </Button>

          )}

        </div>

        <Button variant="ghost" onClick={() => navigate('/events')} className="mt-4">Back to Events</Button>

      </div>

    </div>
  );
}