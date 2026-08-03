/** VerifyEmailPage — email verification landing. */
import { Link } from 'react-router-dom';
export default function VerifyEmailPage() {
  return (
    <div className="text-center py-4">
      <span className="text-6xl block mb-6">✅</span>
      <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Email Verified!
      </h2>
      <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Your email has been verified successfully. You can now log in.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-all"
        style={{ background: 'var(--gradient-primary)' }}
      >
        Go to Login
      </Link>
    </div>
  );
}
