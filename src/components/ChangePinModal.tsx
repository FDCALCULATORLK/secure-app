/**
 * Change PIN Modal for Private Notes.
 * Allows user to update their 4-6 digit local PIN.
 */

import React, { useState } from 'react';
import { KeyRound, Check, X, ShieldAlert } from 'lucide-react';
import { StorageService } from '../utils/storage';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify current PIN
    if (!StorageService.verifyPin(currentPin)) {
      setError('Current PIN is incorrect.');
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      setError('New PIN must be 4 to 6 digits.');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('PIN must contain only numbers.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match.');
      return;
    }

    const saved = StorageService.setPin(newPin);
    if (saved) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      }, 1000);
    } else {
      setError('Failed to update PIN.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm glass-panel rounded-2xl border border-sky-400/25 bg-[#042144]/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Change PIN</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-sky-200/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center text-emerald-400 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium">PIN successfully updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-sky-300/70 mb-1">
                Current PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter current PIN"
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-sky-200/40 text-center tracking-widest"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-300/70 mb-1">
                New PIN (4–6 digits)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter new PIN"
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-sky-200/40 text-center tracking-widest"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-300/70 mb-1">
                Confirm New PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter new PIN"
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-sky-200/40 text-center tracking-widest"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-sky-500/15">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-sky-200/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-electric px-4 py-1.5 text-xs font-medium text-white rounded-xl"
              >
                Update PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
