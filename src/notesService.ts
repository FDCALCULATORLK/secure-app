import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Note } from './types';
import { StorageService } from './utils/storage';

const notesCollection = (userId: string) =>
  collection(db, 'users', userId, 'notes');

export async function getNotes(userId: string): Promise<Note[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(notesCollection(userId));
      return snapshot.docs.map((noteDoc) => ({
        id: noteDoc.id,
        ...noteDoc.data(),
      })) as Note[];
    } catch (error) {
      console.warn('Firestore fetch failed, falling back to local storage:', error);
      return StorageService.getNotes();
    }
  }

  return StorageService.getNotes();
}

export async function createNote(
  userId: string,
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Note> {
  if (isFirebaseConfigured && db) {
    try {
      const noteRef = doc(notesCollection(userId));
      const now = Date.now();
      const newNote: Note = {
        ...note,
        id: noteRef.id,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(noteRef, newNote);
      return newNote;
    } catch (error) {
      console.warn('Firestore create failed, falling back to local storage:', error);
      return StorageService.createNote(note);
    }
  }

  return StorageService.createNote(note);
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt'>>
): Promise<Note | null> {
  if (isFirebaseConfigured && db) {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', noteId);
      const updatedData = {
        ...updates,
        updatedAt: Date.now(),
      };

      await setDoc(noteRef, updatedData, { merge: true });

      return {
        id: noteId,
        ...updatedData,
      } as Note;
    } catch (error) {
      console.warn('Firestore update failed, falling back to local storage:', error);
      return StorageService.updateNote(noteId, updates);
    }
  }

  return StorageService.updateNote(noteId, updates);
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', noteId);
      await deleteDoc(noteRef);
      return;
    } catch (error) {
      console.warn('Firestore delete failed, falling back to local storage:', error);
      StorageService.deleteNote(noteId);
      return;
    }
  }

  StorageService.deleteNote(noteId);
}