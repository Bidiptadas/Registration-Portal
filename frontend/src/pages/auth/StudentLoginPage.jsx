import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { signIn, signOut } from '../../firebase/authService';
import { normalizeEmail } from '../../utils/authValidation';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAdmin, loading: authLoading } = useAuth();
  const successMessage = location.state?.message;
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated and verified, redirect to corresponding portal
  useEffect(() => {
    if (!authLoading && authUser && authUser.emailVerified) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authUser, isAdmin, authLoading, navigate]);

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
    let email;
    try {
      email = normalizeEmail(form.email);
    } catch {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(
        email,
        form.password
      );
      if (!user.emailVerified) {
        await signOut();
        setError(
          'Your email has not been verified. Please check your email and click the verification link before logging in.'
        );
        return;
      }

      // Check if logged-in account is an administrator
      let isAdminUser = false;
      try {
        const adminQuery = query(
          collection(db, 'admins'),
          where('authUid', '==', user.uid)
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          const data = adminSnapshot.docs[0].data();
          if (data.role === 'admin' || !data.role) {
            isAdminUser = true;
          }
        }

        if (!isAdminUser) {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            isAdminUser = true;
          }
        }

        if (!isAdminUser && user.email) {
          const emailQuery = query(
            collection(db, 'admins'),
            where('email', '==', user.email.toLowerCase())
          );
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty) {
            isAdminUser = true;
          }
        }

        if (!isAdminUser) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            isAdminUser = true;
          }
        }
      } catch (checkErr) {
        console.warn('Admin check error:', checkErr);
      }

      if (isAdminUser) {
        navigate('/admin/dashboard', {
          replace: true,
        });
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }
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
    'text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white tracking-tight';
  return (
    <div>
      {/* Header */}
      <h2 className={headerClass}>
        Student Login
      </h2>
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
          labelClassName="text-white"
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
          labelClassName="text-white"
          required
        />
        {/* Forgot Password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-lg font-bold text-sky-400 hover:text-sky-300 underline"
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
          className="py-5 text-2xl sm:text-3xl font-black rounded-2xl bg-sky-500 hover:bg-sky-400 text-white shadow-xl hover:scale-[1.01] transition-all"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </Button>
      </form>
      {/* Create Account & Admin Login */}
      <div className="mt-8 text-center text-lg font-bold text-slate-300">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-sky-400 hover:text-sky-300 underline font-black">
          Create Account
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 text-center text-sm font-semibold text-slate-400">
        Are you an event administrator?{' '}
        <Link
          to="/admin/login"
          className="text-sky-400 hover:text-sky-300 underline font-bold"
        >
          Go to Admin Login →
        </Link>
      </div>
    </div>
  );
}