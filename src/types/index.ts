/**
 * Data structures for Private Notes
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string; // Folder ID
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
