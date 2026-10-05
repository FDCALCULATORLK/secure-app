/**
 * VideoPlayerModal for Private Notes.
 * Displays HTML5 video player with seek, volume, and fullscreen controls in a dark-blue modal.
 */

import React, { useEffect, useRef } from 'react';
import { X, Calendar, HardDrive, Film } from 'lucide-react';
import { PrivateVideo } from '../types';
import { formatBytes } from '../videoService';

interface VideoPlayerModalProps {
  isOpen: boolean;
  video: PrivateVideo | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  video,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pause video on close
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const formattedDate = new Date(video.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl glass-panel rounded-2xl border border-sky-400/25 bg-[#031B36]/95 shadow-2xl p-4 sm:p-5 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(2, 19, 39, 0.95), 0 0 35px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-500/15">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <Film className="w-5 h-5 text-sky-400 shrink-0" />
            <div className="truncate text-left">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {video.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-sky-200/50 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-400/70" />
                  <span>{formattedDate}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-sky-400/70" />
                  <span>{formatBytes(video.size)}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200/60 hover:text-white hover:bg-sky-950/60 transition-colors cursor-pointer shrink-0"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full rounded-xl overflow-hidden bg-black/80 flex items-center justify-center border border-sky-500/20 max-h-[75vh]">
          <video
            ref={videoRef}
            src={video.downloadUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[70vh] rounded-lg"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>
      </div>
    </div>
  );
};
