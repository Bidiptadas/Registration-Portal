/**
 * EventsListPage
 * Browse and filter all active events in real time.
 */

import { useCallback, useEffect, useState } from 'react';

import eventApi from '../../services/eventApi';
import registrationApi from '../../services/registrationApi';

import EventCard from '../../components/cards/EventCard';

import SearchBar from '../../components/common/SearchBar';

import Loader from '../../components/common/Loader';

import EmptyState from '../../components/common/EmptyState';

export default function EventsListPage() {

  const [events, setEvents] = useState([]);

  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: 'all', availability: 'all', sort: 'date' });


  // --------------------------------------------------
  // REAL-TIME FIRESTORE EVENT LISTENER
  // --------------------------------------------------

  useEffect(() => {

    setLoading(true);
    setError('');

    Promise.all([
      eventApi.getAll({ active_only: true }),
      registrationApi.getMyRegistrations(),
    ]).then(([eventResponse, registrationResponse]) => {
      setEvents(eventResponse.data.data.events || []);
      setRegistrations(registrationResponse.data.data || []);
    }).catch((loadError) => {
      setError(loadError.message || 'Unable to load events. Please try again.');
    }).finally(() => setLoading(false));

  }, []);


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
      const leftDate = left.date?.toDate ? left.date.toDate() : new Date(left.date);
      const rightDate = right.date?.toDate ? right.date.toDate() : new Date(right.date);
      return leftDate - rightDate;
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
              color:
                'var(--color-text-primary)',
            }}
          >
            Tecnophite Events
          </h1>

          <p
            className="text-sm"
            style={{
              color:
                'var(--color-text-secondary)',
            }}
          >
            Explore and register for tech events
          </p>

        </div>


        <SearchBar
          onSearch={handleSearch}
          placeholder="Search events..."
          className="w-full sm:w-64"
        />

      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-lg p-2.5 text-sm" aria-label="Filter by category">
          <option value="">All categories</option>
          {[...new Set(events.map((event) => event.category).filter(Boolean))].map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-lg p-2.5 text-sm" aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Open</option><option value="closed">Closed</option></select>
        <select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value })} className="rounded-lg p-2.5 text-sm" aria-label="Filter by availability"><option value="all">Any availability</option><option value="available">Seats available</option><option value="full">Full events</option></select>
        <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })} className="rounded-lg p-2.5 text-sm" aria-label="Sort events"><option value="date">Sort by date</option><option value="title">Sort by name</option><option value="availability">Sort by seats</option></select>
      </div>


      {filteredEvents.length === 0 ? (

        <EmptyState
          title="No events found"
          description="Try refining your search query."
          icon="🎉"
        />

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEvents.map((event) => (

            <EventCard
              key={event.eventId}
              event={event}
            />

          ))}

        </div>

      )}

    </div>
  );
}