import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../firebase/firebaseConfig';

const REGISTRATIONS_COLLECTION = 'registrations';
const EVENTS_COLLECTION = 'events';
const USERS_COLLECTION = 'users';

export const registrationApi = {

  // --------------------------------------------------
  // INITIATE OR COMPLETE REGISTRATION FOR AN EVENT
  // --------------------------------------------------
  register: async (eventId) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        'You must be logged in to register for an event.'
      );
    }

    const uid = user.uid;
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const userRef = doc(db, USERS_COLLECTION, uid);

    let result = null;

    await runTransaction(db, async (transaction) => {
      // 1. GET EVENT
      const eventSnapshot = await transaction.get(eventRef);
      if (!eventSnapshot.exists()) {
        throw new Error('Event not found.');
      }
      const event = eventSnapshot.data();

      // 2. GET STUDENT PROFILE
      const userSnapshot = await transaction.get(userRef);
      const student = userSnapshot.exists() ? userSnapshot.data() : {};

      // 3. CHECK EVENT STATUS & DEADLINE
      if (event.isActive === false || event.status === 'closed') {
        throw new Error('This event is no longer active.');
      }

      const deadline = event.registrationDeadline?.toDate
        ? event.registrationDeadline.toDate()
        : (event.registrationDeadline ? new Date(event.registrationDeadline) : null);

      if (deadline && deadline < new Date()) {
        throw new Error('Registration deadline has passed.');
      }

      // 4. CHECK CAPACITY
      const maxParticipants = Number(
        event.maxParticipants ??
        event.max_participants ??
        50
      );
      const currentRegistrations = Number(event.currentRegistrations || 0);

      if (currentRegistrations >= maxParticipants) {
        throw new Error('This event is full.');
      }

      // 5. CHECK DUPLICATE REGISTRATION
      const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
      const duplicateQuery = query(
        registrationsRef,
        where('userId', '==', uid),
        where('eventId', '==', eventId)
      );

      const duplicateSnapshot = await getDocs(duplicateQuery);
      let existingPendingDoc = null;

      for (const d of duplicateSnapshot.docs) {
        const data = d.data();
        if (data.registrationStatus === 'CONFIRMED' || data.status === 'registered') {
          throw new Error('You are already registered for this event.');
        }
        if (data.registrationStatus === 'PAYMENT_PENDING' || data.status === 'pending') {
          existingPendingDoc = { id: d.id, ...data };
        }
      }

      const registrationFee = Number(event.registrationFee ?? event.fee ?? 0);
      const isPaid = registrationFee > 0;
      const eventTitle = event.title || event.name || event.eventName || 'College Event';
      const participantName = student.display_name || user.displayName || user.email?.split('@')[0] || 'Participant';
      const participantEmail = student.email || user.email || '';

      // 6. IF PAID EVENT: Create or reuse pending registration record
      if (isPaid) {
        const registrationRef = existingPendingDoc
          ? doc(db, REGISTRATIONS_COLLECTION, existingPendingDoc.id)
          : doc(collection(db, REGISTRATIONS_COLLECTION));

        const pendingRecord = {
          registrationId: registrationRef.id,
          userId: uid,
          eventId: eventId,
          participantName,
          email: participantEmail,
          userName: participantName,
          userEmail: participantEmail,
          eventName: eventTitle,
          eventTitle: eventTitle,
          amount: registrationFee,
          paymentStatus: 'PENDING',
          registrationStatus: 'PAYMENT_PENDING',
          status: 'pending',
          orderId: existingPendingDoc?.orderId || null,
          paymentId: null,
          registeredAt: existingPendingDoc?.registeredAt || serverTimestamp(),
          paidAt: null,
        };

        transaction.set(registrationRef, pendingRecord, { merge: true });

        result = {
          requiresPayment: true,
          registrationId: registrationRef.id,
          amount: registrationFee,
          eventName: pendingRecord.eventName,
          registration: pendingRecord,
        };
        return;
      }

      // 7. IF FREE EVENT: Confirmed immediately
      const registrationRef = doc(collection(db, REGISTRATIONS_COLLECTION));
      const confirmedRegistration = {
        registrationId: registrationRef.id,
        userId: uid,
        eventId: eventId,
        participantName,
        email: participantEmail,
        userName: participantName,
        userEmail: participantEmail,
        eventName: eventTitle,
        eventTitle: eventTitle,
        amount: 0,
        paymentStatus: 'SUCCESS',
        registrationStatus: 'CONFIRMED',
        status: 'registered',
        orderId: `free_${registrationRef.id}`,
        paymentId: 'FREE_EVENT',
        registeredAt: serverTimestamp(),
        paidAt: serverTimestamp(),
      };

      transaction.set(registrationRef, confirmedRegistration);

      const newCurrentRegistrations = currentRegistrations + 1;
      const newAvailableSpots = Math.max(0, maxParticipants - newCurrentRegistrations);

      transaction.update(eventRef, {
        currentRegistrations: newCurrentRegistrations,
        availableSpots: newAvailableSpots,
        updatedAt: serverTimestamp(),
      });

      result = {
        requiresPayment: false,
        registrationId: registrationRef.id,
        amount: 0,
        registration: confirmedRegistration,
      };
    });

    return {
      data: {
        success: true,
        data: result,
      },
    };
  },

  // --------------------------------------------------
  // GET CURRENT STUDENT'S REGISTRATIONS FROM FIRESTORE
  // --------------------------------------------------
  getMyRegistrations: async () => {
    const user = auth.currentUser;
    if (!user) {
      return { data: { success: true, data: [] } };
    }

    const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
    const q = query(
      registrationsRef,
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const registrations = snapshot.docs.map((document) => ({
      ...document.data(),
      registrationId: document.id,
    }));

    return {
      data: {
        success: true,
        data: registrations,
      },
    };
  },

  // --------------------------------------------------
  // GET REGISTRATIONS FOR AN EVENT FROM FIRESTORE
  // --------------------------------------------------
  getByEvent: async (eventId) => {
    const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
    const q = query(
      registrationsRef,
      where('eventId', '==', eventId)
    );

    const snapshot = await getDocs(q);
    const registrations = snapshot.docs.map((document) => ({
      ...document.data(),
      registrationId: document.id,
    }));

    return {
      data: {
        success: true,
        data: registrations,
      },
    };
  },

  // --------------------------------------------------
  // GET ALL REGISTRATIONS FROM FIRESTORE (ADMIN)
  // --------------------------------------------------
  getAll: async () => {
    const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
    const snapshot = await getDocs(registrationsRef);

    const registrations = snapshot.docs.map((document) => ({
      ...document.data(),
      registrationId: document.id,
    }));

    return {
      data: {
        success: true,
        data: {
          registrations,
          total: registrations.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },

  // --------------------------------------------------
  // UPDATE REGISTRATION STATUS IN FIRESTORE
  // --------------------------------------------------
  updateStatus: async (registrationId, status) => {
    const registrationRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    const registrationSnapshot = await getDoc(registrationRef);

    if (!registrationSnapshot.exists()) {
      throw new Error('Registration not found.');
    }

    const registration = registrationSnapshot.data();
    const oldStatus = registration.status;

    await updateDoc(registrationRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    if (status === 'cancelled' && oldStatus === 'registered') {
      const eventRef = doc(db, EVENTS_COLLECTION, registration.eventId);
      await runTransaction(db, async (transaction) => {
        const eventSnapshot = await transaction.get(eventRef);
        if (!eventSnapshot.exists()) return;

        const event = eventSnapshot.data();
        const current = Number(event.currentRegistrations || 0);
        const max = Number(event.maxParticipants ?? event.max_participants ?? 50);
        const newCurrent = Math.max(0, current - 1);

        transaction.update(eventRef, {
          currentRegistrations: newCurrent,
          availableSpots: Math.max(0, max - newCurrent),
          updatedAt: serverTimestamp(),
        });
      });
    }

    return {
      data: {
        success: true,
        data: {
          ...registration,
          registrationId,
          status,
        },
      },
    };
  },

  // --------------------------------------------------
  // CANCEL REGISTRATION IN FIRESTORE
  // --------------------------------------------------
  cancel: async (registrationId) => {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in to cancel a registration.');

    const registrationRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    let cancelledRegistration = null;

    await runTransaction(db, async (transaction) => {
      const registrationSnapshot = await transaction.get(registrationRef);
      if (!registrationSnapshot.exists()) throw new Error('Registration not found.');

      const registration = registrationSnapshot.data();
      if (registration.userId !== user.uid) throw new Error('You can only cancel your own registration.');
      if (registration.status !== 'registered' && registration.registrationStatus !== 'CONFIRMED') {
        throw new Error('This registration is no longer active.');
      }

      const registrationEventRef = doc(db, EVENTS_COLLECTION, registration.eventId);
      const eventSnapshot = await transaction.get(registrationEventRef);
      if (eventSnapshot.exists()) {
        const event = eventSnapshot.data();
        const eventDate = event.date?.toDate ? event.date.toDate() : (event.date ? new Date(event.date) : null);
        if (eventDate && eventDate < new Date()) throw new Error('Past event registrations cannot be cancelled.');
        const current = Number(event.currentRegistrations || 0);
        const max = Number(event.maxParticipants ?? event.max_participants ?? 50);
        transaction.update(registrationEventRef, {
          currentRegistrations: Math.max(0, current - 1),
          availableSpots: Math.max(0, max - Math.max(0, current - 1)),
          updatedAt: serverTimestamp(),
        });
      }

      cancelledRegistration = {
        ...registration,
        registrationId,
        status: 'cancelled',
        registrationStatus: 'CANCELLED',
      };
      transaction.update(registrationRef, {
        status: 'cancelled',
        registrationStatus: 'CANCELLED',
        updatedAt: serverTimestamp(),
      });
    });

    return { data: { success: true, data: cancelledRegistration } };
  },

  // --------------------------------------------------
  // REAL-TIME CURRENT STUDENT REGISTRATIONS
  // --------------------------------------------------
  subscribeToMyRegistrations: (callback) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('You must be logged in.');
    }

    const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
    const q = query(
      registrationsRef,
      where('userId', '==', user.uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const registrations = snapshot.docs.map((document) => ({
          ...document.data(),
          registrationId: document.id,
        }));
        callback(registrations);
      },
      (error) => {
        console.error('Real-time registration listener error:', error);
      }
    );
  },

  // --------------------------------------------------
  // REAL-TIME REGISTRATIONS FOR ONE EVENT
  // --------------------------------------------------
  subscribeToEventRegistrations: (eventId, callback) => {
    const registrationsRef = collection(db, REGISTRATIONS_COLLECTION);
    const q = query(
      registrationsRef,
      where('eventId', '==', eventId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const registrations = snapshot.docs.map((document) => ({
          ...document.data(),
          registrationId: document.id,
        }));
        callback(registrations);
      },
      (error) => {
        console.error('Real-time event registrations error:', error);
      }
    );
  },
};

export default registrationApi;