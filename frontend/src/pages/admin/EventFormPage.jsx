/** EventFormPage — Create or edit an event. */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventApi from '../../services/eventApi';
import EventForm from '../../components/forms/EventForm';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useNotification();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadEvent() {
      setLoading(true);
      try {
        const res = await eventApi.getById(id);
        setEvent(res.data.data);
      } catch {
        toast.error('Failed to load event');
        navigate('/admin/events');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (id) {
        await eventApi.update(id, formData);
        toast.success('Event updated successfully!');
      } else {
        await eventApi.create(formData);
        toast.success('Event created successfully!');
      }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <Loader />;

  return (
    <div className="max-w-xl mx-auto rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {id ? 'Edit Event' : 'Create Event'}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Provide event parameters for student registration
      </p>
      <EventForm initialData={event || {}} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
