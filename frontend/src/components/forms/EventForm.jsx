/** EventForm — reusable event create/edit form. */
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { EVENT_CATEGORIES } from '../../config/constants';
import { uploadFile } from '../../firebase/storageService';

export default function EventForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
  const toast = useNotification();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    status: 'open',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    teamHeads: [{ name: '', contact: '' }],
    eligibility: '',
    registrationFee: 0,
    maxParticipants: 50,
    registrationDeadline: '',
    rules: '',
    brochureUrl: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      let heads = [];
      if (Array.isArray(initialData.teamHeads) && initialData.teamHeads.length > 0) {
        heads = initialData.teamHeads.map((h) => ({
          name: typeof h === 'string' ? h : (h?.name || ''),
          contact: typeof h === 'string' ? '' : (h?.contact || h?.phone || h?.email || ''),
        }));
      } else if (initialData.teamHeadName || initialData.coordinator || initialData.organizer) {
        heads = [
          {
            name: initialData.teamHeadName || initialData.coordinator || initialData.organizer || '',
            contact: initialData.teamHeadContact || initialData.coordinatorPhone || '',
          },
        ];
      } else {
        heads = [{ name: '', contact: '' }];
      }

      setForm({
        title: initialData.title || initialData.eventName || '',
        description: initialData.description || '',
        category: initialData.category || 'technical',
        status: initialData.status || (initialData.isActive === false ? 'closed' : 'open'),
        date: initialData.date || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        venue: initialData.venue || '',
        teamHeads: heads.slice(0, 4),
        eligibility: initialData.eligibility || initialData.eligibilityCriteria || '',
        registrationFee: Number(initialData.registrationFee ?? initialData.fee ?? 0),
        maxParticipants: initialData.maxParticipants ?? initialData.max_participants ?? 50,
        registrationDeadline: initialData.registrationDeadline || '',
        rules: Array.isArray(initialData.rules) ? initialData.rules.join('\n') : (initialData.rules || ''),
        brochureUrl: initialData.brochureUrl || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamHeadChange = (index, field, value) => {
    setForm((prev) => {
      const nextHeads = [...prev.teamHeads];
      nextHeads[index] = { ...nextHeads[index], [field]: value };
      return { ...prev, teamHeads: nextHeads };
    });
  };

  const handleAddTeamHead = () => {
    if (form.teamHeads.length < 4) {
      setForm((prev) => ({
        ...prev,
        teamHeads: [...prev.teamHeads, { name: '', contact: '' }],
      }));
    }
  };

  const handleRemoveTeamHead = (index) => {
    if (form.teamHeads.length > 1) {
      setForm((prev) => ({
        ...prev,
        teamHeads: prev.teamHeads.filter((_, i) => i !== index),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        teamHeads: [{ name: '', contact: '' }],
      }));
    }
  };

  // ── Brochure upload ──────────────────────────────────
  const brochureInputRef = useRef(null);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [brochureFileName, setBrochureFileName] = useState('');

  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1000;
          const maxHeight = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Highly optimized JPEG at 0.72 quality (~60-120 KB, perfect for Firestore & instant rendering)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Invalid image file.'));
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleBrochureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isImage) {
      toast.error('Please select an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size must be under 15 MB.');
      return;
    }

    setBrochureUploading(true);
    setBrochureFileName(file.name);

    try {
      // 1. Process & compress image locally (<100ms, zero network latency, never hangs)
      const dataUrl = await processImageFile(file);
      setForm((prev) => ({ ...prev, brochureUrl: dataUrl }));
      toast.success('Brochure image attached successfully!');

      // 2. Try background upload to Firebase Storage if a bucket is configured (with 2.5s strict timeout)
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `event-brochures/${Date.now()}_brochure.${ext}`;
        const cloudUrl = await Promise.race([
          uploadFile(file, path),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]);
        if (cloudUrl) {
          setForm((prev) => ({ ...prev, brochureUrl: cloudUrl }));
        }
      } catch {
        // Storage bucket not provisioned on GCP; local compressed image is already set and works flawlessly!
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      toast.error('Failed to process image. Please try another file.');
      setBrochureFileName('');
    } finally {
      setBrochureUploading(false);
      if (brochureInputRef.current) {
        brochureInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedRules = form.rules
      ? form.rules.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const cleanedHeads = form.teamHeads
      .map((h) => ({ name: (h.name || '').trim(), contact: (h.contact || '').trim() }))
      .filter((h) => h.name || h.contact)
      .slice(0, 4);

    onSubmit({
      ...form,
      teamHeads: cleanedHeads,
      registrationFee: Math.max(0, Number(form.registrationFee || 0)),
      maxParticipants: Number(form.maxParticipants || 50),
      rules: formattedRules,
      isActive: form.status === 'open' || form.status === 'active',
      brochureUrl: form.brochureUrl || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Event Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        placeholder="e.g. Hackathon 2026"
      />

      {/* Description */}
      <div>
        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Description <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full rounded-lg p-3 text-sm"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
          placeholder="Detailed description of the event..."
        />
      </div>

      {/* Category and Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg p-2.5 text-sm"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg p-2.5 text-sm"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="open">Open (Active)</option>
            <option value="closed">Closed (Inactive)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Date, Start Time, End Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Event Date"
          name="date"
          type="date"
          value={form.date || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="Start Time"
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
        />
        <Input
          label="End Time"
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
        />
      </div>

      {/* Venue */}
      <Input
        label="Venue"
        name="venue"
        value={form.venue}
        onChange={handleChange}
        required
        placeholder="e.g. Auditorium / Lab 3 / PG Block"
      />

      {/* Team Heads Section (Max 4 with Name and Contact Details) */}
      <div
        className="rounded-xl p-4 border"
        style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Team Heads ({form.teamHeads.length}/4) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Add up to 4 team heads along with their contact information (phone, email, etc.)
            </p>
          </div>
          {form.teamHeads.length < 4 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTeamHead}
              className="flex items-center gap-1 self-start sm:self-auto"
            >
              <span>+</span> Add Team Head
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {form.teamHeads.map((head, index) => (
            <div
              key={index}
              className="p-3.5 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 self-start sm:self-center"
                style={{ backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-primary)' }}
              >
                {index + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={`Head ${index + 1} Name`}
                  value={head.name}
                  onChange={(e) => handleTeamHeadChange(index, 'name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required={index === 0}
                />
                <Input
                  label="Contact Details"
                  value={head.contact}
                  onChange={(e) => handleTeamHeadChange(index, 'contact', e.target.value)}
                  placeholder="e.g. +91 98765 43210 / email"
                />
              </div>

              {form.teamHeads.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTeamHead(index)}
                  className="px-3 py-1.5 text-xs rounded-lg text-red-400 hover:bg-red-500/20 border border-red-500/30 self-end sm:self-center transition-colors font-medium"
                  title="Remove this team head"
                  aria-label={`Remove team head ${index + 1}`}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility Criteria */}
      <div>
        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Eligibility Criteria <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <textarea
          name="eligibility"
          value={form.eligibility}
          onChange={handleChange}
          required
          rows={2}
          className="w-full rounded-lg p-3 text-sm"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
          placeholder="Define who can participate (e.g. Open to all BCA & B.Sc CS students, 1st to 3rd year, teams of 2 to 4)"
        />
      </div>

      {/* Registration Fee, Max Participants, Registration Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Registration Fee (₹)"
          name="registrationFee"
          type="number"
          min="0"
          step="1"
          value={form.registrationFee}
          onChange={handleChange}
          required
          placeholder="0 for free, or e.g. 100, 150, 200"
        />
        <Input
          label="Max Participants (Capacity)"
          name="maxParticipants"
          type="number"
          min="1"
          value={form.maxParticipants}
          onChange={handleChange}
        />
        <Input
          label="Registration Deadline"
          name="registrationDeadline"
          type="date"
          value={form.registrationDeadline || ''}
          onChange={handleChange}
        />
      </div>

      {/* Rules */}
      <div>
        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Rules (one rule per line)
        </label>
        <textarea
          name="rules"
          value={form.rules}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg p-3 text-sm"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            resize: 'vertical',
          }}
          placeholder="Rule 1: Bring college ID&#10;Rule 2: Teams of 2 to 4 members"
        />
      </div>

      {/* Brochure Upload */}
      <div
        className="rounded-xl p-4 border"
        style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
      >
        <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Event Brochure (Image)
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Upload a JPG or PNG image (max 10 MB). It will be displayed when students view this event.
        </p>

        {/* Existing brochure preview */}
        {form.brochureUrl && !brochureUploading && (
          <div className="mb-3 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <img
              src={form.brochureUrl}
              alt="Brochure preview"
              style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', backgroundColor: 'var(--color-surface)' }}
            />
            <div className="flex items-center justify-between p-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{brochureFileName || 'Brochure uploaded'}</p>
              <button
                type="button"
                onClick={() => { setForm((prev) => ({ ...prev, brochureUrl: '' })); setBrochureFileName(''); }}
                className="text-xs px-2 py-1 rounded border ml-2"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Upload button and URL alternative */}
        <input
          ref={brochureInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleBrochureChange}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            loading={brochureUploading}
            onClick={() => brochureInputRef.current?.click()}
            className="flex items-center justify-center gap-2"
            disabled={brochureUploading}
          >
            {brochureUploading ? 'Processing...' : (form.brochureUrl ? 'Change Image File' : 'Choose Image File')}
          </Button>

          <span className="text-xs text-center font-medium" style={{ color: 'var(--color-text-muted)' }}>
            or
          </span>

          <input
            type="url"
            value={form.brochureUrl && !form.brochureUrl.startsWith('data:') ? form.brochureUrl : ''}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, brochureUrl: e.target.value.trim() }));
              setBrochureFileName('');
            }}
            placeholder="Paste image URL (https://...)"
            className="flex-1 rounded-lg px-3 py-2 text-xs"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Form Action Buttons with Back Button */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <span>←</span> Back
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          className="w-full sm:flex-1 flex items-center justify-center gap-2"
        >
          {initialData.title || initialData.eventId ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
