import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Checklist } from './types';
import { StorageService } from './utils/storage';

const checklistsCollection = (userId: string) =>
  collection(db, 'users', userId, 'checklists');

export async function getChecklists(userId: string): Promise<Checklist[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(checklistsCollection(userId));
      const lists = snapshot.docs.map((clDoc) => ({
        id: clDoc.id,
        ...clDoc.data(),
      })) as Checklist[];
      // Sort by updatedAt descending
      return lists.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.warn('Firestore checklists fetch failed, using local storage:', error);
      return StorageService.getChecklists();
    }
  }

  return StorageService.getChecklists();
}

export async function createChecklist(
  userId: string,
  title: string
): Promise<Checklist> {
  if (isFirebaseConfigured && db) {
    try {
      const listRef = doc(checklistsCollection(userId));
      const now = Date.now();
      const newList: Checklist = {
        id: listRef.id,
        title: title.trim() || 'Untitled Checklist',
        items: [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(listRef, newList);
      return newList;
    } catch (error) {
      console.warn('Firestore checklist creation failed, using local storage:', error);
      return StorageService.createChecklist(title);
    }
  }

  return StorageService.createChecklist(title);
}

export async function updateChecklist(
  userId: string,
  checklistId: string,
  updates: Partial<Checklist>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const listRef = doc(db, 'users', userId, 'checklists', checklistId);
      await setDoc(
        listRef,
        {
          ...updates,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return;
    } catch (error) {
      console.warn('Firestore checklist update failed, using local storage:', error);
      StorageService.updateChecklist(checklistId, updates);
      return;
    }
  }

  StorageService.updateChecklist(checklistId, updates);
}

export async function deleteChecklist(
  userId: string,
  checklistId: string
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const listRef = doc(db, 'users', userId, 'checklists', checklistId);
      await deleteDoc(listRef);
      return;
    } catch (error) {
      console.warn('Firestore checklist deletion failed, using local storage:', error);
      StorageService.deleteChecklist(checklistId);
      return;
    }
  }

  StorageService.deleteChecklist(checklistId);
}
