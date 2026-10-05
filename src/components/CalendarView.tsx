/**
 * CalendarView component for Private Notes.
 * Displays a monthly calendar, highlights today, shows notes on selected dates,
 * and allows direct note creation for any chosen date.
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  FileText,
} from 'lucide-react';
import { Note, Folder } from '../types';
import { NoteCard } from './NoteCard';

interface CalendarViewProps {
  notes: Note[];
  folders: Folder[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onNewNoteForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  notes,
  folders,
  onEditNote,
  onDeleteNote,
  onNewNoteForDate,
}) => {
  // Current month being viewed
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Currently selected date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Helper to extract YYYY-MM-DD from a Note
  const getNoteDateStr = (note: Note): string => {
    if (note.noteDate && note.noteDate.trim()) {
      return note.noteDate;
    }
    const d = new Date(note.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  // Map of date string -> notes array
  const notesByDate = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of notes) {
      const dateKey = getNoteDateStr(note);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(note);
    }
    return map;
  }, [notes]);

  // Notes on the currently selected date
  const notesOnSelectedDate = useMemo(() => {
    return notesByDate.get(selectedDateStr) || [];
  }, [notesByDate, selectedDateStr]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasNotes: boolean;
      noteCount: number;
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const str = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
        hasNotes: (notesByDate.get(str) || []).length > 0,
        noteCount: (notesByDate.get(str) || []).length,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr: str,
        isCurrentMonth: true,
        isToday: str === todayStr,
        hasNotes: (notesByDate.get(str) || []).length > 0,
        noteCount: (notesByDate.get(str) || []).length,
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(
          d
        ).padStart(2, '0')}`;
        days.push({
          dayNumber: d,
          dateStr: str,
          isCurrentMonth: false,
          isToday: str === todayStr,
          hasNotes: (notesByDate.get(str) || []).length > 0,
          noteCount: (notesByDate.get(str) || []).length,
        });
      }
    }

    return days;
  }, [year, month, todayStr, notesByDate]);

  // Formatted date label for selected date
  const selectedDateFormatted = useMemo(() => {
    try {
      const parts = selectedDateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Notes by Date
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-medium rounded-xl glass-panel text-sky-200 hover:text-white hover:border-sky-400/50 transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center glass-panel rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-950/60 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-950/60 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left/Top, Notes on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar Card */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-4 sm:p-6 border border-sky-500/20 shadow-xl bg-[#031B36]/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white tracking-wide">{monthName}</h2>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-sky-300/60 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((day, idx) => {
              const isSelected = day.dateStr === selectedDateStr;
              return (
                <button
                  key={`${day.dateStr}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`relative aspect-square sm:h-12 sm:aspect-auto rounded-xl flex flex-col items-center justify-center p-1 text-xs transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                      : day.isToday
                      ? 'border border-sky-400 bg-sky-950/50 text-sky-200 font-semibold'
                      : day.isCurrentMonth
                      ? 'text-slate-100 hover:bg-sky-950/60 hover:text-white'
                      : 'text-slate-500/60 hover:bg-sky-950/30'
                  }`}
                >
                  <span className="tabular-nums">{day.dayNumber}</span>

                  {/* Note Count Dots/Badges */}
                  {day.hasNotes && (
                    <span
                      className={`inline-block mt-0.5 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-slate-950' : 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                      }`}
                      title={`${day.noteCount} note${day.noteCount > 1 ? 's' : ''}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Notes Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-sky-500/20 bg-[#031B36]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                Selected Date
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {selectedDateFormatted}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onNewNoteForDate(selectedDateStr)}
              className="btn-electric px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Note on this date</span>
            </button>
          </div>

          {/* Notes List for Selected Date */}
          {notesOnSelectedDate.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-sky-200/60 px-1 font-medium">
                {notesOnSelectedDate.length} note{notesOnSelectedDate.length > 1 ? 's' : ''} on this date:
              </div>
              <div className="grid grid-cols-1 gap-3">
                {notesOnSelectedDate.map((note) => {
                  const folderObj = folders.find((f) => f.id === note.folder);
                  const folderName = folderObj ? folderObj.name : 'Personal';
                  return (
                    <NoteCard
                      key={note.id}
                      note={note}
                      folderName={folderName}
                      onEdit={onEditNote}
                      onDelete={onDeleteNote}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-sky-500/15 text-center bg-[#031B36]/50">
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">No notes for this date</h4>
              <p className="text-xs text-sky-200/60 max-w-xs mx-auto mb-4">
                Click &ldquo;Note on this date&rdquo; to attach a diary entry, meeting summary, or reminder.
              </p>
              <button
                type="button"
                onClick={() => onNewNoteForDate(selectedDateStr)}
                className="btn-electric px-4 py-2 rounded-xl text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create note for {selectedDateStr}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
