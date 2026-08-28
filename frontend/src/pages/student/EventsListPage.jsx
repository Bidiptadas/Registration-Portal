/**
 * EventsListPage
 * Browse and filter all active events in real time.
 */

import { useEffect, useState } from 'react';

import eventApi from '../../services/eventApi';

import EventCard from '../../components/cards/EventCard';

import SearchBar from '../../components/common/SearchBar';

import Loader from '../../components/common/Loader';

import EmptyState from '../../components/common/EmptyState';

export default function EventsListPage() {

  const [events, setEvents] = useState([]);

  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  // --------------------------------------------------
  // REAL-TIME FIRESTORE EVENT LISTENER
  // --------------------------------------------------

  useEffect(() => {

    setLoading(true);
    setError('');

    const unsubscribe = eventApi.subscribe(
      (updatedEvents) => {

        setEvents(updatedEvents);

        setFilteredEvents(updatedEvents);

        setLoading(false);
      },
      {
        active_only: true,
      }
    );


    // IMPORTANT:
    // Remove Firestore listener when component unmounts.

    return () => {
      unsubscribe();
    };

  }, []);


  // --------------------------------------------------
  // SEARCH EVENTS
  // --------------------------------------------------

  const handleSearch = (query) => {

    const searchQuery =
      query.trim().toLowerCase();

    if (!searchQuery) {

      setFilteredEvents(events);

      return;
    }

    const filtered = events.filter((event) => {

      const title =
        event.title?.toLowerCase() || '';

      const description =
        event.description?.toLowerCase() || '';

      const category =
        event.category?.toLowerCase() || '';

      return (
        title.includes(searchQuery) ||
        description.includes(searchQuery) ||
        category.includes(searchQuery)
      );
    });

    setFilteredEvents(filtered);
  };


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