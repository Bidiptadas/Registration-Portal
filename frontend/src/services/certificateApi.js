/**
 * Certificate Service
 * Handles certificate uploads to Firebase Storage and metadata storage in Firestore.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { uploadFile, deleteFile } from '../firebase/storageService';

const CERTIFICATES_COLLECTION = 'certificates';

export const certificateApi = {
  /**
   * Upload certificate file to Firebase Storage and save record in Firestore.
   * Schema:
   * name      → string
   * email     → string
   * userId    → string
   * fileUrl   → string
   * createdAt → timestamp
   */
  create: async ({ name, email, file }) => {
    if (!name || !name.trim()) {
      throw new Error('Recipient name is required.');
    }
    if (!email || !email.trim()) {
      throw new Error('Recipient email is required.');
    }
    if (!file) {
      throw new Error('Certificate file is required.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Find matching student userId if registered
    let matchedUserId = '';
    try {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', cleanEmail));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        matchedUserId = userSnapshot.docs[0].id;
      }
    } catch (err) {
      console.warn('Could not query users collection for userId:', err);
    }

    // 2. Upload file to Firebase Storage: certificates/certificate_<timestamp>_<name>.<ext>
    const ext = file.name.split('.').pop() || 'pdf';
    const safeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `certificates/certificate_${Date.now()}_${safeBase}.${ext}`;

    let fileUrl = '';
    let storageSaved = false;

    const readFileAsDataUrl = (fileObj) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(fileObj);
      });
    };

    try {
      // 8-second timeout for Firebase Storage attempt
      fileUrl = await Promise.race([
        uploadFile(file, storagePath),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase Storage timed out')), 8000)
        ),
      ]);
      storageSaved = true;
    } catch (storageErr) {
      console.warn('Firebase Storage upload failed or bucket not provisioned, using direct data reference:', storageErr);
      // Fallback: Read as data URL so submission succeeds and Firestore collection/document is created immediately!
      fileUrl = await readFileAsDataUrl(file);
    }

    // 3. Save to Firestore "certificates" collection
    const certData = {
      name: cleanName,
      email: cleanEmail,
      userId: matchedUserId,
      fileUrl,
      fileName: file.name,
      storagePath: storageSaved ? storagePath : '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), certData);

    return {
      id: docRef.id,
      storageSaved,
      ...certData,
    };
  },

  /**
   * Get all certificates (Admin view).
   * Robust against manually created Firestore documents with varied field types.
   */
  getAll: async () => {
    const certsRef = collection(db, CERTIFICATES_COLLECTION);
    const snapshot = await getDocs(certsRef);

    const certificates = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || 'Unnamed Recipient',
        email: data.email || '',
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || (data.fileUrl ? data.fileUrl.split('/').pop().split('?')[0] : 'certificate'),
        storagePath: data.storagePath || '',
        userId: data.userId || '',
        createdAt: data.createdAt || null,
        ...data,
      };
    });

    // Universal date parser for timestamps, dates, strings, or missing values
    const parseTime = (val) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (val.seconds) return val.seconds * 1000;
      if (val instanceof Date) return val.getTime();
      const parsed = Date.parse(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    certificates.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));

    return certificates;
  },

  /**
   * Get certificates for a specific student email (User view).
   * Handles case-insensitive email matching and manually added Firestore entries.
   */
  getByEmail: async (email) => {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    const rawEmail = email.trim();
    const certsRef = collection(db, CERTIFICATES_COLLECTION);

    const parseTime = (val) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (val.seconds) return val.seconds * 1000;
      if (val instanceof Date) return val.getTime();
      const parsed = Date.parse(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    let certificates = [];

    // Attempt 1: Fetch and filter client-side (best for manual entries where casing might differ)
    try {
      const snapshot = await getDocs(certsRef);
      certificates = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .filter((c) => {
          const cEmail = (c.email || '').toString().trim().toLowerCase();
          return cEmail === cleanEmail;
        });
    } catch (err) {
      console.warn('Full collection fetch failed, falling back to query by email:', err);
      // Attempt 2: Direct query by email variants
      try {
        const emailVariants = Array.from(new Set([cleanEmail, rawEmail].filter(Boolean)));
        const q = query(certsRef, where('email', 'in', emailVariants));
        const snapshot = await getDocs(q);
        certificates = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      } catch (innerErr) {
        console.error('Error querying certificates by email:', innerErr);
        throw innerErr;
      }
    }

    certificates.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));

    return certificates;
  },

  /**
   * Delete a certificate document and its file from Storage (if applicable).
   */
  delete: async (id, storagePath) => {
    await deleteDoc(doc(db, CERTIFICATES_COLLECTION, id));
    if (storagePath) {
      try {
        await deleteFile(storagePath);
      } catch (err) {
        console.warn('Could not delete file from storage (safe to ignore for manual entries):', err);
      }
    }
    return true;
  },
};

export default certificateApi;
