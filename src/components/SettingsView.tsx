/**
 * SettingsView component for Private Notes.
 * Includes Account info & Logout, Security PIN controls, Appearance density,
 * and app preferences.
 */

import React from 'react';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  KeyRound,
  Lock,
  Palette,
  Sliders,
  Shield,
  Folder as FolderIcon,
  Trash2,
  Volume2,
} from 'lucide-react';
import { UserSettings, Folder } from '../types';

interface SettingsViewProps {
  userEmail: string | null | undefined;
  onLogout: () => void;
  onChangePin: () => void;
  onLock: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  folders: Folder[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userEmail,
  onLogout,
  onChangePin,
  onLock,
  settings,
  onUpdateSettings,
  folders,
}) => {
  const selectableFolders = folders.filter((f) => f.id !== 'all');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Account */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-sky-500/20 bg-[#031B36]/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sky-500/15">
            <User className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Account</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-sky-300/60 block mb-0.5">Signed In As</span>
              <span className="text-sm font-semibold text-white break-all">
                {userEmail || 'Local / Guest User'}
              </span>
              <span className="text-[11px] text-sky-400/80 block mt-0.5">
                Private cloud notes enabled
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white text-xs sm:text-sm font-medium flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Section 2: Security */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-sky-500/20 bg-[#031B36]/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sky-500/15">
            <Shield className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Security & Lock</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Change PIN Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-sky-500/15 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm mb-1">
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span>Change 4–6 Digit PIN</span>
                </div>
                <p className="text-xs text-sky-200/50 leading-relaxed">
                  Update your local PIN passkey for locking and unlocking this browser session.
                </p>
              </div>

              <button
                type="button"
                onClick={onChangePin}
                className="btn-electric px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change PIN</span>
              </button>
            </div>

            {/* Lock Application Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-sky-500/15 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm mb-1">
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>Lock Application</span>
                </div>
                <p className="text-xs text-sky-200/50 leading-relaxed">
                  Immediately hide your notes and lock the screen until you re-enter your PIN.
                </p>
              </div>

              <button
                type="button"
                onClick={onLock}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-sky-950 border border-sky-500/25 text-xs font-medium text-sky-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Lock Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Appearance & Density */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-sky-500/20 bg-[#031B36]/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sky-500/15">
            <Palette className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Appearance & Layout</h2>
          </div>

          <div className="space-y-4">
            {/* Density switch */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-white block">Card Density</span>
                <span className="text-xs text-sky-200/50">
                  {settings.compactLayout ? 'Compact grid spacing' : 'Comfortable spacious cards'}
                </span>
              </div>

              <div className="flex items-center glass-panel rounded-xl p-1 bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ compactLayout: false })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    !settings.compactLayout
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-sky-200/70 hover:text-white'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ compactLayout: true })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    settings.compactLayout
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-sky-200/70 hover:text-white'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Accent theme badge */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-sky-500/10">
              <div>
                <span className="text-sm font-semibold text-white block">Color Accent</span>
                <span className="text-xs text-sky-200/50">
                  Application accent glow
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'sky', label: 'Electric Sky', color: 'bg-sky-400' },
                  { id: 'cyan', label: 'Cyber Cyan', color: 'bg-cyan-400' },
                  { id: 'blue', label: 'Deep Blue', color: 'bg-blue-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateSettings({ accentColor: item.id as any })}
                    className={`px-2.5 py-1 text-xs rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                      settings.accentColor === item.id
                        ? 'border-sky-400 bg-sky-950/60 text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Preferences */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-sky-500/20 bg-[#031B36]/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sky-500/15">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Default Folder */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">Default Folder for New Notes</span>
                  <span className="text-xs text-sky-200/50">Where new notes are placed by default</span>
                </div>
              </div>

              <select
                value={settings.defaultFolder}
                onChange={(e) => onUpdateSettings({ defaultFolder: e.target.value })}
                className="w-full sm:w-48 px-3 py-1.5 text-xs sm:text-sm rounded-xl glass-input cursor-pointer bg-[#031B36]"
              >
                {selectableFolders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#031B36] text-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Confirm before delete */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-sky-500/10">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">Confirm Before Deletion</span>
                  <span className="text-xs text-sky-200/50">Prompt with modal before deleting notes</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.confirmDeleteNote}
                  onChange={(e) => onUpdateSettings({ confirmDeleteNote: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {/* Timer chime */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-sky-500/10">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">Timer Completion Chime</span>
                  <span className="text-xs text-sky-200/50">Play audio chime when focus timer finishes</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timerAlarmSound}
                  onChange={(e) => onUpdateSettings({ timerAlarmSound: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
