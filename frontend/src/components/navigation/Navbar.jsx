/** Navbar - authenticated navigation with user info. */
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { APP_NAME } from '../../config/constants';

export default function Navbar({ isAdmin = false, onToggleSidebar }) {
  const { user, userProfile } = useAuth();
  const userName = userProfile?.displayName
    || userProfile?.name
    || user?.displayName
    || user?.email?.split('@')[0]
    || '';
  const userInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="app-menu-toggle"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
        <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {isAdmin ? 'Admin Panel' : APP_NAME}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Avatar name={userInitial} size="sm" />
          <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--color-text-primary)' }}>
            {userName || 'User'}
          </span>
        </div>
      </div>
    </nav>
  );
}
