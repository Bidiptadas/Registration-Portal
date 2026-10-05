/**
 * EventsListPage
 * Browse and filter all active events in real time.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';

import EventCard from '../../components/cards/EventCard';
import EventDetailModal from '../../components/common/EventDetailModal';

import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';

export default function EventsListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: 'all', availability: 'all', sort: 'date' });
  const [seeding, setSeeding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const toast = useNotification();

  // --------------------------------------------------
  // REAL-TIME FIRESTORE EVENT LISTENER
  // --------------------------------------------------

  useEffect(() => {
    setLoading(true);
    setError('');

    // Load registrations once for registration tags
    registrationApi.getMyRegistrations()
      .then((res) => {
        setRegistrations(res?.data?.data || []);
      })
      .catch((err) => {
        console.warn('Registrations load warning:', err);
      });

    // Real-time Firestore onSnapshot listener
    const unsubscribe = eventApi.subscribeToEvents(
      (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      },
      (err) => {
        console.error('Real-time event listener error:', err);
        setError(err.message || 'Unable to connect to events database.');
        setLoading(false);
      },
      { active_only: false }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleSeedEvents = async () => {
    setSeeding(true);
    try {
      const res = await eventApi.seedTechnophiteEvents();
      if (res.count > 0) {
        toast.success(`Successfully added ${res.count} Technophite events!`);
      } else {
        toast.info('All 11 Technophite events are already present.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to populate events');
    } finally {
      setSeeding(false);
    }
  };

  // --------------------------------------------------
  // SEARCH EVENTS
  // --------------------------------------------------

  const handleSearch = useCallback((searchQuery) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const registeredIds = new Set(registrations.filter((item) => item.status === 'registered').map((item) => item.eventId));
    const now = new Date();
    const result = events.filter((event) => {
      const matchesSearch = [event.title, event.description, event.category, event.venue].some((value) => value?.toLowerCase().includes(normalizedQuery));
      const deadline = event.registrationDeadline?.toDate ? event.registrationDeadline.toDate() : new Date(event.registrationDeadline);
      const isClosed = event.isActive === false || (event.registrationDeadline && deadline < now);
      const spots = event.availableSpots ?? Number(event.maxParticipants || 0) - Number(event.currentRegistrations || 0);
      const matchesCategory = !filters.category || event.category === filters.category;
      const matchesStatus = filters.status === 'all' || (filters.status === 'active' && !isClosed) || (filters.status === 'closed' && isClosed);
      const matchesAvailability = filters.availability === 'all' || (filters.availability === 'available' && spots > 0) || (filters.availability === 'full' && spots <= 0);
      return matchesSearch && matchesCategory && matchesStatus && matchesAvailability;
    }).sort((left, right) => {
      if (filters.sort === 'title') return (left.title || '').localeCompare(right.title || '');
      if (filters.sort === 'availability') return (right.availableSpots || 0) - (left.availableSpots || 0);
      const getTimestamp = (val) => {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        if (typeof val._seconds === 'number') return val._seconds * 1000;
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getTimestamp(left.date) - getTimestamp(right.date);
    });
    setFilteredEvents(result.map((event) => ({ ...event, isRegistered: registeredIds.has(event.eventId) })));
  }, [events, filters, registrations]);

  useEffect(() => {
    handleSearch('');
  }, [handleSearch]);


  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <Loader />;
  }


  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {

    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: '#ffffff',
              }}
            >
              Technophite Events
            </h1>
            <p
              className="text-sm"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              Explore and register for tech events
            </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/events')}
              className="flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(8, 31, 42, 0.75)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
              }}
            >
              Manage Events
            </Button>
            <Button
              onClick={() => navigate('/admin/events/new')}
              className="flex items-center gap-2 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.6rem 1.25rem',
              }}
            >
              <span className="text-lg leading-none font-bold">+</span> Add Event
            </Button>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          className="rounded-lg p-2.5 text-sm"
          style={{
            backgroundColor: 'rgba(8, 31, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            backdropFilter: 'blur(10px)',
          }}
          aria-label="Filter by category"
        >
          <option value="" style={{ backgroundColor: '#0b1222', color: '#ffffff' }}>All categories</option>
          {[...new Set(events.map((event) => event.category).filter(Boolean))].map((category) => (
            <option key={category} value={category} style={{ backgroundColor: '#0b1222', color: '#ffffff' }}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          className="rounded-lg p-2.5 text-sm"
          style={{
            backgroundColor: 'rgba(8, 31, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            backdropFilter: 'blur(10px)',
          }}
          aria-label="Filter by status"
        >
          <option value="all" style={{ backgroundColor: '#0b1222', color: '#ffffff' }}>All statuses</option>
          <option value="active" style={{ backgroundColor: '#0b1222', color: '#ffffff' }}>Open</option>
          <option value="closed" style={{ backgroundColor: '#0b1222', color: '#ffffff' }}>Closed</option>
        </select>
      </div>


      {filteredEvents.length === 0 ? (
        <EmptyState
          title={events.length === 0 ? 'No events in database yet' : 'No matching events found'}
          description={
            events.length === 0
              ? 'Get started by exploring newly published Technophite events or check back shortly.'
              : 'Try refining your search query or reset the filters.'
          }
          action={
            events.length === 0 && isAdmin ? (
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleSeedEvents} loading={seeding}>
                  Populate 11 Technophite Events
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin/events/new')}
                >
                  + Add Custom Event
                </Button>
              </div>
            ) : null
          }
        />

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEvents.map((event) => (

            <EventCard
              key={event.eventId}
              event={event}
              onSelect={setSelectedEventId}
            />

          ))}

        </div>

      )}

      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

    </div>
  );
}