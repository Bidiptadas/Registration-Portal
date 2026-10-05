/** StudentProfilePage — View student registration details (Read-only). */
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';

export default function StudentProfilePage() {
  const { userProfile, loading: authLoading } = useAuth();

  return (
    <div
      className="max-w-xl mx-auto rounded-2xl p-6 sm:p-8 shadow-sm"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Student Profile
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Your registered profile details
      </p>

      {authLoading && (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      )}

      {!authLoading && !userProfile && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your profile could not be loaded.
        </p>
      )}

      {!authLoading && userProfile && (
        <>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <Avatar name={userProfile.displayName || userProfile.display_name} size="xl" />
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {userProfile.displayName || userProfile.display_name}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {userProfile.email}
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-xl border"
            style={{ backgroundColor: 'var(--color-surface-secondary)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Name
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {userProfile.displayName || userProfile.display_name || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Email
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {userProfile.email || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Contact
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {userProfile.phone || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                College Name
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {userProfile.college || userProfile.collegeName || '—'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
