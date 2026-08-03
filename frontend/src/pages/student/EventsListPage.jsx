/** EventsListPage — browse and filter all active events. */
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

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await eventApi.getAll({ active_only: true });
        const list = res.data.data.events || [];
        setEvents(list);
        setFilteredEvents(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.title.toLowerCase().includes(query.toLowerCase())));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Tecnophite Events</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Explore and register for tech events</p>
        </div>
        <SearchBar onSearch={handleSearch} placeholder="Search events..." className="w-full sm:w-64" />
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState title="No events found" description="Try refining your search query." icon="🎉" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
