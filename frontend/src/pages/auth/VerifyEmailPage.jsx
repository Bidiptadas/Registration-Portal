/** VerifyEmailPage — email verification landing. */
import { Link } from 'react-router-dom';
export default function VerifyEmailPage() {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}>
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
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
