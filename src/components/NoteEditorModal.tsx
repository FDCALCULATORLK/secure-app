/**
 * NoteEditorModal for creating and editing notes.
 * Uses a dark blue glass panel with folder selection, title input, and content textarea.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Folder as FolderIcon, Clock, Type } from 'lucide-react';
import { Note, Folder } from '../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; content: string; folder: string }) => void;
  initialNote: Note | null;
  folders: Folder[];
  currentActiveFolder: string;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  folders,
  currentActiveFolder,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('personal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setTitle(initialNote.title);
        setContent(initialNote.content);
        setFolder(initialNote.folder);
      } else {
        setTitle('');
        setContent('');
        // If current active folder is not 'all', default to it, otherwise default to 'personal'
        setFolder(currentActiveFolder === 'all' ? 'personal' : currentActiveFolder);
      }
      setErrorMessage(null);

      // Auto-focus title
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialNote, currentActiveFolder]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      setErrorMessage('Please enter a title or note content.');
      return;
    }

    onSave({
      title: trimmedTitle || 'Untitled Note',
      content: trimmedContent,
      folder,
    });
    onClose();
  };

  // Keyboard shortcut: Escape to close, Cmd+Enter / Ctrl+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  // Selectable folders (excluding 'all')
  const assignableFolders = folders.filter((f) => f.id !== 'all');

  // Stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl glass-panel rounded-2xl border border-sky-400/25 bg-[#042144]/90 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(2, 19, 39, 0.95), 0 0 35px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            {initialNote && (
              <span className="text-[11px] text-sky-300/50 flex items-center gap-1 ml-2">
                <Clock className="w-3 h-3" />
                Updated {new Date(initialNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200/60 hover:text-white hover:bg-sky-950/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Inputs */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col mt-4 space-y-4 overflow-y-auto pr-1">
          {errorMessage && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5">
              {errorMessage}
            </div>
          )}

          {/* Folder Selector */}
          <div>
            <label className="block text-xs font-medium text-sky-300/70 mb-1.5 flex items-center gap-1.5">
              <FolderIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Folder</span>
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs sm:text-sm rounded-xl glass-input cursor-pointer bg-[#031B36]"
            >
              {assignableFolders.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#031B36] text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-sky-300/70 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-sky-400" />
              <span>Title</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3.5 py-2.5 text-sm sm:text-base font-medium rounded-xl glass-input placeholder-sky-200/40"
            />
          </div>

          {/* Content Textarea */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <label className="block text-xs font-medium text-sky-300/70 mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your private note..."
              rows={8}
              className="w-full flex-1 px-3.5 py-2.5 text-sm rounded-xl glass-input placeholder-sky-200/40 resize-none leading-relaxed font-normal"
            />
          </div>

          {/* Word & Character count metrics */}
          <div className="flex items-center justify-between text-[11px] text-sky-300/50 pt-1">
            <span className="tabular-nums">
              {wordCount} words · {charCount} characters
            </span>
            <span className="hidden sm:inline text-sky-400/40">
              Press ⌘+Enter to save
            </span>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-sky-200/70 hover:text-white hover:bg-slate-900/40 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-electric px-5 py-2 text-xs sm:text-sm font-medium text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
