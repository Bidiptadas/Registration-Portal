import { useState } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { signIn, signOut } from '../../firebase/authService';

export default function StudentLoginPage() {
  const { isWireframe } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(
        form.email.trim(),
        form.password
      );
      if (!user.emailVerified) {
        await signOut();
        setError(
          'Your email has not been verified.Please check your email and click the verification link before logging in. '
        );
        return;
      }
      navigate('/dashboard', {
        replace: true,
      });
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Incorrect email or password.');
          break;
        case 'auth/user-not-found':
          setError('No account exists with this email.');
          break
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError(
            'Too many login attempts. Please try again later.'
          );
          break;
        case 'auth/network-request-failed':
          setError(
            'Network error. Please check your internet connection.'
          );
          break;
        default:
          setError(
            err.message || 'Login failed. Please try again.'
          );
      }
    } finally {
      setLoading(false);
    }
  };
  const headerClass =
    'text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-slate-900 tracking-tight';
  const subTextClass =
    'text-xl sm:text-2xl font-semibold mb-8 text-slate-600';
  return (
    <div>
      {/* Header */}
      <h2 className={headerClass}>
        Student Login
      </h2>
      <p className={subTextClass}>
        Log in to participate in Technophite events
      </p>
      {/* Registration Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-green-50 border-2 border-green-300 text-green-700 font-bold">
          {successMessage}
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-red-50 border-2 border-red-300 text-red-600 font-bold">
          {error}
        </div>
      )}
      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-8"
      >
        {/* Email */}
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="e.g. johndoe@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        {/* Password */}
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {/* Forgot Password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-lg font-bold text-sky-600 hover:text-sky-500 underline"
          >
            Forgot Password?
          </Link>
        </div>
        {/* Login Button */}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          fullWidth
          disabled={loading}
          className="py-5 text-2xl sm:text-3xl font-black rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-xl hover:scale-[1.01] transition-all"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </Button>
      </form>
      {/* Create Account */}
      <div className="mt-10 text-center text-xl font-bold text-slate-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-sky-600 hover:text-sky-500 underline font-black">
          Create Account
        </Link>
      </div>
    </div>
  );
}