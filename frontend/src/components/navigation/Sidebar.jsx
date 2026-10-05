import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const studentLinks = [
  { path: '/dashboard', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/my-registrations', label: 'My Registrations' },
  { path: '/certificates', label: 'Certificates' },
  { path: '/announcements', label: 'Notice Board' },
  { path: '/profile', label: 'Profile' },
  { path: '/receipts-payments', label: 'Receipts / Payments' },
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/announcements', label: 'Notice Board' },
  { path: '/admin/events', label: 'Manage Events' },
  { path: '/admin/certificates', label: 'Manage Certificates' },
  { path: '/admin/members', label: 'Members' },
  { path: '/admin/registrations', label: 'Registrations' },
  { path: '/admin/students', label: 'Students' },
  { path: '/admin/settings', label: 'Settings' },
];

export default function Sidebar({ variant = 'student', isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const links = variant === 'admin' ? adminLinks : studentLinks;

  const handleLogout = async () => {
    try {
      if (onClose) onClose();
      await logout();
      navigate(variant === 'admin' ? '/admin/login' : '/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
      <button type="button" className="app-sidebar__logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
