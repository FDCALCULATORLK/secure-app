/**
 * TimerView component for Private Notes.
 * Provides a focus countdown timer with presets (5, 10, 25, 30 min),
 * custom input, start/pause/reset controls, and completion chime/notification.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Bell,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface TimerViewProps {
  alarmSoundEnabled?: boolean;
}

export const TimerView: React.FC<TimerViewProps> = ({ alarmSoundEnabled = true }) => {
  // Configured total seconds
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  // Current remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  // Status: 'idle' | 'running' | 'paused' | 'finished'
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');

  // Custom inputs (for manual edit mode)
  const [customMinutes, setCustomMinutes] = useState<string>('25');
  const [customSeconds, setCustomSeconds] = useState<string>('00');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play a simple Web Audio API chime
  const playChime = useCallback(() => {
    if (!alarmSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      // Nice 3-tone notification chord
      playTone(523.25, 0, 0.4); // C5
      playTone(659.25, 0.15, 0.4); // E5
      playTone(783.99, 0.3, 0.7); // G5
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  }, [alarmSoundEnabled]);

  // Interval loop
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus('finished');
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, playChime]);

  // Preset selector
  const handleSelectPreset = (minutes: number) => {
    const secs = minutes * 60;
    setStatus('idle');
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setCustomMinutes(String(minutes));
    setCustomSeconds('00');
  };

  // Custom time submit
  const handleApplyCustom = () => {
    const m = Math.max(0, parseInt(customMinutes, 10) || 0);
    const s = Math.min(59, Math.max(0, parseInt(customSeconds, 10) || 0));
    const secs = m * 60 + s;
    if (secs > 0) {
      setStatus('idle');
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
    }
  };

  // Start / Pause toggle
  const handleTogglePlay = () => {
    if (status === 'running') {
      setStatus('paused');
    } else if (status === 'finished') {
      setRemainingSeconds(totalSeconds);
      setStatus('running');
    } else {
      setStatus('running');
    }
  };

  // Reset
  const handleReset = () => {
    setStatus('idle');
    setRemainingSeconds(totalSeconds);
  };

  // Format display
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Percentage progress
  const progressPercent =
    totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <TimerIcon className="w-3.5 h-3.5" />
            <span>Productivity Tool</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Focus Timer
          </h1>
        </div>
      </div>

      {/* Main Timer Dial Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-sky-500/20 bg-[#031B36]/80 shadow-2xl text-center flex flex-col items-center">
        {/* Preset Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { label: '5 min', mins: 5 },
            { label: '10 min', mins: 10 },
            { label: '25 min (Pomodoro)', mins: 25 },
            { label: '30 min', mins: 30 },
          ].map((preset) => {
            const isActive = totalSeconds === preset.mins * 60;
            return (
              <button
                key={preset.mins}
                type="button"
                onClick={() => handleSelectPreset(preset.mins)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : 'bg-slate-900/50 hover:bg-sky-950/70 text-sky-200/80 border border-sky-500/20'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Large Digital Display with Progress Ring Glow */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          {/* Subtle Outer Glow Ring */}
          <div
            className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 relative ${
              status === 'running'
                ? 'border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.25)] bg-[#042449]/70'
                : status === 'finished'
                ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.3)] bg-emerald-950/20'
                : 'border-sky-500/25 bg-[#031B36]/50'
            }`}
          >
            {/* Digits in JetBrains Mono */}
            <div className="font-['JetBrains_Mono',monospace] text-5xl sm:text-6xl font-bold tracking-wider text-white">
              <span>{formattedMinutes}</span>
              <span className={status === 'running' ? 'animate-pulse text-sky-400' : 'text-sky-300'}>:</span>
              <span>{formattedSeconds}</span>
            </div>

            {/* Status caption */}
            <div className="mt-2 text-xs uppercase tracking-widest font-semibold text-sky-300/70">
              {status === 'running' && 'Focusing...'}
              {status === 'paused' && 'Paused'}
              {status === 'idle' && 'Ready'}
              {status === 'finished' && 'Completed!'}
            </div>
          </div>
        </div>

        {/* Finish Banner message */}
        {status === 'finished' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 flex items-center justify-center gap-2 max-w-md w-full animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Time&rsquo;s up! Great job staying focused. Take a short breather.
            </span>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
              status === 'running'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'btn-electric text-white'
            }`}
          >
            {status === 'running' ? (
              <>
                <Pause className="w-5 h-5" />
                <span>PAUSE</span>
              </>
            ) : status === 'paused' ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>RESUME</span>
              </>
            ) : status === 'finished' ? (
              <>
                <Sparkles className="w-5 h-5" />
                <span>RESTART</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>START</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={status === 'idle' && remainingSeconds === totalSeconds}
            className="p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800 border border-sky-500/20 text-sky-200 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Input Drawer */}
        <div className="mt-8 pt-6 border-t border-sky-500/15 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs text-sky-200/60 font-medium">Custom duration:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="999"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-16 px-2.5 py-1.5 text-center text-xs sm:text-sm rounded-xl glass-input text-white font-mono"
              placeholder="Min"
            />
            <span className="text-xs text-sky-300">m</span>
            <input
              type="number"
              min="0"
              max="59"
              value={customSeconds}
              onChange={(e) => setCustomSeconds(e.target.value)}
              className="w-16 px-2.5 py-1.5 text-center text-xs sm:text-sm rounded-xl glass-input text-white font-mono"
              placeholder="Sec"
            />
            <span className="text-xs text-sky-300">s</span>
            <button
              type="button"
              onClick={handleApplyCustom}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/60 hover:bg-sky-950 border border-sky-500/20 text-sky-300 hover:text-white cursor-pointer"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
