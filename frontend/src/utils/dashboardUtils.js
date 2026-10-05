const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEventDate = (event) => toDate(event.date || event.startDate);

const isPast = (event) => {
  const date = getEventDate(event);
  return Boolean(date && date < new Date());
};

const isUpcoming = (event) => {
  return event.isActive !== false && !isPast(event);
};

export const buildDashboardStats = (events = [], registrations = []) => {
  const registeredEventIds = new Set(
    (registrations || [])
      .filter((item) => item.status === 'registered')
      .map((item) => item.eventId)
  );
  const registeredEvents = (events || []).filter((event) => registeredEventIds.has(event.eventId));
  return {
    registered: registeredEvents.length,
    upcoming: registeredEvents.filter(isUpcoming).length,
    completed: registeredEvents.filter(isPast).length,
    available: (events || []).filter((event) => isUpcoming(event) && !registeredEventIds.has(event.eventId)).length,
  };
};
