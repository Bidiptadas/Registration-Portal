/** HomePage - Public landing page. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studentContentApi from '../../services/studentContentApi';
import Footer from '../../components/navigation/Footer';
import './HomePage.css';

const UNIVERSITY_IMAGE_URL = 'https://www.sju.edu.in/assets/img/about/St-Josephs-University-bengaluru.webp';

const DEFAULT_CAROUSEL_IMAGES = [
  '/carousel/IMG_0005.JPG',
  '/carousel/IMG_0010.JPG',
  '/carousel/IMG_0012.JPG',
  '/carousel/IMG_9710.JPG',
  '/carousel/IMG_9819.JPG',
  '/carousel/IMG_9890.JPG',
  '/carousel/IMG_9925.JPG',
];

const ENV_CAROUSEL_IMAGES = (import.meta.env.VITE_LANDING_CAROUSEL_IMAGES || '')
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
      <img
        key={imageSource}
        src={imageSource}
        alt={imageAlt || 'Technophite event highlight'}
        className="home-carousel__image"
      />
    </div>
  );
}

export default function HomePage() {
  const [isNavigationOpen, setNavigationOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState(
    ENV_CAROUSEL_IMAGES.length > 0 ? ENV_CAROUSEL_IMAGES : DEFAULT_CAROUSEL_IMAGES
  );


  useEffect(() => {
    let isMounted = true;
    studentContentApi.getCarouselImages()
      .then((res) => {
        const dbImages = res.data?.data;
        if (isMounted && Array.isArray(dbImages) && dbImages.length > 0) {
          setCarouselImages(dbImages);
        }
      })
      .catch((err) => {
        console.warn('Could not load database carousel images, using local carousel images:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          <div className="home-page__header-row">
            <img
              src="/college-logo.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://gcsonline.co.in/upload/img/20230226210505.png';
              }}
              alt="St. Joseph's University Logo"
              className="home-page__logo home-page__logo--college"
            />
            <div className="home-page__titles">
              <p className="home-page__eyebrow">Welcome</p>
              <h1 id="home-title">St. Joseph's University</h1>
              <p className="home-page__subtitle">Technophite Association</p>
            </div>
            <img
              src="/technophite-logo.png"
              alt="Technophite Association Logo"
              className="home-page__logo home-page__logo--technophite"
            />
          </div>
        </section>
        <ImageCarousel images={carouselImages} />
      </main>
      <Footer />
    </div>
  );
}
