const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEventDate = (event) => toDate(event.date || event.startDate);

const isUpcoming = (event) => {
  const date = getEventDate(event);
  return Boolean(date && date >= new Date() && event.isActive !== false);
};

export const buildDashboardStats = (events, registrations) => {
  const registeredEventIds = new Set(registrations.filter((item) => item.status === 'registered').map((item) => item.eventId));
  const registeredEvents = events.filter((event) => registeredEventIds.has(event.eventId));
  return {
    registered: registeredEvents.length,
    upcoming: registeredEvents.filter(isUpcoming).length,
    completed: registeredEvents.filter((event) => !isUpcoming(event)).length,
    available: events.filter((event) => isUpcoming(event) && !registeredEventIds.has(event.eventId)).length,
  };
};
