import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
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
  // REGISTER CURRENT STUDENT FOR AN EVENT
  // --------------------------------------------------
  register: async (eventId) => {

    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        'You must be logged in to register for an event.'
      );
    }

    const uid = user.uid;

    const registrationRef = doc(
      collection(db, REGISTRATIONS_COLLECTION)
    );

    const eventRef = doc(
      db,
      EVENTS_COLLECTION,
      eventId
    );

    const userRef = doc(
      db,
      USERS_COLLECTION,
      uid
    );

    let newRegistration = null;

    await runTransaction(
      db,
      async (transaction) => {

        // --------------------------------------------
        // GET EVENT
        // --------------------------------------------

        const eventSnapshot =
          await transaction.get(eventRef);

        if (!eventSnapshot.exists()) {

          throw new Error(
            'Event not found.'
          );
        }

        const event =
          eventSnapshot.data();


        // --------------------------------------------
        // GET STUDENT
        // --------------------------------------------

        const userSnapshot =
          await transaction.get(userRef);

        if (!userSnapshot.exists()) {

          throw new Error(
            'Student profile not found.'
          );
        }

        const student =
          userSnapshot.data();


        // --------------------------------------------
        // CHECK EVENT STATUS
        // --------------------------------------------

        if (event.isActive === false) {

          throw new Error(
            'This event is no longer active.'
          );
        }


        // --------------------------------------------
        // CHECK CAPACITY
        // --------------------------------------------

        const maxParticipants =
          Number(
            event.maxParticipants ??
            event.max_participants ??
            50
          );

        const currentRegistrations =
          Number(
            event.currentRegistrations || 0
          );

        if (
          currentRegistrations >=
          maxParticipants
        ) {

          throw new Error(
            'This event is full.'
          );
        }


        // --------------------------------------------
        // CHECK DUPLICATE REGISTRATION
        // --------------------------------------------

        const registrationsRef =
          collection(
            db,
            REGISTRATIONS_COLLECTION
          );

        const duplicateQuery =
          query(
            registrationsRef,
            where(
              'userId',
              '==',
              uid
            ),
            where(
              'eventId',
              '==',
              eventId
            ),
            where(
              'status',
              '==',
              'registered'
            )
          );

        const duplicateSnapshot =
          await getDocs(
            duplicateQuery
          );

        if (!duplicateSnapshot.empty) {

          throw new Error(
            'You are already registered for this event.'
          );
        }


        // --------------------------------------------
        // CREATE REGISTRATION
        // --------------------------------------------

        newRegistration = {

          registrationId:
            registrationRef.id,

          userId:
            uid,

          eventId:
            eventId,

          userName:
            student.display_name ||
            user.displayName ||
            '',

          userEmail:
            student.email ||
            user.email ||
            '',

          eventTitle:
            event.title ||
            event.name ||
            '',

          status:
            'registered',

          registeredAt:
            serverTimestamp(),
        };


        transaction.set(
          registrationRef,
          newRegistration
        );


        // --------------------------------------------
        // UPDATE EVENT COUNTERS
        // --------------------------------------------

        const newCurrentRegistrations =
          currentRegistrations + 1;

        const newAvailableSpots =
          Math.max(
            0,
            maxParticipants -
            newCurrentRegistrations
          );

        transaction.update(
          eventRef,
          {
            currentRegistrations:
              newCurrentRegistrations,

            availableSpots:
              newAvailableSpots,

            updatedAt:
              serverTimestamp(),
          }
        );
      }
    );


    return {
      data: {
        success: true,
        data: newRegistration,
      },
    };
  },


  // --------------------------------------------------
  // GET CURRENT STUDENT'S REGISTRATIONS
  // --------------------------------------------------
  getMyRegistrations: async () => {

    const user = auth.currentUser;

    if (!user) {

      throw new Error(
        'You must be logged in.'
      );
    }

    const registrationsRef =
      collection(
        db,
        REGISTRATIONS_COLLECTION
      );

    const q = query(
      registrationsRef,
      where(
        'userId',
        '==',
        user.uid
      )
    );

    const snapshot =
      await getDocs(q);

    const registrations =
      snapshot.docs.map(
        (document) => ({
          ...document.data(),
          registrationId:
            document.id,
        })
      );

    return {
      data: {
        success: true,
        data: registrations,
      },
    };
  },


  // --------------------------------------------------
  // GET REGISTRATIONS FOR AN EVENT
  // --------------------------------------------------
  getByEvent: async (eventId) => {

    const registrationsRef =
      collection(
        db,
        REGISTRATIONS_COLLECTION
      );

    const q = query(
      registrationsRef,
      where(
        'eventId',
        '==',
        eventId
      )
    );

    const snapshot =
      await getDocs(q);

    const registrations =
      snapshot.docs.map(
        (document) => ({
          ...document.data(),
          registrationId:
            document.id,
        })
      );

    return {
      data: {
        success: true,
        data: registrations,
      },
    };
  },


  // --------------------------------------------------
  // GET ALL REGISTRATIONS
  // --------------------------------------------------
  getAll: async () => {

    const registrationsRef =
      collection(
        db,
        REGISTRATIONS_COLLECTION
      );

    const snapshot =
      await getDocs(
        registrationsRef
      );

    const registrations =
      snapshot.docs.map(
        (document) => ({
          ...document.data(),
          registrationId:
            document.id,
        })
      );

    return {
      data: {
        success: true,
        data: {
          registrations,
          total:
            registrations.length,
          page: 1,
          limit: 100,
        },
      },
    };
  },


  // --------------------------------------------------
  // UPDATE REGISTRATION STATUS
  // --------------------------------------------------
  updateStatus: async (
    registrationId,
    status
  ) => {

    const registrationRef =
      doc(
        db,
        REGISTRATIONS_COLLECTION,
        registrationId
      );

    const registrationSnapshot =
      await getDoc(
        registrationRef
      );

    if (!registrationSnapshot.exists()) {

      throw new Error(
        'Registration not found.'
      );
    }

    const registration =
      registrationSnapshot.data();

    const oldStatus =
      registration.status;


    // ----------------------------------------------
    // UPDATE REGISTRATION
    // ----------------------------------------------

    await updateDoc(
      registrationRef,
      {
        status,
        updatedAt:
          serverTimestamp(),
      }
    );


    // ----------------------------------------------
    // IF CANCELLED, INCREASE AVAILABLE SPOTS
    // ----------------------------------------------

    if (
      status === 'cancelled' &&
      oldStatus === 'registered'
    ) {

      const eventRef =
        doc(
          db,
          EVENTS_COLLECTION,
          registration.eventId
        );

      await runTransaction(
        db,
        async (transaction) => {

          const eventSnapshot =
            await transaction.get(
              eventRef
            );

          if (!eventSnapshot.exists()) {
            return;
          }

          const event =
            eventSnapshot.data();

          const current =
            Number(
              event.currentRegistrations || 0
            );

          const max =
            Number(
              event.maxParticipants ??
              event.max_participants ??
              50
            );

          const newCurrent =
            Math.max(
              0,
              current - 1
            );

          transaction.update(
            eventRef,
            {
              currentRegistrations:
                newCurrent,

              availableSpots:
                Math.max(
                  0,
                  max - newCurrent
                ),

              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );
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
  // CANCEL REGISTRATION
  // --------------------------------------------------
  cancel: async (
    registrationId
  ) => {

    return registrationApi.updateStatus(
      registrationId,
      'cancelled'
    );
  },


  // --------------------------------------------------
  // REAL-TIME CURRENT STUDENT REGISTRATIONS
  // --------------------------------------------------
  subscribeToMyRegistrations: (
    callback
  ) => {

    const user =
      auth.currentUser;

    if (!user) {

      throw new Error(
        'You must be logged in.'
      );
    }

    const registrationsRef =
      collection(
        db,
        REGISTRATIONS_COLLECTION
      );

    const q = query(
      registrationsRef,
      where(
        'userId',
        '==',
        user.uid
      )
    );

    return onSnapshot(
      q,

      (snapshot) => {

        const registrations =
          snapshot.docs.map(
            (document) => ({
              ...document.data(),
              registrationId:
                document.id,
            })
          );

        callback(registrations);
      },

      (error) => {

        console.error(
          'Real-time registration listener error:',
          error
        );
      }
    );
  },


  // --------------------------------------------------
  // REAL-TIME REGISTRATIONS FOR ONE EVENT
  // --------------------------------------------------
  subscribeToEventRegistrations: (
    eventId,
    callback
  ) => {

    const registrationsRef =
      collection(
        db,
        REGISTRATIONS_COLLECTION
      );

    const q = query(
      registrationsRef,
      where(
        'eventId',
        '==',
        eventId
      )
    );

    return onSnapshot(
      q,

      (snapshot) => {

        const registrations =
          snapshot.docs.map(
            (document) => ({
              ...document.data(),
              registrationId:
                document.id,
            })
          );

        callback(registrations);
      },

      (error) => {

        console.error(
          'Real-time event registrations error:',
          error
        );
      }
    );
  },
};

export default registrationApi;