
/**
 * StudentSignupPage
 * Student registration using Firebase Authentication + Cloud Firestore.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import {
  signUp,
  signOut,
} from '../../firebase/authService';
import { normalizeEmail, validatePassword } from '../../utils/authValidation';

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../firebase/firebaseConfig';

export default function StudentSignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: '',
    email: '',
    phone: '',
    college: '',
    password: '',
    confirmPassword: '',
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
    let email;
    let createdUser = null;

    try {
      email = normalizeEmail(form.email);
    } catch {
      setError('Please enter a valid email address.');
      return;
    }

    // --------------------------------------------------
    // 3. PHONE NUMBER VALIDATION
    // --------------------------------------------------
    const phone = form.phone.replace(/[\s-]/g, '');

    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid Indian mobile number.');
      return;
    }

    // --------------------------------------------------
    // 4. COLLEGE NAME VALIDATION
    // --------------------------------------------------
    const college = form.college.trim();
    if (college.length < 2) {
      setError('Please enter your college name.');
      return;
    }

    // --------------------------------------------------
    // 5. PASSWORD VALIDATION
    // --------------------------------------------------
    try {
      validatePassword(form.password);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    // --------------------------------------------------
    // 6. CONFIRM PASSWORD
    // --------------------------------------------------
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------
      // 7. CREATE FIREBASE AUTHENTICATION ACCOUNT
      // ------------------------------------------------
      createdUser = await signUp(
        email,
        form.password,
        fullName
      );

      console.log('Firebase Auth user created:', createdUser.uid);

      // ------------------------------------------------
      // 8. SAVE STUDENT DATA
      // ------------------------------------------------
      const studentData = {
        uid: createdUser.uid,
        display_name: fullName,
        email,
        phone,
        college,
        role: 'student',
        profileImageUrl: '',
        emailVerified: false,
      };

      await setDoc(doc(db, 'users', createdUser.uid), {
        ...studentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(
        'Student successfully saved to Firestore:',
        createdUser.uid
      );

      // ------------------------------------------------
      // 8. SIGN USER OUT
      // ------------------------------------------------
      await signOut();

      // ------------------------------------------------
      // 9. REDIRECT TO LOGIN
      // ------------------------------------------------
      navigate('/login', {
        state: {
          message:
            'Registration successful! A verification email has been sent to your email address. Please verify your email before logging in.',
        },
      });

    } catch (err) {
      console.error('Registration error:', err);

      if (createdUser) {
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Unable to clean up signup session:', signOutError);
        }
      }

      let message =
        'Registration failed. Please check your details and try again.';

      // Firebase Authentication errors
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
      }

      // Firestore errors
      else if (err?.code === 'permission-denied') {
        message =
          'Registration account was created, but Firestore denied saving your details. Please check your Firestore security rules.';
      } else if (err?.code === 'unavailable') {
        message =
          'Firestore is temporarily unavailable. Please check your internet connection and try again.';
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  const headerClass =
    'text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-white tracking-tight';

  const subTextClass =
    'text-xl sm:text-2xl font-semibold mb-8 text-slate-300';

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

          <span className="mt-1 text-indigo-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
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

            {/* COLLEGE NAME */}
            <Input
              label="College Name"
              name="college"
              placeholder="e.g. St. Joseph's University"
              value={form.college}
              onChange={handleChange}
              required
            />

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
        <div className="text-sm text-slate-300">

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
      <div className="mt-10 text-center text-xl font-bold text-slate-300">

        Already have an account?{' '}

        <Link
          to="/login"
          className="text-sky-400 hover:text-sky-300 underline font-black"
        >
          Log in
        </Link>

      </div>

    </div>
  );
}

