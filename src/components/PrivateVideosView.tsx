/**
 * PrivateVideosView component for Private Notes.
 * Displays private video library in a dark-blue glassmorphic card grid,
 * with search filtering, thumbnail previews, playback triggers, and deletion.
 */

import React, { useState, useMemo } from 'react';
import {
  Film,
  Upload,
  Play,
  Trash2,
  Calendar,
  HardDrive,
  Search,
  SearchX,
  Plus,
} from 'lucide-react';
import { PrivateVideo } from '../types';
import { formatBytes } from '../videoService';

interface PrivateVideosViewProps {
  videos: PrivateVideo[];
  isLoading: boolean;
  onOpenUpload: () => void;
  onPlayVideo: (video: PrivateVideo) => void;
  onDeleteVideo: (video: PrivateVideo) => void;
}

export const PrivateVideosView: React.FC<PrivateVideosViewProps> = ({
  videos,
  isLoading,
  onOpenUpload,
  onPlayVideo,
  onDeleteVideo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter videos by search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase().trim();
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Private Storage</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Private Videos
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Quick Search */}
          {videos.length > 0 && (
            <div className="relative w-44 sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-400/60">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl glass-input placeholder-sky-200/40 text-white"
              />
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="btn-electric px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
        </div>
      </div>

      {/* Videos List / Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-sky-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <p className="text-xs text-sky-300/70 font-medium">Loading your private video vault...</p>
          </div>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group relative glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-sky-500/20 bg-[#031B36]/80 transition-all duration-200"
            >
              {/* Thumbnail / Video Container */}
              <div
                onClick={() => onPlayVideo(video)}
                className="relative aspect-video w-full bg-slate-950/80 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <video
                  src={video.downloadUrl}
                  preload="metadata"
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/30 transform group-hover:scale-110 transition-transform duration-200">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration / Format Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-sky-300 font-semibold border border-sky-500/20">
                  {formatBytes(video.size)}
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      onClick={() => onPlayVideo(video)}
                      className="text-sm font-semibold text-white tracking-tight line-clamp-1 group-hover:text-sky-200 transition-colors cursor-pointer flex-1"
                      title={video.title}
                    >
                      {video.title.trim() || 'Untitled Video'}
                    </h3>

                    <button
                      type="button"
                      onClick={() => onDeleteVideo(video)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-sky-200/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-400/60" />
                      <span>{formatDate(video.createdAt)}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-sky-400/60" />
                      <span>{video.mimeType.replace('video/', '').toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Play CTA Bar */}
                <div className="mt-3 pt-3 border-t border-sky-500/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onPlayVideo(video)}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Video</span>
                  </button>
                  <span className="text-[10px] text-sky-200/40 uppercase tracking-wider font-medium">
                    Private Vault
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        /* Empty Search Results */
        <div className="glass-panel rounded-2xl p-10 border border-sky-500/15 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-950/60 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto mb-3 shadow-lg shadow-sky-500/10">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No videos found</h3>
          <p className="text-xs text-sky-200/60 mb-4">
            No video matching &ldquo;{searchQuery}&rdquo;. Try another search term.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 text-xs font-medium text-sky-300 hover:text-white bg-slate-900/60 rounded-xl border border-sky-500/20 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Empty Library State */
        <div className="glass-panel rounded-2xl p-10 sm:p-12 border border-sky-500/15 text-center max-w-md mx-auto my-8 bg-[#031B36]/60">
          <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto mb-4 shadow-lg shadow-sky-500/10">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            No private videos yet
          </h3>
          <p className="text-xs sm:text-sm text-sky-200/60 mb-6 leading-relaxed">
            Upload personal recordings, video journals, or private screen captures securely to your cloud vault.
          </p>
          <button
            type="button"
            onClick={onOpenUpload}
            className="btn-electric px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Video</span>
          </button>
        </div>
      )}
    </div>
  );
};
