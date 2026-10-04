/**
 * NoteCard component for Private Notes.
 * Displays individual note summary in a dark-blue glassmorphic card.
 */

import React from 'react';
import { Trash2, Edit3, Calendar } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  folderName: string;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folderName,
  onEdit,
  onDelete,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today, ${timeStr}`;
    }

    const monthStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const yearStr = date.getFullYear() !== now.getFullYear() ? `, ${date.getFullYear()}` : '';
    return `${monthStr}${yearStr} · ${timeStr}`;
  };

  return (
    <div
      onClick={() => onEdit(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onEdit(note);
        }
      }}
      className="group relative glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-400"
    >
      <div>
        {/* Card Header: Title & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-sky-200 transition-colors">
            {note.title.trim() || 'Untitled Note'}
          </h3>

          <div
            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1.5 rounded-lg text-sky-300/70 hover:text-sky-200 hover:bg-sky-950/60 transition-colors"
              aria-label={`Edit ${note.title}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note)}
              title="Delete note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              aria-label={`Delete ${note.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Snippet */}
        <p className="text-xs sm:text-sm text-sky-100/70 line-clamp-3 leading-relaxed mb-4 font-normal whitespace-pre-line">
          {note.content.trim() ? note.content : 'No content yet...'}
        </p>
      </div>

      {/* Card Footer: Metadata (Unboxed, Zero-Pill discipline) */}
      <div className="pt-3 border-t border-sky-500/10 flex items-center justify-between text-[11px] text-sky-200/50">
        <span className="font-medium text-sky-300/80 tracking-wide">
          {folderName}
        </span>

        <span className="tabular-nums flex items-center gap-1">
          <Calendar className="w-3 h-3 text-sky-400/60" />
          <span>{formatDate(note.updatedAt)}</span>
        </span>
      </div>
    </div>
  );
};
