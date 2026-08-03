/** Navbar — top navigation bar with user info and theme toggle. */
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import { APP_NAME } from '../../config/constants';

export default function Navbar({ isAdmin = false, onToggleSidebar }) {
  const { userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-2xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {isAdmin ? 'Admin Panel' : APP_NAME}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="text-xl p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={userProfile?.displayName || ''} size="sm" />
          <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--color-text-primary)' }}>
            {userProfile?.displayName || 'User'}
          </span>
        </div>
        <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
