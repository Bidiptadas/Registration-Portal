/** AuthLayout - shared shell for login and registration pages. */
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/navigation/Footer';
import './AuthLayout.css';

const UNIVERSITY_IMAGE_URL = 'https://www.sju.edu.in/assets/img/about/St-Josephs-University-bengaluru.webp';

export default function AuthLayout() {
  const [isWireframe] = useState(false);
  const [isNavigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className={`auth-layout${isNavigationOpen ? ' auth-layout--navigation-open' : ''}`}>
      <div
        className="auth-layout__background"
        style={{ backgroundImage: `url(${UNIVERSITY_IMAGE_URL})` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="auth-menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={isNavigationOpen}
        onClick={() => setNavigationOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`auth-navigation${isNavigationOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
        <div className="auth-navigation__brand">Association<strong>Technophite</strong></div>
        <button type="button" className="auth-navigation__close" onClick={() => setNavigationOpen(false)} aria-label="Close navigation">×</button>
        <div className="auth-navigation__links">
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/signup">Register</a>
        </div>
      </nav>
      <main className="auth-layout__main">
        <div className="auth-layout__card">
          <Outlet context={{ isWireframe }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
