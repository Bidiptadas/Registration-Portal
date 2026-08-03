/** Sidebar — collapsible side navigation for student and admin views. */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const studentLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/events', label: 'Events', icon: '🎉' },
  { path: '/my-registrations', label: 'My Registrations', icon: '📝' },
  { path: '/association', label: 'Association', icon: '👥' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/events', label: 'Manage Events', icon: '🎉' },
  { path: '/admin/event-heads', label: 'Event Heads', icon: '👔' },
  { path: '/admin/members', label: 'Members', icon: '👥' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { path: '/admin/students', label: 'Students', icon: '🎓' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ variant = 'student', isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const links = variant === 'admin' ? adminLinks : studentLinks;

  return (
    <aside
      className={`flex flex-col transition-all duration-300 fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        width: collapsed ? '4rem' : '15rem',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        height: '100vh',
      }}
    >
      <div className="flex items-center justify-between p-4">
        {(!collapsed || isOpen) && (
          <span
            className="text-lg font-bold gradient-text"
            style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TP
          </span>
        )}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              onClose();
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="text-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="hidden md:inline">{collapsed ? '→' : '←'}</span>
          <span className="inline md:hidden">✕</span>
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{
                backgroundColor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span className="text-lg">{link.icon}</span>
              {(!collapsed || isOpen) && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
