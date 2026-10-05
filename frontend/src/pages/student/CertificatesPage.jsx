/**
 * CertificatesPage — User-facing Certificate Access
 * Always requires entering registered credentials (email & password) to verify identity
 * before checking and unlocking certificates.
 * Features an isolated certificate logout that only locks certificate access
 * without logging the user out of the main portal.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase/firebaseConfig';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import certificateApi from '../../services/certificateApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function CertificatesPage() {
  const { user, userProfile } = useAuth();

  // Certificate access session — always locked when opening this page
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedEmail, setUnlockedEmail] = useState('');

  // Form input state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Prefill email if the student is already logged into the portal
  useEffect(() => {
    const portalEmail = user?.email || userProfile?.email || '';
    if (portalEmail && !email) {
      setEmail(portalEmail);
    }
  }, [user, userProfile]);

  // If global portal user logs out, lock the certificate access as well
  useEffect(() => {
    if (!user) {
      setIsUnlocked(false);
      setUnlockedEmail('');
      setCertificates([]);
      setPassword('');
      setVerifyError('');
    }
  }, [user]);

  // Certificates state
  const [certificates, setCertificates] = useState([]);
  const [fetchingCerts, setFetchingCerts] = useState(false);
  const [certsLoaded, setCertsLoaded] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Fetch certificates for verified email
  const fetchCertificatesForEmail = async (targetEmail) => {
    if (!targetEmail) return;
    setFetchingCerts(true);
    try {
      const certs = await certificateApi.getByEmail(targetEmail);
      setCertificates(certs);
      setCertsLoaded(true);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setFetchingCerts(false);
    }
  };

  // Verify credentials and unlock certificates
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setVerifyError('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setVerifyError('Please enter your password.');
      return;
    }

    setVerifying(true);
    try {
      // If currently signed in as this email, re-authenticate to verify password without switching user
      if (
        auth.currentUser &&
        auth.currentUser.email &&
        auth.currentUser.email.toLowerCase() === cleanEmail.toLowerCase()
      ) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else {
        // Authenticate with Firebase Auth
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }

      // Password verified successfully! Unlock and fetch certificates
      setIsUnlocked(true);
      setUnlockedEmail(cleanEmail);
      await fetchCertificatesForEmail(cleanEmail);
    } catch (err) {
      console.error('Certificate verification failed:', err);
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
      ) {
        setVerifyError('Incorrect password or email. Please verify your credentials.');
      } else if (err?.code === 'auth/too-many-requests') {
        setVerifyError('Too many unsuccessful attempts. Please try again in a few minutes.');
      } else {
        setVerifyError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setVerifying(false);
    }
  };

  // Dedicated Certificate Logout (Only locks certificates, does NOT log out of the main portal)
  const handleCertificateLogout = () => {
    setIsUnlocked(false);
    setUnlockedEmail('');
    setCertificates([]);
    setCertsLoaded(false);
    setPassword('');
    setVerifyError('');
  };

  const handleRefresh = async () => {
    if (!unlockedEmail) return;
    await fetchCertificatesForEmail(unlockedEmail);
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

  // ─────────────────────────────────────────────────────────────
  // 1. LOCKED VIEW: Always prompts for password to verify access
  // ─────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 sm:p-8 rounded-2xl shadow-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 mb-3 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            E-Certificates Portal
          </h1>
          <p className="text-xs sm:text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Please enter your password to verify your account and check if you have received certificates.
          </p>
        </div>

        {verifyError && (
          <div className="mb-5 p-3.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-2">
            <span>{verifyError}</span>
          </div>
        )}

        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <Input
            label="Registered Email"
            type="email"
            placeholder="e.g. student@sju.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            labelClassName="!text-white text-sm sm:text-base font-semibold"
            labelStyle={{ color: '#ffffff' }}
            required
            disabled={verifying}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your registered password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            labelClassName="!text-white text-sm sm:text-base font-semibold"
            labelStyle={{ color: '#ffffff' }}
            required
            disabled={verifying}
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            loading={verifying}
            disabled={verifying}
            className="py-3 text-base font-bold shadow-lg mt-2"
          >
            {verifying ? 'Verifying...' : 'Verify & Check Certificates'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Password verification is required each time you access certificates to protect recipient privacy.
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. UNLOCKED VIEW: Display certificates with isolated logout
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              My E-Certificates
            </h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Showing verified certificates issued to <strong className="font-semibold text-sky-400">{unlockedEmail}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="text-xs shadow-sm"
            title="Refresh certificates"
            disabled={fetchingCerts}
          >
            Refresh
          </Button>

          {/* Dedicated Certificate Logout (Only locks certificates view, keeps main portal session active) */}
          <button
            onClick={handleCertificateLogout}
            className="text-xs px-3.5 py-1.5 rounded-lg border hover:bg-red-500/10 transition-colors font-medium shadow-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-danger)' }}
            title="Sign out from certificates access"
          >
            Sign out from certificates
          </button>
        </div>
      </div>

      {/* ── Certificates List ── */}
      {fetchingCerts ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : certsLoaded && certificates.length === 0 ? (
        <div className="p-8 rounded-2xl border text-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <EmptyState
            title="No Certificates Available"
            message={`No certificates have been issued yet for ${unlockedEmail}. If you participated in or won an event, please check back later or contact the event coordinators.`}
            action={
              <Button onClick={handleRefresh} variant="secondary" className="mt-4">
                Check Again
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => {
            const dateStr = formatDate(cert.createdAt);

            return (
              <div
                key={cert.id}
                className="rounded-2xl border overflow-hidden p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>

                  <h3 className="text-lg font-bold line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
                    Certificate of Achievement
                  </h3>
                  <p className="text-sm font-semibold text-sky-400 mt-0.5">
                    Issued to: {cert.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">
                    Date: {dateStr}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 text-xs py-2 flex items-center justify-center"
                  >
                    View
                  </Button>

                  <a
                    href={cert.fileUrl}
                    download={cert.fileName || 'certificate'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs py-2 flex items-center justify-center"
                    >
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Modal ── */}
      {selectedCert && (
        <Modal
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          title={`Certificate: ${selectedCert.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border bg-neutral-900 flex items-center justify-center min-h-[420px]" style={{ borderColor: 'var(--color-border)' }}>
              {selectedCert.fileUrl?.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={selectedCert.fileUrl}
                  title="Certificate PDF Viewer"
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                />
              ) : (
                <img
                  src={selectedCert.fileUrl}
                  alt={`Certificate for ${selectedCert.name}`}
                  className="max-h-[500px] w-auto max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Recipient: <strong>{selectedCert.name}</strong>
              </span>

              <a
                href={selectedCert.fileUrl}
                download={selectedCert.fileName || 'certificate'}
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
    </div>
  );
}
