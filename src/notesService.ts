import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Note } from './types';

const notesCollection = (userId: string) =>
  collection(db, 'users', userId, 'notes');

export async function getNotes(userId: string): Promise<Note[]> {
  const snapshot = await getDocs(notesCollection(userId));

  return snapshot.docs.map((noteDoc) => ({
    id: noteDoc.id,
    ...noteDoc.data(),
  })) as Note[];
}

export async function createNote(
  userId: string,
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Note> {
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
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt'>>
): Promise<Note | null> {
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
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);

  await deleteDoc(noteRef);
}