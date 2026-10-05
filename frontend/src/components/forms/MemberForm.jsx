/**
 * MemberForm — Association member details form for Admin Panel.
 * Supports: Photo (file upload or URL), Full Name, Post, Contact Number, Department, and Display Order.
 */
import { useState, useRef } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { uploadFile } from '../../firebase/storageService';

/** Helper to downscale and compress avatar image to a lightweight format (~30-50KB) */
function compressImage(file, maxWidth = 400, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('');
  });
}

export default function MemberForm({ initialData = {}, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    post: initialData.post || initialData.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '',
    phone: initialData.phone || initialData.contact || '',
    department: initialData.department || '',
    order: initialData.order !== undefined ? initialData.order : 1,
    profileImageUrl: initialData.profileImageUrl || initialData.photoUrl || initialData.photo || '',
    email: initialData.email || '',
    ...initialData,
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [useUrlMode, setUseUrlMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadError('');
    setUploadingPhoto(true);

    try {
      // 1. Immediately compress to a lightweight ~20-30KB avatar in milliseconds
      const localDataUrl = await compressImage(file, 350, 0.82);
      if (localDataUrl) {
        setForm((prev) => ({
          ...prev,
          profileImageUrl: localDataUrl,
          photoUrl: localDataUrl,
          photo: localDataUrl,
        }));
      }

      // Mark processing as done immediately so UI is never stuck
      setUploadingPhoto(false);

      // 2. Optional background attempt to upload to Firebase Storage (with 2.5s strict timeout)
      (async () => {
        try {
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storagePath = `members/${Date.now()}_${cleanFileName}`;
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 2500));
          const downloadUrl = await Promise.race([uploadFile(file, storagePath), timeout]);

          if (downloadUrl) {
            setForm((prev) => ({
              ...prev,
              profileImageUrl: downloadUrl,
              photoUrl: downloadUrl,
              photo: downloadUrl,
            }));
          }
        } catch {
          // Fallback to the compressed local data URL already set in state
        }
      })();
    } catch (err) {
      console.error('Failed to process photo:', err);
      setUploadError('Could not process this image. You can also paste an image URL.');
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      profileImageUrl: '',
      photoUrl: '',
      photo: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedPost = form.post?.trim() || 'Member';
    const payload = {
      ...form,
      name: form.name.trim(),
      post: normalizedPost,
      role: normalizedPost.toLowerCase().replace(/\s+/g, '_'),
      phone: form.phone.trim(),
      contact: form.phone.trim(),
      department: form.department.trim(),
      order: Number(form.order) || 0,
      profileImageUrl: form.profileImageUrl || '',
      photoUrl: form.profileImageUrl || '',
      photo: form.profileImageUrl || '',
      email: form.email?.trim() || '',
    };

    // Remove legacy year property
    delete payload.year;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Photo Section ── */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
      >
        <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Profile Picture
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar Preview */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-sm shrink-0 font-bold text-2xl relative"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: form.profileImageUrl ? 'var(--color-primary)' : 'var(--color-border)',
              color: 'var(--color-primary)',
            }}
          >
            {form.profileImageUrl ? (
              <img
                src={form.profileImageUrl}
                alt="Member preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('Image preview load error');
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <span
              className="flex items-center justify-center w-full h-full"
              style={{ display: form.profileImageUrl ? 'none' : 'flex' }}
            >
              {form.name ? form.name.charAt(0).toUpperCase() : 'M'}
            </span>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                Uploading...
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 w-full space-y-2">
            {!useUrlMode ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                  id="member-photo-input"
                  disabled={uploadingPhoto}
                />
                <label
                  htmlFor="member-photo-input"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border hover:bg-sky-500/10 transition-colors shadow-sm inline-block"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
                >
                  {uploadingPhoto ? 'Processing...' : form.profileImageUrl ? 'Change Photo' : 'Choose Photo File'}
                </label>

                {form.profileImageUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setUseUrlMode(true)}
                  className="text-xs text-sky-400 hover:underline ml-auto"
                >
                  Or enter image URL
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="profileImageUrl"
                    value={form.profileImageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 rounded-lg p-2 text-xs border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setUseUrlMode(false)}
                    className="px-2.5 py-1 text-xs text-sky-400 hover:underline"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Supports JPG, PNG, WEBP. Photo will be displayed on the team page.
            </p>

            {uploadError && <p className="text-xs text-red-500 font-medium">{uploadError}</p>}
          </div>
        </div>
      </div>

      {/* ── Full Name ── */}
      <Input
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="e.g. John Doe"
        required
      />

      {/* ── Post that member is in (Plain text input, no chips/options) ── */}
      <Input
        label="Post"
        name="post"
        value={form.post}
        onChange={(e) => {
          handleChange(e);
          setForm((prev) => ({
            ...prev,
            role: e.target.value.toLowerCase().replace(/\s+/g, '_'),
          }));
        }}
        placeholder="e.g. President, Vice President, Secretary, Technical Lead..."
        required
      />

      {/* ── Contact Number ── */}
      <Input
        label="Contact Number"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        placeholder="e.g. +91 98765 43210"
        required
      />

      {/* ── Department ── */}
      <Input
        label="Department"
        name="department"
        value={form.department}
        onChange={handleChange}
        placeholder="e.g. Computer Science, BCA"
        required
      />

      {/* ── Display Order & Email ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Display Order"
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
          placeholder="1"
          required
        />

        <Input
          label="Email (Optional)"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="e.g. member@sju.edu.in"
        />
      </div>

      {/* ── Submit Button ── */}
      <Button type="submit" loading={loading} fullWidth className="mt-4 py-2.5 font-bold shadow-md">
        {initialData.memberId || initialData.name ? 'Update Member Details' : 'Add Member'}
      </Button>
    </form>
  );
}
