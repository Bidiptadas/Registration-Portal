/**
 * ManageCertificatesPage — Admin Certificate Management
 * Allows admins to upload e-certificates to Firebase Storage and track records in Firestore.
 */

import { useEffect, useRef, useState } from 'react';
import certificateApi from '../../services/certificateApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';

export default function ManageCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');

  // View & Delete state
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef(null);
  const toast = useNotification();

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateApi.getAll();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      toast.error('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setFile(null);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (< 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setFormError('File size must be under 15 MB.');
        return;
      }
      setFile(selectedFile);
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Strict validation: all 3 fields required
    if (!name.trim()) {
      setFormError('Recipient Name is required.');
      return;
    }
    if (!email.trim()) {
      setFormError('Recipient Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!file) {
      setFormError('Please select a certificate file to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await certificateApi.create({
        name: name.trim(),
        email: email.trim(),
        file,
      });

      if (res.storageSaved) {
        toast.success('Certificate uploaded and saved to Firestore successfully!');
      } else {
        toast.success('Certificate saved to Firestore! (Note: Enable Cloud Storage in Firebase Console for cloud hosting)');
      }
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setFile(null);
      await loadCertificates();
    } catch (err) {
      console.error('Certificate submission failed:', err);
      setFormError(err.message || 'Failed to upload certificate. Please check Firebase Storage settings.');
      toast.error(err.message || 'Failed to upload certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await certificateApi.delete(deleteTarget.id, deleteTarget.storagePath);
      toast.success('Certificate deleted successfully.');
      setDeleteTarget(null);
      await loadCertificates();
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      toast.error('Failed to delete certificate.');
    }
  };

  const formatDate = (val) => {
    if (!val) return 'Recently';
    if (typeof val?.toDate === 'function') {
      return val.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return String(val);
  };

  const [showManualGuide, setShowManualGuide] = useState(false);

  // Filtered list
  const filteredCertificates = certificates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Manage Certificates
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Upload and issue e-certificates to event participants and winners.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="secondary"
            onClick={loadCertificates}
            className="text-xs shadow-sm"
            title="Refresh certificates from Firebase"
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowManualGuide(!showManualGuide)}
            className="text-xs shadow-sm"
          >
            {showManualGuide ? 'Hide Schema Guide' : 'Manual Firebase Guide'}
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="shadow-md text-xs"
          >
            Add Certificate
          </Button>
        </div>
      </div>

      {/* ── Manual Firebase Collection Helper Card ── */}
      {showManualGuide && (
        <div className="p-5 rounded-2xl border bg-sky-500/5 border-sky-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-sky-400">
                Manual Firebase Console Setup Guide
              </h3>
            </div>
            <button
              onClick={() => setShowManualGuide(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300">
            If adding documents manually in <strong>Firebase Console &gt; Firestore Database</strong>, use the following collection and field names:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-sky-500/20 text-sky-300">
                  <th className="py-1 px-2 font-semibold">Field Name</th>
                  <th className="py-1 px-2 font-semibold">Type</th>
                  <th className="py-1 px-2 font-semibold">Example Value</th>
                  <th className="py-1 px-2 font-semibold">Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/10 text-slate-300">
                <tr>
                  <td className="py-1.5 px-2 font-mono font-bold text-amber-400">Collection ID</td>
                  <td className="py-1.5 px-2">Collection</td>
                  <td className="py-1.5 px-2 font-mono text-sky-300">certificates</td>
                  <td className="py-1.5 px-2 text-emerald-400">Required</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">name</td>
                  <td className="py-1.5 px-2">string</td>
                  <td className="py-1.5 px-2">bhanushree</td>
                  <td className="py-1.5 px-2 text-emerald-400">Required</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">email</td>
                  <td className="py-1.5 px-2">string</td>
                  <td className="py-1.5 px-2">bhanushree2603@gmail.com</td>
                  <td className="py-1.5 px-2 text-emerald-400">Required</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">fileUrl</td>
                  <td className="py-1.5 px-2">string</td>
                  <td className="py-1.5 px-2 truncate max-w-xs">https://images.unsplash.com/... or storage URL</td>
                  <td className="py-1.5 px-2 text-emerald-400">Required</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">fileName</td>
                  <td className="py-1.5 px-2">string</td>
                  <td className="py-1.5 px-2">Certificate.png</td>
                  <td className="py-1.5 px-2 text-slate-400">Optional</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-mono text-amber-400">createdAt</td>
                  <td className="py-1.5 px-2">timestamp</td>
                  <td className="py-1.5 px-2">(Current date / timestamp)</td>
                  <td className="py-1.5 px-2 text-slate-400">Optional</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Once you click <strong>Save</strong> in Firebase Console, click the <strong>Refresh</strong> button above to immediately display it in the portal!
          </div>
        </div>
      )}

      {/* ── Search Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
          Total: {filteredCertificates.length} {filteredCertificates.length === 1 ? 'certificate' : 'certificates'}
        </p>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <EmptyState
          title="No Certificates Found"
          message={searchQuery ? 'No certificates match your search query.' : 'No certificates found in the "certificates" collection yet. Add documents via Firebase Console or click "Add Certificate".'}
          action={
            <div className="flex gap-2 mt-4">
              <Button onClick={loadCertificates} variant="secondary">
                Refresh
              </Button>
              {!searchQuery && (
                <Button onClick={handleOpenAddModal}>
                  Add Certificate
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider border-b" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Recipient Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Uploaded File</th>
                  <th className="px-5 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filteredCertificates.map((cert) => {
                  const dateStr = formatDate(cert.createdAt);

                  return (
                    <tr key={cert.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {cert.name}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {cert.email}
                      </td>
                      <td className="px-5 py-4 truncate max-w-xs text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {cert.fileName || 'certificate'}
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        {dateStr}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedCertificate(cert)}
                          className="text-xs"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(cert)}
                          className="text-xs"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Certificate Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Add New Certificate"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Upload a certificate for a student. The file will be stored in Firebase Storage and linked to the recipient's email.
          </p>

          {formError && (
            <div className="p-3 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-500">
              {formError}
            </div>
          )}

          {/* Field 1: Name */}
          <Input
            label="Recipient Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />

          {/* Field 2: Email */}
          <Input
            label="Recipient Email"
            type="email"
            placeholder="e.g. student@sju.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />

          {/* Field 3: Certificate File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Certificate File (PDF or Image) <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:border-sky-500"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                borderColor: file ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={submitting}
              />
              <div className="w-10 h-10 mx-auto mb-2 text-slate-400 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              {file ? (
                <div>
                  <p className="text-sm font-bold text-sky-500 truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Click to select certificate file
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Supports PDF, PNG, JPG (max 15 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Uploading...' : 'Save Certificate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View Certificate Modal ── */}
      {selectedCertificate && (
        <Modal
          isOpen={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
          title={`Certificate: ${selectedCertificate.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg border text-xs space-y-1" style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}>
              <p><strong>Recipient:</strong> {selectedCertificate.name}</p>
              <p><strong>Email:</strong> {selectedCertificate.email}</p>
              <p><strong>Filename:</strong> {selectedCertificate.fileName || 'certificate'}</p>
            </div>

            <div className="rounded-xl overflow-hidden border bg-neutral-900 flex items-center justify-center min-h-[400px]" style={{ borderColor: 'var(--color-border)' }}>
              {selectedCertificate.fileUrl?.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={selectedCertificate.fileUrl}
                  title="Certificate PDF Viewer"
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                />
              ) : (
                <img
                  src={selectedCertificate.fileUrl}
                  alt={`Certificate for ${selectedCertificate.name}`}
                  className="max-h-[500px] w-auto max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={selectedCertificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
              >
                <span>Open in full view</span>
                <span>↗</span>
              </a>

              <a
                href={selectedCertificate.fileUrl}
                download={selectedCertificate.fileName || 'certificate'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="primary">
                  ⬇️ Download Certificate
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Certificate"
        message={`Are you sure you want to delete the certificate for "${deleteTarget?.name}" (${deleteTarget?.email})? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
