/**
 * DeleteVideoModal confirmation dialog for Private Notes.
 * Confirms permanent deletion of video from Firebase Storage and Firestore.
 */

import React from 'react';
import { AlertTriangle, Trash2, X, FileVideo } from 'lucide-react';
import { PrivateVideo } from '../types';
import { formatBytes } from '../videoService';

interface DeleteVideoModalProps {
  isOpen: boolean;
  video: PrivateVideo | null;
  onClose: () => void;
  onConfirm: (video: PrivateVideo) => void;
}

export const DeleteVideoModal: React.FC<DeleteVideoModalProps> = ({
  isOpen,
  video,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass-panel rounded-2xl border border-rose-500/25 bg-[#041E3B]/95 p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Delete Private Video</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200/60 hover:text-white hover:bg-sky-950/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-sky-100/70 mb-3 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-white">
            &ldquo;{video.title.trim() || 'Untitled Video'}&rdquo;
          </span>
          ?
        </p>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-sky-500/15 flex items-center gap-2.5 text-xs text-sky-200/70 mb-4">
          <FileVideo className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Size: {formatBytes(video.size)}</span>
        </div>

        <p className="text-xs text-rose-300/80 mb-6">
          This will permanently remove the video file from your private cloud storage and delete its metadata. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-sky-200/70 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(video)}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border border-rose-400/40 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
