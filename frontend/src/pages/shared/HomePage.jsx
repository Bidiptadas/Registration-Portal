/** HomePage - Public landing page. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const UNIVERSITY_IMAGE_URL = 'https://www.sju.edu.in/assets/img/about/St-Josephs-University-bengaluru.webp';
const LANDING_CAROUSEL_IMAGES = (import.meta.env.VITE_LANDING_CAROUSEL_IMAGES || '')
  .split(',')
  .map((imageUrl) => imageUrl.trim())
  .filter(Boolean);

function ImageCarousel({ images = [], interval = 5000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return (
      <div className="home-carousel home-carousel--empty" aria-live="polite">
        <span>Images will appear here</span>
      </div>
    );
  }

  const activeImage = images[activeIndex % images.length];
  const imageSource = typeof activeImage === 'string' ? activeImage : activeImage.src;
  const imageAlt = typeof activeImage === 'string' ? '' : activeImage.alt;

  return (
    <div className="home-carousel" aria-live="polite">
      <img src={imageSource} alt={imageAlt} className="home-carousel__image" />
    </div>
  );
}

export default function HomePage() {
  const [isNavigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className={`home-page${isNavigationOpen ? ' home-page--navigation-open' : ''}`}>
      <div
        className="home-page__background"
        style={{ backgroundImage: `url(${UNIVERSITY_IMAGE_URL})` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="home-menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={isNavigationOpen}
        onClick={() => setNavigationOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`home-navigation${isNavigationOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
        <div className="home-navigation__brand" aria-label="Technophite Association">
          <span>
            <small>Association</small>
            <strong>Technophite</strong>
          </span>
        </div>
        <button
          type="button"
          className="home-navigation__close"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        >
          ×
        </button>
        <div className="home-navigation__links">
          <Link to="/" aria-current="page">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Register</Link>
        </div>
      </nav>
      <main className="home-page__content">
        <section className="home-page__intro" aria-labelledby="home-title">
          <p className="home-page__eyebrow">Welcome</p>
          <h1 id="home-title">St. Joseph's University</h1>
          <p className="home-page__subtitle">Technophite Association</p>
        </section>
        <ImageCarousel images={LANDING_CAROUSEL_IMAGES} />
      </main>
      <footer className="home-footer">
        <section>
          <h2>University Address</h2>
          <p>St Joseph University<br />36 Lalbagh Road<br />Bengaluru, Karnataka - 560027</p>
        </section>
        <section className="home-footer__social">
          <h2>Contact Details</h2>
          <a href="https://instagram.com/sju_technophite" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://linkedin.com/company/sju-technophite" target="_blank" rel="noreferrer">LinkedIn</a>
        </section>
      </footer>
    </div>
  );
}

