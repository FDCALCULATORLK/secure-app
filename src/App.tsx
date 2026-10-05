/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuth, logoutUser } from './authService';
import { AuthScreen } from './components/AuthScreen';
import { PinScreen } from './components/PinScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ChangePinModal } from './components/ChangePinModal';
import { EmptyState } from './components/EmptyState';
import { CalendarView } from './components/CalendarView';
import { ChecklistsView } from './components/ChecklistsView';
import { TimerView } from './components/TimerView';
import { SettingsView } from './components/SettingsView';
import { StorageService, DEFAULT_FOLDERS } from './utils/storage';
import { Note, Folder, NavigationTab, Checklist, UserSettings } from './types';
import { Folder as FolderIcon } from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from './notesService';
import {
  getChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
} from './checklistService';

export default function App() {
  // Authentication & Lock State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(() =>
    StorageService.hasPin()
  );

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('notes');

  // Application Data: Notes & Checklists
  const [notes, setNotes] = useState<Note[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>(() =>
    StorageService.getActiveFolder()
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User Preferences / Settings
  const [settings, setSettings] = useState<UserSettings>(() =>
    StorageService.getSettings()
  );

  // Modals & Panels
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isChangePinOpen, setIsChangePinOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);

  // Load notes once unlocked or on mount
  const refreshNotes = useCallback(async () => {
    if (!user) return;

    try {
      const loadedNotes = await getNotes(user.uid);
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes from Firebase:', error);
    }
  }, [user]);

  // Load checklists
  const refreshChecklists = useCallback(async () => {
    if (!user) return;

    try {
      const loadedChecklists = await getChecklists(user.uid);
      setChecklists(loadedChecklists);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotes();
      refreshChecklists();
      setHasPinConfigured(StorageService.hasPin());
    }
  }, [user, refreshNotes, refreshChecklists]);

  // Handle successful PIN unlock
  const handleUnlock = () => {
    setIsUnlocked(true);
    setHasPinConfigured(true);
    refreshNotes();
    refreshChecklists();
  };

  // Handle sign out (clear React note state, close modals, redirect to AuthScreen)
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Error logging out:', e);
    }
    setUser(null);
    setNotes([]);
    setChecklists([]);
    setIsUnlocked(false);
    setIsEditorOpen(false);
    setEditingNote(null);
    setDeletingNote(null);
    setIsChangePinOpen(false);
    setIsMobileMenuOpen(false);
    setActiveTab('notes');
  };

  // Handle manual lock
  const handleLock = () => {
    setIsUnlocked(false);
    setIsEditorOpen(false);
    setIsChangePinOpen(false);
    setDeletingNote(null);
  };

  // Folder selection
  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    StorageService.setActiveFolder(folderId);
  };

  // Save (Create or Update) note
  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    folder: string;
    noteDate?: string;
  }) => {
    if (!user) return;

    try {
      if (editingNote) {
        await updateNote(user.uid, editingNote.id, {
          title: noteData.title,
          content: noteData.content,
          folder: noteData.folder,
          noteDate: noteData.noteDate,
        });
      } else {
        await createNote(user.uid, {
          title: noteData.title,
          content: noteData.content,
          folder: noteData.folder,
          noteDate: noteData.noteDate,
        });
      }

      await refreshNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  // Request note deletion (respecting user preference for confirm modal)
  const handleDeleteRequest = (note: Note) => {
    if (settings.confirmDeleteNote) {
      setDeletingNote(note);
    } else {
      handleConfirmDelete(note.id);
    }
  };

  // Confirm delete note
  const handleConfirmDelete = async (noteId: string) => {
    if (!user) return;

    try {
      await deleteNote(user.uid, noteId);
      setDeletingNote(null);
      await refreshNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Checklists CRUD handlers
  const handleCreateChecklist = async (title: string) => {
    if (!user) return;
    try {
      await createChecklist(user.uid, title);
      await refreshChecklists();
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  const handleUpdateChecklist = async (
    checklistId: string,
    updates: Partial<Checklist>
  ) => {
    if (!user) return;
    try {
      await updateChecklist(user.uid, checklistId, updates);
      await refreshChecklists();
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!user) return;
    try {
      await deleteChecklist(user.uid, checklistId);
      await refreshChecklists();
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  // Filter notes by active folder and real-time search query
  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by Folder
    if (activeFolderId !== 'all') {
      result = result.filter((n) => n.folder === activeFolderId);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notes, activeFolderId, searchQuery]);

  // Current folder name lookup
  const currentFolderName = useMemo(() => {
    const found = DEFAULT_FOLDERS.find((f) => f.id === activeFolderId);
    return found ? found.name : 'Notes';
  }, [activeFolderId]);

  // Firebase / Auth Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#021327] text-white flex items-center justify-center">
        <p className="text-sky-400 font-medium">Loading...</p>
      </div>
    );
  }

  // No Firebase account is logged in
  if (!user) {
    return (
      <AuthScreen
        onLogin={() => {
          // Firebase listener will automatically update the user.
        }}
      />
    );
  }

  // If locked, render PIN screen
  if (!isUnlocked) {
    return (
      <PinScreen
        onUnlock={handleUnlock}
        isFirstTimeSetup={!hasPinConfigured}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#021327] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background ambient glowing shapes for depth */}
      <div
        className="pointer-events-none fixed -top-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-sky-500/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-48 -right-48 w-[36rem] h-[36rem] rounded-full bg-blue-600/15 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[28rem] rounded-full bg-cyan-600/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* Main App Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={() => {
          setSelectedCalendarDate(undefined);
          setEditingNote(null);
          setIsEditorOpen(true);
        }}
        onLock={handleLock}
        onChangePin={() => setIsChangePinOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        userEmail={user?.email}
        onLogout={handleSignOut}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar Navigation */}
        <Sidebar
          folders={DEFAULT_FOLDERS}
          activeFolderId={activeFolderId}
          onSelectFolder={handleSelectFolder}
          notes={notes}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userEmail={user?.email}
          onLogout={handleSignOut}
          onLock={handleLock}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* View 1: Notes View */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Section Breadcrumb & Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/15">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span>{currentFolderName}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : currentFolderName}
                  </h1>
                </div>

                <div className="flex items-center gap-3 text-xs text-sky-200/60">
                  <span className="tabular-nums font-medium text-sky-300">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                  {searchQuery && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-sky-400 hover:text-sky-200 hover:underline cursor-pointer"
                      >
                        Clear Filter
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notes Grid or Empty State */}
              {filteredNotes.length > 0 ? (
                <div
                  className={`grid ${
                    settings.compactLayout
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                  }`}
                >
                  {filteredNotes.map((note) => {
                    const folderObj = DEFAULT_FOLDERS.find((f) => f.id === note.folder);
                    const folderName = folderObj ? folderObj.name : 'Personal';

                    return (
                      <NoteCard
                        key={note.id}
                        note={note}
                        folderName={folderName}
                        onEdit={(selectedNote) => {
                          setEditingNote(selectedNote);
                          setIsEditorOpen(true);
                        }}
                        onDelete={(selectedNote) => {
                          handleDeleteRequest(selectedNote);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  isSearch={Boolean(searchQuery.trim())}
                  searchQuery={searchQuery}
                  folderName={currentFolderName}
                  onClearSearch={() => setSearchQuery('')}
                  onNewNote={() => {
                    setSelectedCalendarDate(undefined);
                    setEditingNote(null);
                    setIsEditorOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {/* View 2: Calendar View */}
          {activeTab === 'calendar' && (
            <CalendarView
              notes={notes}
              folders={DEFAULT_FOLDERS}
              onEditNote={(selectedNote) => {
                setEditingNote(selectedNote);
                setIsEditorOpen(true);
              }}
              onDeleteNote={handleDeleteRequest}
              onNewNoteForDate={(dateStr) => {
                setSelectedCalendarDate(dateStr);
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
            />
          )}

          {/* View 3: Checklists View */}
          {activeTab === 'checklists' && (
            <ChecklistsView
              checklists={checklists}
              onCreateChecklist={handleCreateChecklist}
              onUpdateChecklist={handleUpdateChecklist}
              onDeleteChecklist={handleDeleteChecklist}
            />
          )}

          {/* View 4: Timer View */}
          {activeTab === 'timer' && (
            <TimerView alarmSoundEnabled={settings.timerAlarmSound} />
          )}

          {/* View 5: Settings View */}
          {activeTab === 'settings' && (
            <SettingsView
              userEmail={user?.email}
              onLogout={handleSignOut}
              onChangePin={() => setIsChangePinOpen(true)}
              onLock={handleLock}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              folders={DEFAULT_FOLDERS}
            />
          )}
        </main>
      </div>

      {/* Note Creation / Editing Modal */}
      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
          setSelectedCalendarDate(undefined);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        folders={DEFAULT_FOLDERS}
        currentActiveFolder={activeFolderId === 'all' ? settings.defaultFolder : activeFolderId}
        initialDate={selectedCalendarDate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingNote)}
        note={deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
}
