/**
 * PIN Lock Screen for Private Notes
 * Supports first-time PIN creation and subsequent unlocking.
 * Offers both on-screen numeric touch keypad and physical keyboard input.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { StorageService } from '../utils/storage';

interface PinScreenProps {
  onUnlock: () => void;
  isFirstTimeSetup: boolean;
}

export const PinScreen: React.FC<PinScreenProps> = ({ onUnlock, isFirstTimeSetup }) => {
  // Step for first time: 'create' -> 'confirm'
  const [step, setStep] = useState<'create' | 'confirm' | 'unlock'>(
    isFirstTimeSetup ? 'create' : 'unlock'
  );
  const [createdPin, setCreatedPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setCurrentPin('');
  };

  const handleDigitPress = (digit: string) => {
    if (currentPin.length < 6) {
      setCurrentPin((prev) => prev + digit);
      setErrorMessage(null);
    }
  };

  const handleBackspace = () => {
    setCurrentPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setCurrentPin('');
    setErrorMessage(null);
  };

  const handleSubmit = useCallback(() => {
    if (step === 'unlock') {
      if (currentPin.length < 4) {
        triggerShake('PIN must be 4 to 6 digits');
        return;
      }
      const isValid = StorageService.verifyPin(currentPin);
      if (isValid) {
        onUnlock();
      } else {
        triggerShake('Incorrect PIN. Please try again.');
      }
    } else if (step === 'create') {
      if (currentPin.length < 4) {
        triggerShake('PIN must be at least 4 digits');
        return;
      }
      setCreatedPin(currentPin);
      setCurrentPin('');
      setStep('confirm');
      setErrorMessage(null);
    } else if (step === 'confirm') {
      if (currentPin !== createdPin) {
        triggerShake('PINs do not match. Please try again.');
        setStep('create');
        setCreatedPin('');
        return;
      }
      const saved = StorageService.setPin(currentPin);
      if (saved) {
        onUnlock();
      } else {
        triggerShake('Failed to save PIN.');
      }
    }
  }, [step, currentPin, createdPin, onUnlock]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPin, step, createdPin, handleSubmit]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none bg-[#021327]">
      {/* Background ambient glowing shapes */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-cyan-500/5 blur-[100px]"
        aria-hidden="true"
      />

      {/* Main Lock Card */}
      <div
        className={`relative w-full max-w-sm glass-panel rounded-2xl p-6 sm:p-8 transition-transform duration-200 ${
          shake ? 'animate-shake' : ''
        }`}
        style={{
          boxShadow: '0 20px 50px -15px rgba(2, 19, 39, 0.9), 0 0 30px rgba(56, 189, 248, 0.1)',
        }}
      >
        {/* Lock Icon Emblem */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-400/30 flex items-center justify-center shadow-lg shadow-sky-500/10 text-sky-300">
            {step === 'unlock' ? (
              <Lock className="w-7 h-7 text-sky-400" />
            ) : (
              <KeyRound className="w-7 h-7 text-sky-300" />
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase">
            Private Notes
          </h1>
          <p className="text-sm text-sky-200/70 mt-1">Your private notebook.</p>
        </div>

        {/* Step instruction label */}
        <div className="text-center mb-4">
          <p className="text-xs uppercase tracking-widest font-medium text-sky-300/80">
            {step === 'unlock' && 'Enter your PIN'}
            {step === 'create' && 'Create 4–6 digit PIN'}
            {step === 'confirm' && 'Confirm your PIN'}
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3.5 mb-6 py-2">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < currentPin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-sky-400 scale-110 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                    : 'bg-slate-800/80 border border-sky-500/30'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg py-1.5 px-3 mb-4 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Touch Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-12 rounded-xl bg-slate-900/60 hover:bg-sky-950/70 active:bg-sky-900/80 border border-sky-500/15 hover:border-sky-400/40 text-lg font-semibold text-white transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 border border-sky-500/10 text-xs font-medium text-sky-200/60 hover:text-sky-100 transition-colors flex items-center justify-center focus:outline-none"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-12 rounded-xl bg-slate-900/60 hover:bg-sky-950/70 active:bg-sky-900/80 border border-sky-500/15 hover:border-sky-400/40 text-lg font-semibold text-white transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="h-12 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 border border-sky-500/10 text-xs font-medium text-sky-200/60 hover:text-sky-100 transition-colors flex items-center justify-center focus:outline-none"
          >
            ⌫
          </button>
        </div>

        {/* Unlock / Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={currentPin.length < 4}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
            currentPin.length >= 4
              ? 'btn-electric text-white cursor-pointer'
              : 'bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-not-allowed'
          }`}
        >
          {step === 'unlock' ? (
            <>
              <Lock className="w-4 h-4" />
              <span>UNLOCK</span>
            </>
          ) : step === 'create' ? (
            <>
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Lock</span>
            </>
          )}
        </button>

        {/* Honest Privacy Notice */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-sky-200/50 leading-relaxed">
            Locked to this browser session. PIN stored locally for private access.
          </p>
        </div>
      </div>
    </div>
  );
};
