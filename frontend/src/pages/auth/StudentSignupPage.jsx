/**
 * StudentSignupPage
 * Student registration using Firebase Authentication.
 */

import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import {
  signUp,
  signOut,
  verifyEmail,
} from '../../firebase/authService';

import { authApi } from '../../services/authApi';

export default function StudentSignupPage() {
  const { isWireframe } = useOutletContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',

    // Existing registration defaults
    college: "St. Joseph's University",
    department: 'Computer Applications',
    year: 1,
    roll_number: 'PENDING_VERIFICATION',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // --------------------------------------------------
    // 1. FULL NAME VALIDATION
    // --------------------------------------------------

    const fullName = form.display_name.trim();

    if (fullName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    // --------------------------------------------------
    // 2. EMAIL VALIDATION
    // --------------------------------------------------

    const email = form.email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // --------------------------------------------------
    // 3. PHONE NUMBER VALIDATION
    // --------------------------------------------------

    // Accepts:
    // +91 9876543210
    // +91-9876543210
    // 9876543210
    // 09876543210

    const phone = form.phone.replace(/[\s-]/g, '');

    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      setError(
        'Please enter a valid Indian mobile number.'
      );
      return;
    }

    // --------------------------------------------------
    // 4. PASSWORD VALIDATION
    // --------------------------------------------------

    if (form.password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    // --------------------------------------------------
    // 5. CONFIRM PASSWORD
    // --------------------------------------------------

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------
      // 6. CREATE FIREBASE ACCOUNT
      // ------------------------------------------------

      const user = await signUp(
        email,
        form.password,
        fullName
      );

      // ------------------------------------------------
      // 7. SEND FIREBASE EMAIL VERIFICATION
      // ------------------------------------------------

      await verifyEmail();

      // ------------------------------------------------
      // 8. GET FIREBASE ID TOKEN
      // ------------------------------------------------

      const token = await user.getIdToken();

      // ------------------------------------------------
      // 9. SAVE STUDENT DETAILS
      // ------------------------------------------------

      await authApi.register({
        ...form,
        display_name: fullName,
        email: email,
        phone: phone,
        id_token: token,
        uid: user.uid,
      });

      // ------------------------------------------------
      // 10. SIGN USER OUT
      // ------------------------------------------------

      await signOut();

      // ------------------------------------------------
      // 11. REDIRECT TO LOGIN
      // ------------------------------------------------

      navigate('/login', {
        state: {
          message:
            'Registration successful! A verification email has been sent to your email address. Please verify your email before logging in.',
        },
      });

    } catch (err) {
      console.error('Registration error:', err);

      let message =
        'Registration failed. Please check your details and try again.';

      // Firebase errors
      if (err?.code === 'auth/email-already-in-use') {
        message =
          'An account with this email address already exists.';
      } else if (err?.code === 'auth/invalid-email') {
        message =
          'The email address is invalid.';
      } else if (err?.code === 'auth/weak-password') {
        message =
          'The password is too weak.';
      } else if (err?.code === 'auth/network-request-failed') {
        message =
          'Network error. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);

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

      {/* PAGE HEADER */}
      <h2 className={headerClass}>
        Register Account
      </h2>

      <p className={subTextClass}>
        Create your account to participate in Technophite events
      </p>


      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 text-lg rounded-xl bg-red-50 border-2 border-red-300 text-red-600 font-bold">
          {error}
        </div>
      )}


      {/* VERIFICATION INFORMATION */}
      <div className="mb-10 p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-sm">

        <div className="flex gap-4 items-start">

          <span className="text-3xl">
            📧
          </span>

          <div>

            <h4 className="text-xl sm:text-2xl font-black text-indigo-900">
              Verification Process
            </h4>

            <p className="mt-1 text-lg sm:text-xl font-medium text-indigo-800 leading-relaxed">
              A verification email will be sent to your registered
              email address. Please click the verification link
              before logging in.
            </p>

          </div>

        </div>

      </div>


      {/* REGISTRATION FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* TWO COLUMN FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">


          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* FULL NAME */}
            <Input
              label="Full Name"
              name="display_name"
              placeholder="e.g. John Doe"
              value={form.display_name}
              onChange={handleChange}
              required
            />


            {/* EMAIL */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. johndoe@sju.edu.in"
              value={form.email}
              onChange={handleChange}
              required
            />


            {/* PHONE */}
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


          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* PASSWORD */}
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter a strong password"
              value={form.password}
              onChange={handleChange}
              required
            />


            {/* CONFIRM PASSWORD */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

        </div>


        {/* PASSWORD REQUIREMENTS */}
        <div className="text-sm text-slate-500">
          Password must contain at least:
          <ul className="list-disc ml-5 mt-1">
            <li>8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>


        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          fullWidth
          disabled={loading}
          className="py-5 text-2xl sm:text-3xl font-black rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:scale-[1.01] transition-all mt-8"
        >
          {loading
            ? 'Creating Account...'
            : 'Create Account'}
        </Button>

      </form>


      {/* LOGIN LINK */}
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