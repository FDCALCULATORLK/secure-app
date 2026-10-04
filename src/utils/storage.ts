/**
 * Dedicated localStorage utility for Private Notes.
 * Handles storage of notes, PIN configuration, and folder preferences.
 */

import { Note, Folder } from '../types';

const STORAGE_KEYS = {
  NOTES: 'private_notes_data_v1',
  PIN_HASH: 'private_notes_pin_v1',
  ACTIVE_FOLDER: 'private_notes_active_folder_v1',
  LOCK_STATE: 'private_notes_locked_v1',
};

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Notes', iconName: 'all' },
  { id: 'personal', name: 'Personal', iconName: 'personal' },
  { id: 'work', name: 'Work', iconName: 'work' },
  { id: 'ideas', name: 'Ideas', iconName: 'ideas' },
  { id: 'shopping', name: 'Shopping', iconName: 'shopping' },
];

/**
 * Seed initial sample notes if new installation
 */
const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'note-welcome-1',
    title: 'Welcome to Private Notes',
    content:
      'Private Notes is your personal, distraction-free digital notebook. All notes are saved entirely in your local browser storage with PIN access control.\n\nKey features:\n• Fast instant search across titles and notes\n• Dedicated folders for Personal, Work, Ideas, and Shopping\n• Quick manual lock whenever you step away\n• Responsive layout for desktop and mobile',
    folder: 'personal',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-ideas-2',
    title: 'Weekend project architecture',
    content:
      'Explore minimal, privacy-focused offline architectures:\n1. Zero external network telemetry\n2. Atomic local storage synchronization\n3. Consistent glass-morphism aesthetic in deep navy blues\n4. Touch-optimized keypad for mobile unlocking',
    folder: 'ideas',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'note-shopping-3',
    title: 'Home office essentials',
    content:
      '• Ergonomic mechanical keyboard\n• High CRI desk lamp with warm temperature\n• Acoustic felt desk pad\n• USB-C braided cable organizer',
    folder: 'shopping',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
];

/**
 * Basic fast hash helper for the MVP PIN storage.
 * Note: As noted in prompt, this is designed for local privacy barrier;
 * future versions can implement PBKDF2 / Web Crypto API.
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `pn_h_${Math.abs(hash).toString(36)}_${input.length}`;
}

export const StorageService = {
  // --- PIN Operations ---
  hasPin(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
      return Boolean(stored && stored.length > 0);
    } catch {
      return false;
    }
  },

  setPin(pin: string): boolean {
    try {
      if (pin.length < 4 || pin.length > 6) return false;
      const hashed = simpleHash(pin);
      localStorage.setItem(STORAGE_KEYS.PIN_HASH, hashed);
      return true;
    } catch (e) {
      console.error('Failed to set PIN', e);
      return false;
    }
  },

  verifyPin(pin: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
      if (!stored) return false;
      return stored === simpleHash(pin);
    } catch (e) {
      console.error('Failed to verify PIN', e);
      return false;
    }
  },

  // --- Notes Operations ---
  getNotes(): Note[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!raw) {
        // First run seed
        this.saveNotes(INITIAL_SAMPLE_NOTES);
        return INITIAL_SAMPLE_NOTES;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to read notes from localStorage', e);
      return [];
    }
  },

  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  },

  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    this.saveNotes(updated);
    return newNote;
  },

  updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const updatedNote: Note = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    };

    const updatedList = [...notes];
    updatedList[index] = updatedNote;
    this.saveNotes(updatedList);
    return updatedNote;
  },

  deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveNotes(filtered);
    return true;
  },

  // --- Active Folder Preference ---
  getActiveFolder(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_FOLDER) || 'all';
    } catch {
      return 'all';
    }
  },

  setActiveFolder(folderId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FOLDER, folderId);
    } catch (e) {
      console.error('Failed to save active folder', e);
    }
  },
};
