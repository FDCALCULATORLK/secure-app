/**
 * Sidebar navigation component for Private Notes.
 * Displays folders: All Notes, Personal, Work, Ideas, Shopping with counts.
 */

import React from 'react';
import { BookOpen, User, Briefcase, Lightbulb, ShoppingCart, Shield } from 'lucide-react';
import { Folder, Note } from '../types';

interface SidebarProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  notes: Note[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  notes,
  isMobileOpen,
  onCloseMobile,
}) => {
  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'personal':
        return <User className="w-4 h-4 text-sky-400" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'ideas':
        return <Lightbulb className="w-4 h-4 text-sky-400" />;
      case 'shopping':
        return <ShoppingCart className="w-4 h-4 text-sky-400" />;
      case 'all':
      default:
        return <BookOpen className="w-4 h-4 text-sky-400" />;
    }
  };

  const getFolderCount = (folderId: string) => {
    if (folderId === 'all') return notes.length;
    return notes.filter((n) => n.folder === folderId).length;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 lg:w-64 glass-panel md:border-r border-sky-500/20 bg-[#031B36]/90 md:bg-transparent flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Navigation Title */}
          <div className="px-3 py-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/60">
              Folders
            </span>
          </div>

          {/* Folder List */}
          <nav className="space-y-1">
            {folders.map((folder) => {
              const isActive = activeFolderId === folder.id;
              const count = getFolderCount(folder.id);

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/25 to-blue-600/15 border border-sky-400/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                      : 'text-sky-200/70 hover:text-white hover:bg-slate-900/40 hover:border hover:border-sky-500/20 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="shrink-0">{getFolderIcon(folder.iconName)}</span>
                    <span className="truncate">{folder.name}</span>
                  </div>

                  <span
                    className={`text-xs tabular-nums ${
                      isActive ? 'text-sky-300 font-semibold' : 'text-sky-300/40'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Local Storage Guarantee Badge */}
        <div className="pt-4 border-t border-sky-500/15">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-sky-500/15 text-sky-200/70 text-xs">
            <div className="flex items-center gap-2 text-sky-300 font-medium mb-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Offline & Local</span>
            </div>
            <p className="text-[11px] text-sky-200/50 leading-relaxed">
              Notes never leave your browser. Data is saved directly to localStorage.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
