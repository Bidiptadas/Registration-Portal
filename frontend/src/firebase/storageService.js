/**
 * Firebase Storage service helpers.
 * Handles file uploads and downloads for profile images, event banners, etc.
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebaseConfig';

/**
 * Upload a file to Firebase Storage.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., "profile-images/user123/avatar.jpg")
 * @returns {Promise<string>} Download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Get the download URL for a file in Storage.
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export const getFileURL = async (path) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

/**
 * Delete a file from Storage.
 * @param {string} path - Storage path to delete
 */
export const deleteFile = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

/**
 * Upload a profile image and return its URL.
 * @param {File} file - Image file
 * @param {string} userId - User ID for path organization
 * @returns {Promise<string>} Download URL
 */
export const uploadProfileImage = async (file, userId) => {
  const path = `profile-images/${userId}/avatar.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};

/**
 * Upload an event banner image.
 * @param {File} file - Image file
 * @param {string} eventId - Event ID for path organization
 * @returns {Promise<string>} Download URL
 */
export const uploadEventImage = async (file, eventId) => {
  const path = `event-images/${eventId}/banner.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};
