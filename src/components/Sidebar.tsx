/**
 * Sidebar navigation component for Private Notes.
 * Displays top navigation tools (Notes, Calendar, Checklists, Timer, Settings),
 * followed by folder selection when in Notes view, and user profile / logout actions.
 */

import React from 'react';
import {
  BookOpen,
  User as UserIcon,
  Briefcase,
  Lightbulb,
  ShoppingCart,
  Calendar,
  CheckSquare,
  Timer,
  Film,
  Settings,
  Lock,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { Folder, Note, NavigationTab } from '../types';

interface SidebarProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  notes: Note[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userEmail?: string | null;
  onLogout?: () => void;
  onLock?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  notes,
  isMobileOpen,
  onCloseMobile,
  activeTab,
  onSelectTab,
  userEmail,
  onLogout,
  onLock,
}) => {
  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'personal':
        return <UserIcon className="w-4 h-4 text-sky-400" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'ideas':
        return <Lightbulb className="w-4 h-4 text-sky-400" />;
      case 'shopping':
        return <ShoppingCart className="w-4 h-4 text-sky-400" />;
      case 'all':
      default:
        return <FolderOpen className="w-4 h-4 text-sky-400" />;
    }
  };

  const getFolderCount = (folderId: string) => {
    if (folderId === 'all') return notes.length;
    return notes.filter((n) => n.folder === folderId).length;
  };

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'notes', label: 'Notes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'checklists', label: 'Checklists', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Film className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

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
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 lg:w-64 glass-panel md:border-r border-sky-500/20 bg-[#031B36]/95 md:bg-transparent flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5 overflow-y-auto">
          {/* Primary Navigation */}
          <div>
            <div className="px-3 py-1.5 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/60">
                Navigation
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/25 to-blue-600/15 border border-sky-400/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)] font-semibold'
                        : 'text-sky-200/70 hover:text-white hover:bg-slate-900/40 hover:border hover:border-sky-500/20 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-sky-400' : 'text-sky-300/70'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Folders Section: Visible in Notes view or as a quick filter */}
          {activeTab === 'notes' && (
            <div className="pt-3 border-t border-sky-500/15 animate-fade-in">
              <div className="px-3 py-1.5 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/60">
                  Folders
                </span>
                <span className="text-[11px] text-sky-300/40">{notes.length} total</span>
              </div>

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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-sky-500/15 border border-sky-400/30 text-white'
                          : 'text-sky-200/70 hover:text-white hover:bg-slate-900/30 border border-transparent'
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
          )}
        </div>

        {/* Footer: User & Quick Lock / Logout */}
        <div className="pt-4 mt-4 border-t border-sky-500/15 space-y-2">
          {userEmail && (
            <div className="px-2 py-1 text-left">
              <span className="text-[10px] text-sky-300/50 uppercase tracking-wider block">
                Signed in
              </span>
              <span className="text-xs text-sky-100 font-medium truncate block" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onLock && (
              <button
                type="button"
                onClick={() => {
                  onLock();
                  onCloseMobile();
                }}
                className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900/50 hover:bg-sky-950/70 border border-sky-500/20 text-sky-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Lock Application"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onCloseMobile();
                }}
                className="py-2 px-2.5 rounded-xl bg-slate-900/40 hover:bg-rose-950/60 border border-slate-700/40 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
