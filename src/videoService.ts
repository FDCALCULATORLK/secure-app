/**
 * Service for Private Videos in Private Notes.
 * Handles uploading video files to Firebase Storage, storing metadata in Firestore,
 * and deleting videos securely with per-user data isolation.
 * Includes local storage and IndexedDB fallback for offline/development mode.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { PrivateVideo } from './types';
import { StorageService } from './utils/storage';

export const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB limit

const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv', '.m4v', '.avi'];
const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/ogg',
];

// --- IndexedDB Helper for offline / local video file storage ---
const IDB_NAME = 'private_notes_media_v1';
const IDB_STORE = 'video_blobs';

function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveBlobOffline(id: string, blob: Blob): Promise<void> {
  try {
    const idb = await openVideoDB();
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to store video in IndexedDB:', err);
  }
}

async function getBlobOffline(id: string): Promise<Blob | null> {
  try {
    const idb = await openVideoDB();
    const tx = idb.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function deleteBlobOffline(id: string): Promise<void> {
  try {
    const idb = await openVideoDB();
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
  } catch {
    // Ignore error
  }
}

// Format bytes into human-readable string (e.g., 14.5 MB)
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Validate file type
export function isSupportedVideoFile(file: File): boolean {
  if (file.type && file.type.startsWith('video/')) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_VIDEO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

// Firestore collection reference
const videosCollection = (userId: string) =>
  collection(db, 'users', userId, 'videos');

/**
 * Fetch all private videos for a user
 */
export async function getVideos(userId: string): Promise<PrivateVideo[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(videosCollection(userId));
      const list = snapshot.docs.map((vDoc) => ({
        id: vDoc.id,
        ...vDoc.data(),
      })) as PrivateVideo[];

      // Sort newest first
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.warn('Firestore videos fetch failed, using local storage fallback:', error);
      return loadOfflineVideos();
    }
  }

  return loadOfflineVideos();
}

async function loadOfflineVideos(): Promise<PrivateVideo[]> {
  const localList = StorageService.getVideos();
  // Ensure offline object URLs are refreshed if needed
  const refreshed = await Promise.all(
    localList.map(async (v) => {
      if (v.downloadUrl.startsWith('blob:')) {
        const blob = await getBlobOffline(v.id);
        if (blob) {
          return {
            ...v,
            downloadUrl: URL.createObjectURL(blob),
          };
        }
      }
      return v;
    })
  );
  return refreshed.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Upload a private video with progress tracking
 */
export async function uploadVideo(
  userId: string,
  file: File,
  title: string,
  onProgress: (percent: number) => void
): Promise<PrivateVideo> {
  // 1. Validation: file size
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `File size (${formatBytes(file.size)}) exceeds the maximum 200 MB limit. Please select a smaller video.`
    );
  }

  // 2. Validation: format
  if (!isSupportedVideoFile(file)) {
    throw new Error(
      'Unsupported file format. Please upload an MP4, MOV, or WebM video.'
    );
  }

  const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `users/${userId}/videos/${videoId}`;
  const displayTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');

  // 3. Real Firebase Storage upload if configured
  if (isFirebaseConfigured && storage && db) {
    try {
      const videoRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(videoRef, file, {
        contentType: file.type || 'video/mp4',
        customMetadata: {
          originalName: file.name,
          uploadedBy: userId,
        },
      });

      return await new Promise<PrivateVideo>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(percent);
          },
          (error) => {
            console.error('Firebase Storage upload error:', error);
            reject(new Error(error.message || 'Failed to upload video to Firebase Storage.'));
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              const now = Date.now();

              const videoMetadata: PrivateVideo = {
                id: videoId,
                title: displayTitle,
                storagePath,
                downloadUrl,
                size: file.size,
                mimeType: file.type || 'video/mp4',
                createdAt: now,
                updatedAt: now,
              };

              // Save metadata in Firestore
              await setDoc(doc(db, 'users', userId, 'videos', videoId), videoMetadata);

              // Cache metadata locally
              const existing = StorageService.getVideos();
              StorageService.saveVideos([videoMetadata, ...existing]);

              resolve(videoMetadata);
            } catch (err: any) {
              reject(err);
            }
          }
        );
      });
    } catch (err: any) {
      console.warn('Firebase upload failed, attempting local fallback:', err);
    }
  }

  // 4. Local / Offline mode fallback
  onProgress(25);
  await new Promise((r) => setTimeout(r, 150));
  onProgress(65);
  await saveBlobOffline(videoId, file);
  onProgress(100);

  const downloadUrl = URL.createObjectURL(file);
  const now = Date.now();

  const localVideo: PrivateVideo = {
    id: videoId,
    title: displayTitle,
    storagePath,
    downloadUrl,
    size: file.size,
    mimeType: file.type || 'video/mp4',
    createdAt: now,
    updatedAt: now,
  };

  const existing = StorageService.getVideos();
  StorageService.saveVideos([localVideo, ...existing]);

  return localVideo;
}

/**
 * Delete a private video: removes the file from Storage and document from Firestore
 */
export async function deleteVideo(
  userId: string,
  video: PrivateVideo
): Promise<void> {
  // Delete from Firebase if configured
  if (isFirebaseConfigured && storage && db) {
    try {
      if (video.storagePath) {
        const fileRef = ref(storage, video.storagePath);
        await deleteObject(fileRef).catch((err) => {
          console.warn('Storage file deletion warning (may have already been deleted):', err);
        });
      }

      const docRef = doc(db, 'users', userId, 'videos', video.id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firebase deletion error:', error);
    }
  }

  // Always remove from local storage and IndexedDB
  StorageService.deleteVideo(video.id);
  await deleteBlobOffline(video.id);
}
