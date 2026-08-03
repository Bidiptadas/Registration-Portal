/** HomePage — Public landing page. */
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { APP_NAME } from '../../config/constants';

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  // College Logo Image
  const CollegeLogo = () => (
    <img
      src="/sju_logo.png"
      alt="St. Joseph's University Crest"
      className="h-56 w-auto sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] object-contain hover:scale-105 transition-transform"
    />
  );

  // Technophite Logo Image
  const TechnophiteLogo = () => (
    <img
      src="/technophite_logo.jpg"
      alt="Technophite Association Logo"
      className="h-56 w-auto sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] object-contain rounded-3xl shadow-xl hover:scale-105 transition-transform"
    />
  );

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300" style={{ background: 'var(--gradient-hero)', color: 'var(--color-text-primary)' }}>
      {/* HEADER */}
      <header className="w-full shadow-2xl z-10" style={{ background: 'var(--color-primary)' }}>
        <div className="w-full flex items-center justify-between px-12 py-28 sm:px-16 md:px-36 md:py-36">
          {/* Left: College Logo */}
          <div className="flex items-center">
            <CollegeLogo />
          </div>

          {/* Center: University & Association Name */}
          <div className="flex flex-col items-center text-center px-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-wider">
              St Joseph University
            </h1>
            <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white/95 mt-4">
              Technophite Association
            </p>
          </div>

          {/* Right: Technophite Logo */}
          <div className="flex items-center">
            <TechnophiteLogo />
          </div>
        </div>
      </header>

      {/* NAVIGATION BAR RIGHT UNDER HEADER */}
      <nav className="w-full bg-[#bae6fd] shadow-md py-6 px-8 sm:px-16 border-b-2 border-sky-300">
        <div className="w-full flex items-center justify-end gap-6 sm:gap-10">
          <Link to="/signup">
            <Button size="lg" className="px-10 py-4 text-2xl sm:text-3xl font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl hover:scale-105 transition-all">
              Register
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" className="px-10 py-4 text-2xl sm:text-3xl font-black bg-sky-700 hover:bg-sky-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION (Empty placeholder section until user specifies new content) */}
      <main className="flex flex-col items-center justify-center text-center px-6 sm:px-12 py-20 sm:py-32 md:py-40 w-full max-w-7xl mx-auto min-h-screen" />

      {/* FOOTER (Pushed below initial viewport, visible on scroll) */}
      <footer className="w-full" style={{ background: 'var(--color-primary)' }}>
        <div className="w-full px-6 py-12 sm:px-10 md:px-16 md:py-16">
          <div className="grid grid-cols-1 gap-12 text-lg sm:grid-cols-3 items-start">
            {/* Left: University Address */}
            <div className="text-left">
              <h3 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-black text-white">University Address</h3>
              <p className="leading-relaxed text-2xl sm:text-3xl md:text-4xl text-white font-extrabold">
                St Joseph University<br />
                36 Lalbagh Road<br />
                Bengaluru, Karnataka - 560027
              </p>
            </div>

            {/* Middle: Connect With Us */}
            <div className="text-left sm:text-center">
              <h3 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-black text-white">Connect With Us</h3>
              <div className="space-y-4 text-2xl sm:text-3xl md:text-4xl font-extrabold flex flex-col items-start sm:items-center">
                <a
                  href="https://instagram.com/sju_technophite"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-white hover:text-white/80 hover:underline transition-colors"
                >
                  📸 Instagram: @sju_technophite
                </a>
                <a
                  href="https://linkedin.com/company/sju-technophite"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-white hover:text-white/80 hover:underline transition-colors"
                >
                  💼 LinkedIn: sju-technophite
                </a>
              </div>
            </div>

            {/* Right Corner: Contact Helpdesk */}
            <div className="text-left sm:text-right">
              <h3 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-black text-white">Contact Helpdesk</h3>
              <p className="leading-relaxed text-2xl sm:text-3xl md:text-4xl text-white font-extrabold">
                📞 +91 80 2221 1429<br />
                ✉️ technophite@sju.edu.in
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

