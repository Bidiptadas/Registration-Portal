/**
 * Association API Service backed directly by Firestore.
 * Supports both 'members' and 'association_members' collections for maximum flexibility.
 */
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const PRIMARY_MEMBERS_COL = 'members';
const ALT_MEMBERS_COL = 'association_members';
const HEADS_COLLECTION = 'event_heads';

export const associationApi = {
  getMembers: async () => {
    try {
      // 1. Try 'members' collection
      let snap = await getDocs(collection(db, PRIMARY_MEMBERS_COL));
      let members = snap.docs.map((d) => ({
        memberId: d.id,
        id: d.id,
        _collection: PRIMARY_MEMBERS_COL,
        ...d.data(),
      }));

      // 2. If 'members' is empty, also check 'association_members'
      if (members.length === 0) {
        try {
          const altSnap = await getDocs(collection(db, ALT_MEMBERS_COL));
          members = altSnap.docs.map((d) => ({
            memberId: d.id,
            id: d.id,
            _collection: ALT_MEMBERS_COL,
            ...d.data(),
          }));
        } catch (altErr) {
          console.warn('Could not query association_members collection:', altErr);
        }
      }

      // Sort by order ascending
      members.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

      return { data: { success: true, data: members } };
    } catch (err) {
      console.error('Error fetching members from Firestore:', err);
      return { data: { success: true, data: [] } };
    }
  },

  createMember: async (data) => {
    let docRef;
    let targetCol = PRIMARY_MEMBERS_COL;

    try {
      docRef = await addDoc(collection(db, PRIMARY_MEMBERS_COL), data);
    } catch (primaryErr) {
      console.warn('Failed to write to "members", attempting "association_members":', primaryErr);
      docRef = await addDoc(collection(db, ALT_MEMBERS_COL), data);
      targetCol = ALT_MEMBERS_COL;
    }

    return {
      data: {
        success: true,
        data: {
          ...data,
          memberId: docRef.id,
          id: docRef.id,
          _collection: targetCol,
        },
      },
    };
  },

  updateMember: async (id, data) => {
    const targetCol = data._collection || PRIMARY_MEMBERS_COL;
    const cleanData = { ...data };
    delete cleanData._collection;
    delete cleanData.memberId;
    delete cleanData.id;

    try {
      await updateDoc(doc(db, targetCol, id), cleanData);
    } catch (err) {
      const altCol = targetCol === PRIMARY_MEMBERS_COL ? ALT_MEMBERS_COL : PRIMARY_MEMBERS_COL;
      await updateDoc(doc(db, altCol, id), cleanData);
    }

    return { data: { success: true, data: { ...cleanData, memberId: id, id } } };
  },

  deleteMember: async (id, col) => {
    const targetCol = col || PRIMARY_MEMBERS_COL;
    try {
      await deleteDoc(doc(db, targetCol, id));
    } catch (err) {
      const altCol = targetCol === PRIMARY_MEMBERS_COL ? ALT_MEMBERS_COL : PRIMARY_MEMBERS_COL;
      await deleteDoc(doc(db, altCol, id));
    }
    return { data: { success: true } };
  },

  // Event Heads
  getEventHeads: async () => {
    try {
      const snap = await getDocs(collection(db, HEADS_COLLECTION));
      const heads = snap.docs.map((d) => ({ headId: d.id, id: d.id, ...d.data() }));
      return { data: { success: true, data: heads } };
    } catch (err) {
      console.error('Error fetching event heads:', err);
      return { data: { success: true, data: [] } };
    }
  },

  createEventHead: async (data) => {
    const docRef = await addDoc(collection(db, HEADS_COLLECTION), data);
    return { data: { success: true, data: { ...data, headId: docRef.id, id: docRef.id } } };
  },

  updateEventHead: async (id, data) => {
    await updateDoc(doc(db, HEADS_COLLECTION, id), data);
    return { data: { success: true, data: { ...data, headId: id, id } } };
  },

  deleteEventHead: async (id) => {
    await deleteDoc(doc(db, HEADS_COLLECTION, id));
    return { data: { success: true } };
  },
};

export default associationApi;
