/**
 * StudentSignupPage — student registration form mockup.
 * Adapts dynamically between Blueprint Wireframe and High-Fidelity Mockup modes.
 */

import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { signUp, signOut } from '../../firebase/authService';
import { authApi } from '../../services/authApi';

export default function StudentSignupPage() {
  const { isWireframe } = useOutletContext();
  const navigate = useNavigate();

  // State maps to registration requirements: Name, Email, Password, Contact Number
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Hidden defaults for existing register endpoints
    college: 'St. Joseph\'s University',
    department: 'Computer Applications',
    year: 1,
    roll_number: 'PENDING_VERIFICATION'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Firebase auth register
      const user = await signUp(form.email, form.password, form.display_name);
      const token = await user.getIdToken();
      
      // Save details to the local DB api
      await authApi.register({ ...form, id_token: token, uid: user.uid });
      await signOut();

      // Navigate to login with success message
      navigate('/login', {
        state: { message: 'Registration successful! An OTP verification email has been triggered.' }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the values.');
    } finally {
      setLoading(false);
    }
  };

  // Desktop styling headers and notifications
  const headerClass = 'text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-slate-900 tracking-tight';
  const subTextClass = 'text-xl sm:text-2xl font-semibold mb-8 text-slate-600';

  return (
    <div>
      <h2 className={headerClass}>Register Account</h2>
      <p className={subTextClass}>
        Create your account to participate in Technophite events
      </p>

      {error && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-red-50 border-2 border-red-300 text-red-600 font-bold">
          {error}
        </div>
      )}

      {/* Prominent Verification Process Info Box */}
      <div className="mb-10 p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-sm">
        <div className="flex gap-4 items-start">
          <span className="text-3xl">📧</span>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-indigo-900">Verification Process</h4>
            <p className="mt-1 text-lg sm:text-xl font-medium text-indigo-800 leading-relaxed">
              A confirmation OTP will be sent to your registered email address to verify your account before you can log in.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Desktop 2-Column Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            <Input
              label="Full Name"
              name="display_name"
              placeholder="e.g. John Doe"
              value={form.display_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. johndoe@sju.edu.in"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Contact Number"
              name="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          fullWidth
          className="py-5 text-2xl sm:text-3xl font-black rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:scale-[1.01] transition-all mt-8"
        >
          Create Account
        </Button>
      </form>

      {/* Navigation Link */}
      <div className="mt-10 text-center text-xl font-bold text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-sky-600 hover:text-sky-500 underline font-black"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

