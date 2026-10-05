/** Navbar - authenticated navigation with branding and user info. */
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { APP_NAME } from '../../config/constants';

export default function Navbar({ isAdmin = false, onToggleSidebar }) {
  const { userProfile, isAdmin: userIsAdmin } = useAuth();
  const userName = userProfile?.displayName
    || userProfile?.name
    || userProfile?.email?.split('@')[0]
    || '';
  const userInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <nav
      className="flex items-center justify-between px-4 sm:px-8 py-5 sm:py-6 sticky top-0 z-30 transition-all backdrop-blur-md min-h-[5.75rem] sm:min-h-[7rem] md:min-h-[7.5rem]"
      style={{
        backgroundColor: 'rgba(11, 18, 34, 0.94)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.45)'
      }}
    >
      {/* ── Top Left: St Joseph's University Logo + Menu Toggle + Title Bar ── */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <Link
          to="/"
          className="flex items-center flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl"
          title="St. Joseph's University"
        >
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-lg border border-white/60 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img
              src="/college-logo.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://gcsonline.co.in/upload/img/20230226210505.png';
              }}
              alt="St. Joseph's University Logo"
              className="h-14 sm:h-20 md:h-24 w-auto object-contain max-w-[90px] sm:max-w-[130px] md:max-w-[150px]"
            />
          </div>
        </Link>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="app-menu-toggle flex-shrink-0 !w-11 !h-11 sm:!w-12 sm:!h-12"
          style={{ color: 'var(--color-text-secondary)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="h-12 sm:h-16 w-px bg-white/20 hidden sm:block flex-shrink-0" />

        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-400 leading-none truncate hidden sm:block">
            St. Joseph's University
          </span>
          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-tight truncate leading-tight mt-1">
            {isAdmin ? 'Admin Panel' : APP_NAME}
          </h2>
        </div>
      </div>

      {/* ── Top Right: Actions + User Info + Technophite Logo ── */}
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        {userIsAdmin && !isAdmin && (
          <Link
            to="/admin/dashboard"
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md flex items-center gap-2 hover:scale-[1.03]"
          >
            <span className="hidden md:inline">Admin Panel</span>
          </Link>
        )}

        <div className="flex items-center gap-2.5">
          <Avatar name={userInitial} size="md" />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-white truncate max-w-[140px] leading-snug">
              {userName || 'User'}
            </span>
            <span className="text-[11px] font-medium text-slate-400 leading-none">
              {isAdmin ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        <div className="h-12 sm:h-16 w-px bg-white/20 hidden sm:block" />

        <Link
          to="/"
          className="flex items-center group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-2xl"
          title="Technophite Association"
        >
          <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border-2 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img
              src="/technophite-logo.png"
              alt="Technophite Association Logo"
              className="h-14 sm:h-20 md:h-24 w-auto object-contain max-w-[90px] sm:max-w-[130px] md:max-w-[150px] drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
            />
          </div>
        </Link>
      </div>
    </nav>
  );
}
