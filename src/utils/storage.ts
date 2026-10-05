/**
 * Dedicated localStorage utility for Private Notes.
 * Handles storage of notes, checklists, PIN configuration, settings, and folder preferences.
 */

import { Note, Folder, Checklist, UserSettings, PrivateVideo } from '../types';

const STORAGE_KEYS = {
  NOTES: 'private_notes_data_v1',
  CHECKLISTS: 'private_notes_checklists_v1',
  SETTINGS: 'private_notes_settings_v1',
  VIDEOS: 'private_notes_videos_v1',
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

export const DEFAULT_SETTINGS: UserSettings = {
  defaultFolder: 'personal',
  confirmDeleteNote: true,
  compactLayout: false,
  timerAlarmSound: true,
  accentColor: 'sky',
};

/**
 * Seed initial sample notes if new installation
 */
const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'note-welcome-1',
    title: 'Welcome to Private Notes',
    content:
      'Private Notes is your personal, distraction-free digital notebook. All notes are saved securely with PIN access control.\n\nKey features:\n• Fast instant search across titles and notes\n• Dedicated folders for Personal, Work, Ideas, and Shopping\n• Calendar view to find and attach notes by date\n• Built-in Checklists and Focus Timer\n• Quick manual lock whenever you step away',
    folder: 'personal',
    noteDate: new Date().toISOString().slice(0, 10),
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-ideas-2',
    title: 'Weekend project architecture',
    content:
      'Explore minimal, privacy-focused offline architectures:\n1. Zero external network telemetry\n2. Atomic local storage synchronization\n3. Consistent glass-morphism aesthetic in deep navy blues\n4. Touch-optimized keypad for mobile unlocking',
    folder: 'ideas',
    noteDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'note-shopping-3',
    title: 'Home office essentials',
    content:
      '• Ergonomic mechanical keyboard\n• High CRI desk lamp with warm temperature\n• Acoustic felt desk pad\n• USB-C braided cable organizer',
    folder: 'shopping',
    noteDate: new Date().toISOString().slice(0, 10),
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
];

const INITIAL_SAMPLE_CHECKLISTS: Checklist[] = [
  {
    id: 'cl-daily-routine',
    title: 'Daily Productivity Checklist',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    items: [
      { id: 'item-1', text: 'Review today’s calendar & priorities', completed: true, createdAt: Date.now() - 8000000 },
      { id: 'item-2', text: '25-minute uninterrupted focus sprint', completed: true, createdAt: Date.now() - 7000000 },
      { id: 'item-3', text: 'Organize project notes into folders', completed: false, createdAt: Date.now() - 6000000 },
      { id: 'item-4', text: 'End of day desk cleanup & shutdown', completed: false, createdAt: Date.now() - 5000000 },
    ],
  },
  {
    id: 'cl-weekly-goals',
    title: 'Weekly Milestones',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
    items: [
      { id: 'item-w1', text: 'Complete quarterly budget review', completed: true, createdAt: Date.now() - 15000000 },
      { id: 'item-w2', text: 'Draft sprint proposal', completed: false, createdAt: Date.now() - 14000000 },
      { id: 'item-w3', text: 'Sync with design team on mockups', completed: false, createdAt: Date.now() - 13000000 },
    ],
  },
];

/**
 * Basic fast hash helper for the MVP PIN storage.
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
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

  // --- Checklists Operations ---
  getChecklists(): Checklist[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      if (!raw) {
        this.saveChecklists(INITIAL_SAMPLE_CHECKLISTS);
        return INITIAL_SAMPLE_CHECKLISTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to read checklists from localStorage', e);
      return [];
    }
  },

  saveChecklists(checklists: Checklist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
    } catch (e) {
      console.error('Failed to save checklists to localStorage', e);
    }
  },

  createChecklist(title: string): Checklist {
    const lists = this.getChecklists();
    const newList: Checklist = {
      id: `cl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim() || 'Untitled Checklist',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newList, ...lists];
    this.saveChecklists(updated);
    return newList;
  },

  updateChecklist(id: string, updates: Partial<Checklist>): Checklist | null {
    const lists = this.getChecklists();
    const index = lists.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updatedList: Checklist = {
      ...lists[index],
      ...updates,
      updatedAt: Date.now(),
    };

    const copy = [...lists];
    copy[index] = updatedList;
    this.saveChecklists(copy);
    return updatedList;
  },

  deleteChecklist(id: string): boolean {
    const lists = this.getChecklists();
    const filtered = lists.filter((l) => l.id !== id);
    if (filtered.length === lists.length) return false;
    this.saveChecklists(filtered);
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

  // --- User Settings ---
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // --- Videos Operations (Fallback / Local Cache) ---
  getVideos(): PrivateVideo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read videos from localStorage', e);
      return [];
    }
  },

  saveVideos(videos: PrivateVideo[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save videos to localStorage', e);
    }
  },

  deleteVideo(id: string): boolean {
    const list = this.getVideos();
    const filtered = list.filter((v) => v.id !== id);
    if (filtered.length === list.length) return false;
    this.saveVideos(filtered);
    return true;
  },
};
