import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './serviceaccount.json' with { type: 'json' };

initializeApp({
  credential: cert(serviceAccount),
});

const uid = '3uZ2LjJ5Ooemra2RJeKaCR40Wzc2';

async function verifyAdmin() {
  try {
    await getAuth().updateUser(uid, {
      emailVerified: true,
    });

    console.log('Admin email verified successfully!');
  } catch (error) {
    console.error('Error verifying admin:', error);
  }
}

verifyAdmin();