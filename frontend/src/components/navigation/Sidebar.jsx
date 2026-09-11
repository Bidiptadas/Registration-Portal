/** Sidebar — collapsible side navigation for student and admin views. */
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const studentLinks = [
  { path: '/dashboard', label: 'Home' },
  { path: '/announcements', label: 'Announcements' },
  { path: '/my-registrations', label: 'My Registrations' },
  { path: '/profile', label: 'Profile' },
  { path: '/help-desk', label: 'Help Desk' },
  { path: '/receipts-payments', label: 'Receipts / Payments' },
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
  const location = useLocation();
  const { logout } = useAuth();
  const links = variant === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="app-sidebar__brand">
        <span>
          <small>Association</small>
          <strong>Technophite</strong>
        </span>
        <button
          onClick={onClose}
          className="app-sidebar__close"
          aria-label="Close navigation"
        >
          ×
        </button>
      </div>

      <nav className="app-sidebar__links">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={isActive ? 'is-active' : ''}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button type="button" className="app-sidebar__logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
