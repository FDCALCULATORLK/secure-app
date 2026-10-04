/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PinScreen } from './components/PinScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ChangePinModal } from './components/ChangePinModal';
import { EmptyState } from './components/EmptyState';
import { StorageService, DEFAULT_FOLDERS } from './utils/storage';
import { Note, Folder } from './types';
import { Folder as FolderIcon } from 'lucide-react';

export default function App() {
  // Authentication & Lock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(() =>
    StorageService.hasPin()
  );

  // Application Data
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>(() =>
    StorageService.getActiveFolder()
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isChangePinOpen, setIsChangePinOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load notes once unlocked or on mount
  const refreshNotes = useCallback(() => {
    const loadedNotes = StorageService.getNotes();
    setNotes(loadedNotes);
  }, []);

  useEffect(() => {
    refreshNotes();
    setHasPinConfigured(StorageService.hasPin());
  }, [refreshNotes]);

  // Handle successful PIN unlock
  const handleUnlock = () => {
    setIsUnlocked(true);
    setHasPinConfigured(true);
    refreshNotes();
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
  const handleSaveNote = (noteData: { title: string; content: string; folder: string }) => {
    if (editingNote) {
      StorageService.updateNote(editingNote.id, {
        title: noteData.title,
        content: noteData.content,
        folder: noteData.folder,
      });
    } else {
      StorageService.createNote({
        title: noteData.title,
        content: noteData.content,
        folder: noteData.folder,
      });
    }
    refreshNotes();
  };

  // Delete note
  const handleConfirmDelete = (noteId: string) => {
    StorageService.deleteNote(noteId);
    setDeletingNote(null);
    refreshNotes();
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
          setEditingNote(null);
          setIsEditorOpen(true);
        }}
        onLock={handleLock}
        onChangePin={() => setIsChangePinOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
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
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Section Breadcrumb & Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-sky-500/15">
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
                    className="text-sky-400 hover:text-sky-200 hover:underline"
                  >
                    Clear Filter
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notes Grid or Empty State */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                      setDeletingNote(selectedNote);
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
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
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
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        folders={DEFAULT_FOLDERS}
        currentActiveFolder={activeFolderId}
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
