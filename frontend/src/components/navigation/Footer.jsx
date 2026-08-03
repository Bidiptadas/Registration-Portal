/** Footer component — matches AuthLayout footer style. */
export default function Footer() {
  return (
    <footer className="w-full mt-auto" style={{ background: 'var(--color-primary)' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
  );
}
