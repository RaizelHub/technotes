import React, { useEffect, useState } from 'react';
import { Track, TrackSummary, ALL_TRACKS } from '../../types';
import { useNotesStore } from '../../stores/useNotesStore';
import { Network, Code, Bot, X, ArrowRight, BookOpen } from 'lucide-react';

interface TrackOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOverviewModal: React.FC<TrackOverviewModalProps> = ({ isOpen, onClose }) => {
  const { setSelectedTrack, setSelectedFilter } = useNotesStore();
  const [summaries, setSummaries] = useState<TrackSummary[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/tracks/summary')
        .then((res) => res.json())
        .then((data) => setSummaries(data))
        .catch((err) => console.error('Failed to fetch tracks summary:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTrack = (track: Track | 'all') => {
    setSelectedTrack(track);
    setSelectedFilter('all');
    onClose();
  };

  const getTrackIcon = (track: Track) => {
    switch (track) {
      case 'IT & Networking':
        return <Network className="w-5 h-5 text-gray-800 dark:text-zinc-200" />;
      case 'Software Development':
        return <Code className="w-5 h-5 text-gray-800 dark:text-zinc-200" />;
      case 'AI & Automation':
        return <Bot className="w-5 h-5 text-gray-800 dark:text-zinc-200" />;
    }
  };

  const getTrackSubtitle = (track: Track) => {
    switch (track) {
      case 'IT & Networking':
        return 'Infrastructure, Cisco IOS, Windows, Hardware, Packet Tracer & Troubleshooting';
      case 'Software Development':
        return 'Frontend, Backend, Full-Stack, Databases, APIs, DevOps & System Design';
      case 'AI & Automation':
        return 'n8n, AI APIs, Agents, Workflows, Webhooks & RAG Systems';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
            <div>
              <h2 className="font-semibold text-xs font-mono uppercase tracking-tight">
                Career Learning Tracks
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                Unified technical study system
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Selection Cards */}
        <div className="p-6 space-y-3.5 overflow-y-auto">
          {ALL_TRACKS.map((track) => {
            const summary = summaries.find((s) => s.track === track);
            const noteCount = summary?.noteCount ?? 0;
            const categoryCount = summary?.categoryCount ?? 0;

            return (
              <div
                key={track}
                onClick={() => handleSelectTrack(track)}
                className="group p-4 border border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white rounded-lg bg-white dark:bg-zinc-950/50 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    {getTrackIcon(track)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                        {track}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                        {noteCount} notes • {categoryCount} categories
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-lg">
                      {getTrackSubtitle(track)}
                    </p>
                    {summary?.recentNoteTitle && (
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 italic truncate max-w-md">
                        Latest: {summary.recentNoteTitle}
                      </p>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            );
          })}

          {/* View All Tracks Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => handleSelectTrack('all')}
              className="text-xs text-gray-500 hover:text-black dark:hover:text-white underline decoration-gray-300 dark:decoration-zinc-700"
            >
              View All Notes Across All Tracks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
