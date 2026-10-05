/**
 * UploadVideoModal for uploading private videos to Firebase Storage.
 * Includes drag-and-drop, format validation, 200MB size limit check,
 * title editing, and upload progress feedback.
 */

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Film,
} from 'lucide-react';
import {
  MAX_VIDEO_SIZE_BYTES,
  formatBytes,
  isSupportedVideoFile,
} from '../videoService';
import { PrivateVideo } from '../types';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: File,
    title: string,
    onProgress: (percent: number) => void
  ) => Promise<PrivateVideo>;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setTitle('');
    setPreviewUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);

    // Validation 1: Size check
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatBytes(file.size)}). Maximum allowed size is 200 MB.`
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validation 2: Type check
    if (!isSupportedVideoFile(file)) {
      setErrorMessage(
        'Unsupported video format. Please upload MP4, MOV, WebM, or MKV videos.'
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    setTitle(cleanName);

    // Generate local preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      await onUpload(selectedFile, title, (percent) => {
        setUploadProgress(percent);
      });

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload video. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg glass-panel rounded-2xl border border-sky-400/25 bg-[#042144]/95 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(2, 19, 39, 0.95), 0 0 35px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Upload Private Video
            </h2>
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-sky-200/60 hover:text-white hover:bg-sky-950/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 mt-4 pr-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Video uploaded successfully to private storage!</span>
            </div>
          )}

          {/* File Dropzone or Preview */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/15 scale-[0.99]'
                  : 'border-sky-500/30 hover:border-sky-400/60 bg-slate-900/40 hover:bg-sky-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.mov,.webm,.mkv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-3 shadow-lg shadow-sky-500/10">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                Click to browse or drop your video here
              </p>
              <p className="text-xs text-sky-200/60 mb-2">
                Supports MP4, MOV, WebM (up to 200 MB)
              </p>
              <span className="text-[11px] text-sky-400/80 font-medium">
                Encrypted & accessible only to you
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Video Preview thumbnail */}
              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden bg-black/60 aspect-video max-h-48 flex items-center justify-center border border-sky-500/20">
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-full max-w-full rounded-lg"
                  />
                </div>
              )}

              {/* File Info Bar */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  <FileVideo className="w-5 h-5 text-sky-400 shrink-0" />
                  <div className="truncate text-left">
                    <span className="text-xs font-semibold text-white truncate block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-sky-300/60">
                      {formatBytes(selectedFile.size)} · {selectedFile.type || 'video'}
                    </span>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Change file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-sky-300/70 mb-1.5">
                  Video Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  placeholder="Give your video a private title..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-sky-200/40 text-white disabled:opacity-50"
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-300 font-medium">
                      {uploadProgress < 100 ? 'Uploading to private storage...' : 'Processing...'}
                    </span>
                    <span className="text-sky-400 font-mono font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-sky-500/20">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/15">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-sky-200/70 hover:text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="btn-electric px-5 py-2 text-xs sm:text-sm font-medium text-white rounded-xl flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
