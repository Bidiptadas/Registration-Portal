/**
 * StudentLoginPage — student login form mockup.
 * Adapts dynamically between Blueprint Wireframe and High-Fidelity Mockup modes.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function StudentLoginPage() {
  const { isWireframe } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  // Login form maps to 7 fields: Username, College, Reg Number, Email, Phone, Address, OTP
  const [form, setForm] = useState({
    username: '',
    college: '',
    registration_number: '',
    email: '',
    phone: '',
    address: '',
    otp: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate validation & login workflow
      if (
        !form.username ||
        !form.college ||
        !form.registration_number ||
        !form.email ||
        !form.phone ||
        !form.address ||
        !form.otp
      ) {
        throw new Error('All 7 fields are mandatory to verify identity.');
      }

      // Mock redirect to dashboard on successful verification
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Verification failed.');
      setLoading(false);
    }
  };

  const headerClass = 'text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-slate-900 tracking-tight';
  const subTextClass = 'text-xl sm:text-2xl font-semibold mb-8 text-slate-600';

  return (
    <div>
      <h2 className={headerClass}>Student Login</h2>
      <p className={subTextClass}>
        Please verify your identity using your registration details and email OTP.
      </p>

      {successMessage && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-green-50 border-2 border-green-300 text-green-700 font-bold">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-red-50 border-2 border-red-300 text-red-600 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-8">
        {/* Desktop 2-Column Grid for Login Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* Left Column: Credentials & Contact */}
          <div className="space-y-6">
            <span className="block text-xl font-black uppercase text-indigo-900 tracking-wide border-b-2 border-indigo-200 pb-2 mb-4">
              1. Academic & User Identity
            </span>

            <Input
              label="Username"
              name="username"
              placeholder="e.g. John Doe"
              value={form.username}
              onChange={handleChange}
              required
            />

            <Input
              label="College / University"
              name="college"
              placeholder="St. Joseph's University"
              value={form.college}
              onChange={handleChange}
              required
            />

            <Input
              label="Registration Number"
              name="registration_number"
              placeholder="e.g. SJU20261094"
              value={form.registration_number}
              onChange={handleChange}
              required
            />
          </div>

          {/* Right Column: Contact & Verification */}
          <div className="space-y-6">
            <span className="block text-xl font-black uppercase text-indigo-900 tracking-wide border-b-2 border-indigo-200 pb-2 mb-4">
              2. Contact & Verification OTP
            </span>

            <Input
              label="Registered Email"
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

            <Input
              label="Residential Address"
              name="address"
              placeholder="e.g. 123 MG Road, Bengaluru"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Full-width OTP Section */}
        <div className="pt-4 border-t-2 border-slate-200">
          <Input
            label="Email OTP Code"
            name="otp"
            type="text"
            maxLength={6}
            placeholder="e.g. 583902"
            value={form.otp}
            onChange={handleChange}
            required
            inputClassName="text-center text-3xl font-black tracking-[0.35em]"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          fullWidth
          className="py-5 text-2xl sm:text-3xl font-black rounded-2xl bg-sky-700 hover:bg-sky-600 text-white shadow-xl hover:scale-[1.01] transition-all mt-8"
        >
          Verify & Log In
        </Button>
      </form>

      {/* Navigation Link */}
      <div className="mt-10 text-center text-xl font-bold text-slate-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-sky-600 hover:text-sky-500 underline font-black"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

