/**
 * Top Navigation Header for Private Notes
 * Features brand title, search bar, new note CTA, lock button, and change PIN option.
 */

import React from 'react';
import { Lock, Plus, Search, KeyRound, Menu, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
  onLock: () => void;
  onChangePin: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewNote,
  onLock,
  onChangePin,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-sky-500/20 bg-[#031B36]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Mobile Menu Toggle & Brand Lockup */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-sky-200 hover:text-white hover:bg-sky-950/60 border border-sky-500/20 transition-colors focus:outline-none"
              aria-label="Toggle folders menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                  Private Notes
                </span>
                <span
                  title="Protected with PIN"
                  className="inline-flex items-center text-sky-400 text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-sky-200/70 hidden sm:block">
                Your private notebook.
              </p>
            </div>
          </div>

          {/* Center: Search Field */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400/60">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search your private notes..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl glass-input placeholder-sky-200/40 text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-sky-300/60 hover:text-sky-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* New Note Button */}
            <button
              type="button"
              onClick={onNewNote}
              className="btn-electric px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Change PIN Button */}
            <button
              type="button"
              onClick={onChangePin}
              title="Change PIN"
              className="p-2 rounded-xl bg-slate-900/40 hover:bg-sky-950/60 text-sky-300 hover:text-sky-100 border border-sky-500/20 hover:border-sky-400/40 transition-colors"
              aria-label="Change PIN settings"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Lock Button */}
            <button
              type="button"
              onClick={onLock}
              title="Lock App"
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-sky-950/80 text-sky-400 hover:text-sky-200 border border-sky-500/30 hover:border-sky-400/50 shadow-sm transition-colors cursor-pointer"
              aria-label="Lock application"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
