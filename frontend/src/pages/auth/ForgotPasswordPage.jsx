/** ForgotPasswordPage — password reset flow. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resetPassword } from '../../firebase/authService';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <span className="text-6xl block mb-6">✉️</span>
        <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Check your email
        </h2>
        <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to="/login" className="text-base font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Reset Password
      </h2>
      <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Enter your email to receive a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon="📧"
          placeholder="e.g. johndoe@sju.edu.in"
        />
        <Button type="submit" size="lg" loading={loading} fullWidth>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-base font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
