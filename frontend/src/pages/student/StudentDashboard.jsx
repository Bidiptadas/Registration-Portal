
/**
 * StudentDashboard
 * Personalized dashboard for students.
 * Uses Firebase Authentication + Cloud Firestore.
 * Student profile is updated in real time using onSnapshot().
 */

import { useEffect, useState } from 'react';

import { useAuth } from '../../hooks/useAuth';

import StatsCard from '../../components/cards/StatsCard';
import Loader from '../../components/common/Loader';

import {
  doc,
  onSnapshot,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../firebase/firebaseConfig';

export default function StudentDashboard() {

  const { userProfile } = useAuth();

  const [student, setStudent] = useState(null);

  const [stats, setStats] = useState({
    registeredCount: 0,
    upcomingEvents: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  // --------------------------------------------------
  // REAL-TIME STUDENT DATA
  // --------------------------------------------------
  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {
      console.error('No authenticated Firebase user found.');
      setError('You are not logged in.');
      setLoading(false);
      return;
    }

    console.log('Logged-in Firebase UID:', user.uid);

    // Reference to:
    // Firestore → users → {uid}
    const studentRef = doc(
      db,
      'users',
      user.uid
    );

    // Listen for real-time changes
    const unsubscribe = onSnapshot(
      studentRef,

      (snapshot) => {

        if (snapshot.exists()) {

          const studentData = {
            id: snapshot.id,
            ...snapshot.data(),
          };

          console.log(
            'Real-time student data:',
            studentData
          );

          setStudent(studentData);

        } else {

          console.error(
            'Student document does not exist in Firestore.'
          );

          setError(
            'Student profile was not found in the database.'
          );

          setStudent(null);
        }

        setLoading(false);
      },

      (error) => {

        console.error(
          'Firestore real-time listener error:',
          error
        );

        setError(
          'Unable to load your student information.'
        );

        setLoading(false);
      }
    );

    // Stop listening when component is unmounted
    return () => {
      unsubscribe();
    };

  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return <Loader />;
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------
  if (error) {
    return (
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
        }}
      >
        {error}
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------
  return (

    <div>

      {/* WELCOME MESSAGE */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{
          color: 'var(--color-text-primary)',
        }}
      >
        Welcome back,{' '}

        {student?.display_name ||
          userProfile?.displayName ||
          'Student'}
        !
      </h1>

      <p
        className="text-sm mb-6"
        style={{
          color: 'var(--color-text-secondary)',
        }}
      >
        Here is your Tecnophite overview.
      </p>

      {/* STUDENT INFORMATION */}
      <div
        className="mb-6 p-5 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >

        <h2
          className="text-lg font-bold mb-4"
          style={{
            color: 'var(--color-text-primary)',
          }}
        >
          Student Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>Name:</strong>{' '}
            {student?.display_name || '—'}
          </p>

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>Email:</strong>{' '}
            {student?.email || '—'}
          </p>

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>Phone:</strong>{' '}
            {student?.phone || '—'}
          </p>

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>College:</strong>{' '}
            {student?.college || '—'}
          </p>

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>Department:</strong>{' '}
            {student?.department || '—'}
          </p>

          <p
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong>Year:</strong>{' '}
            {student?.year || '—'}
          </p>

        </div>

      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">

        <StatsCard
          title="Registered Events"
          value={stats.registeredCount}
          icon="📝"
          color="var(--color-primary)"
        />

        <StatsCard
          title="Available Events"
          value={stats.upcomingEvents}
          icon="🎉"
          color="var(--color-secondary)"
        />

      </div>

    </div>
  );
}
