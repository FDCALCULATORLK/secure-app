/**
 * Data structures for Private Notes
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string; // Folder ID
  noteDate?: string; // Optional calendar date in 'YYYY-MM-DD' format
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  iconName: 'all' | 'personal' | 'work' | 'ideas' | 'shopping';
}

export interface PinState {
  isSet: boolean;
  isUnlocked: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

export type NavigationTab = 'notes' | 'calendar' | 'checklists' | 'timer' | 'settings';

export interface UserSettings {
  defaultFolder: string;
  confirmDeleteNote: boolean;
  compactLayout: boolean;
  timerAlarmSound: boolean;
  accentColor: 'sky' | 'cyan' | 'blue';
}
