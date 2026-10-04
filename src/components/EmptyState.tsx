/**
 * EmptyState component for Private Notes.
 * Displays clean messages for search empty states and empty folders.
 */

import React from 'react';
import { SearchX, FilePlus2, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  isSearch: boolean;
  searchQuery?: string;
  folderName: string;
  onClearSearch?: () => void;
  onNewNote: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearch,
  searchQuery,
  folderName,
  onClearSearch,
  onNewNote,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center glass-panel rounded-2xl border border-sky-500/15 max-w-lg mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
        {isSearch ? (
          <SearchX className="w-8 h-8 text-sky-400" />
        ) : (
          <FolderOpen className="w-8 h-8 text-sky-400" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white mb-2">
        {isSearch ? 'No notes found' : `No notes in ${folderName}`}
      </h3>

      <p className="text-xs sm:text-sm text-sky-200/60 max-w-sm mb-6 leading-relaxed">
        {isSearch
          ? `We couldn't find any note matching "${searchQuery}". Check your spelling or try different keywords.`
          : 'Your thoughts, lists, and confidential drafts in this folder will appear here.'}
      </p>

      <div className="flex items-center gap-3">
        {isSearch && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-sky-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/80 border border-sky-500/20 rounded-xl transition-colors"
          >
            Clear Search
          </button>
        )}

        <button
          type="button"
          onClick={onNewNote}
          className="btn-electric px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Create Note</span>
        </button>
      </div>
    </div>
  );
};
