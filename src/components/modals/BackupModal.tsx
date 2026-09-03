import React, { useState, useRef } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { htmlToMarkdown } from '../../utils/export';
import { Database, Download, Upload, FileText, X, Check, AlertCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { notes, fetchNotes, fetchCategories, fetchTags } = useNotesStore();
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportDatabase = () => {
    window.open('/api/backup', '_blank');
    setStatusMsg({ type: 'success', text: 'Database backup download started!' });
  };

  const handleExportAllMarkdown = () => {
    try {
      const activeNotes = notes.filter((n) => !n.isDeleted);
      const combined = activeNotes
        .map(
          (n) => `# ${n.title || 'Untitled'}
Category: ${n.category?.name || 'Uncategorized'} | Type: ${n.type} | Status: ${n.learningStatus}
Tags: ${n.tags || 'none'}
Created: ${new Date(n.createdAt).toLocaleString()} | Updated: ${new Date(n.updatedAt).toLocaleString()}

---

${htmlToMarkdown(n.content)}

================================================================================
`
        )
        .join('\n\n');

      const blob = new Blob([combined], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.download = `technotes-all-notes-${timestamp}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: `Exported ${activeNotes.length} notes as Markdown!` });
    } catch (err) {
      console.error('Failed to export all notes:', err);
      setStatusMsg({ type: 'error', text: 'Failed to export notes.' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Restore database from "${file.name}"? Current data will be replaced.`)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const base64Data = readerEvent.target?.result as string;
      try {
        const res = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data }),
        });

        if (res.ok) {
          setStatusMsg({ type: 'success', text: 'Database restored successfully! Refreshing...' });
          setTimeout(async () => {
            await fetchCategories();
            await fetchTags();
            await fetchNotes();
            onClose();
          }, 1000);
        } else {
          setStatusMsg({ type: 'error', text: 'Restore failed. Check file format.' });
        }
      } catch (err) {
        console.error('Restore error:', err);
        setStatusMsg({ type: 'error', text: 'Failed to restore database.' });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
            <span className="font-semibold text-xs font-mono uppercase tracking-tight">
              Backup & Data Safety
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {statusMsg && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            TechNotes runs 100% locally on your laptop with zero cloud tracking. You can export
            your full database or save your notes as Markdown anytime.
          </p>

          <div className="space-y-2">
            {/* Export DB */}
            <button
              type="button"
              onClick={handleExportDatabase}
              className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-gray-500 group-hover:text-black dark:group-hover:text-white" />
                <div>
                  <div className="text-xs font-medium text-gray-900 dark:text-zinc-100">
                    Export SQLite Database
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Download timestamped technotes-backup.db
                  </div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Restore DB */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-gray-500 group-hover:text-black dark:group-hover:text-white" />
                <div>
                  <div className="text-xs font-medium text-gray-900 dark:text-zinc-100">
                    Import / Restore Database
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Restore from a previously exported .db file
                  </div>
                </div>
              </div>
              <Upload className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".db"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Export All Notes as Markdown */}
            <button
              type="button"
              onClick={handleExportAllMarkdown}
              className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-500 group-hover:text-black dark:group-hover:text-white" />
                <div>
                  <div className="text-xs font-medium text-gray-900 dark:text-zinc-100">
                    Export All Notes as Markdown
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Combines all active notes into a clean .md document
                  </div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
