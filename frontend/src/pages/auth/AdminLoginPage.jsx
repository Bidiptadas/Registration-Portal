/** AdminLoginPage — separate admin login. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import { signIn } from '../../firebase/authService';
export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (email, password) => {
    setLoading(true); setError('');
    try { await signIn(email, password); navigate('/admin/dashboard'); }
    catch (err) { setError(err.message || 'Admin login failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Admin Login
      </h2>
      <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Access the admin panel
      </p>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}
