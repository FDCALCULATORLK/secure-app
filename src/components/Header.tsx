/**
 * Top Navigation Header for Private Notes
 * Features brand title, search bar, active tab navigation, new note CTA,
 * lock button, and change PIN / logout options.
 */

import React from 'react';
import {
  Lock,
  Plus,
  Search,
  KeyRound,
  Menu,
  X,
  LogOut,
  BookOpen,
  Calendar,
  CheckSquare,
  Timer,
  Settings,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
  onLock: () => void;
  onChangePin: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewNote,
  onLock,
  onChangePin,
  isMobileMenuOpen,
  onToggleMobileMenu,
  userEmail,
  onLogout,
  activeTab,
  onSelectTab,
}) => {
  const tabs: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'notes', label: 'Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'checklists', label: 'Checklists', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-sky-500/20 bg-[#031B36]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mobile Menu Toggle & Brand Lockup */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-sky-200 hover:text-white hover:bg-sky-950/60 border border-sky-500/20 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('notes')}
              className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
            >
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                Private Notes
              </span>
              <span
                title="PIN protected"
                className="inline-flex items-center text-sky-400 text-xs"
              >
                <Lock className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Center-Left: Quick Nav Tabs on desktop */}
          <nav className="hidden xl:flex items-center gap-1 glass-panel px-2 py-1 rounded-xl bg-slate-900/60 border border-sky-500/15">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-sky-200/70 hover:text-white hover:bg-sky-950/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Center: Search Field */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400/60">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input placeholder-sky-200/40 text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[11px] text-sky-300/60 hover:text-sky-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* New Note Button */}
            <button
              type="button"
              onClick={onNewNote}
              className="btn-electric px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Change PIN Button */}
            <button
              type="button"
              onClick={onChangePin}
              title="Change PIN"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/40 hover:bg-sky-950/60 text-sky-300 hover:text-sky-100 border border-sky-500/20 hover:border-sky-400/40 transition-colors cursor-pointer"
              aria-label="Change PIN settings"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Lock Button */}
            <button
              type="button"
              onClick={onLock}
              title="Lock App"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 hover:bg-sky-950/80 text-sky-400 hover:text-sky-200 border border-sky-500/30 hover:border-sky-400/50 shadow-sm transition-colors cursor-pointer"
              aria-label="Lock application"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title={userEmail ? `Sign out (${userEmail})` : 'Sign out'}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900/40 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700/40 hover:border-rose-500/30 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
