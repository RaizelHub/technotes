import React, { useState, useEffect, useRef } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { downloadMarkdown, printCleanDocument } from '../../utils/export';
import {
  Search,
  Plus,
  Pin,
  PanelLeft,
  Archive,
  Trash2,
  FileCode,
  Zap,
  Calculator,
  Moon,
  Sun,
  Download,
  Printer,
  Database,
  Columns2,
  Bookmark,
  Shuffle,
  HelpCircle,
  Terminal,
  Calendar,
  FlaskConical,
  Wrench,
  Code,
  Bot,
  Network,
  Compass,
  Layers,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    createNote,
    createNoteFromTemplate,
    setSelectedTrack,
    setSelectedFilter,
    toggleSidebar,
    toggleSidecarMode,
    isSidecarMode,
    toggleDarkMode,
    isDarkMode,
    setSubnetCalculatorOpen,
    setQuickCaptureOpen,
    setCommandReferenceOpen,
    setQuestionsOpen,
    setTimelineOpen,
    setBackupOpen,
    setTrackOverviewOpen,
    triggerRandomReview,
    toggleReviewLater,
    setLearningStatus,
    activeNote,
    moveToTrash,
    toggleArchive,
  } = useNotesStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'quick_capture',
      name: 'Quick Capture (Immediate Question / Lab note)',
      shortcut: 'Ctrl+Shift+N',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: () => setQuickCaptureOpen(true),
    },
    {
      id: 'random_review',
      name: 'Review Something (Random Review)',
      shortcut: 'Ctrl+Shift+R',
      icon: <Shuffle className="w-4 h-4 text-purple-500" />,
      action: () => triggerRandomReview(),
    },
    {
      id: 'track_overview',
      name: 'Career Tracks Overview (IT, Dev, AI)',
      icon: <Compass className="w-4 h-4 text-blue-500" />,
      action: () => setTrackOverviewOpen(true),
    },
    {
      id: 'switch_track_all',
      name: 'Switch Track: All Tracks',
      icon: <FileCode className="w-4 h-4 text-gray-500" />,
      action: () => setSelectedTrack('all'),
    },
    {
      id: 'switch_track_it',
      name: 'Switch Track: IT & Networking',
      icon: <Network className="w-4 h-4 text-blue-600" />,
      action: () => setSelectedTrack('IT & Networking'),
    },
    {
      id: 'switch_track_dev',
      name: 'Switch Track: Software Development',
      icon: <Code className="w-4 h-4 text-emerald-600" />,
      action: () => setSelectedTrack('Software Development'),
    },
    {
      id: 'switch_track_ai',
      name: 'Switch Track: AI & Automation',
      icon: <Bot className="w-4 h-4 text-purple-600" />,
      action: () => setSelectedTrack('AI & Automation'),
    },
    {
      id: 'new_note',
      name: 'New Blank Note',
      shortcut: 'Ctrl+N',
      icon: <Plus className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => createNote(),
    },
    {
      id: 'new_coding_concept',
      name: 'New Note from Template: Coding Concept',
      icon: <Code className="w-4 h-4 text-emerald-500" />,
      action: () => createNoteFromTemplate('coding_concept'),
    },
    {
      id: 'new_dev_project',
      name: 'New Note from Template: Development Project',
      icon: <Layers className="w-4 h-4 text-blue-500" />,
      action: () => createNoteFromTemplate('dev_project'),
    },
    {
      id: 'new_api_integration',
      name: 'New Note from Template: API / Integration',
      icon: <FileCode className="w-4 h-4 text-blue-500" />,
      action: () => createNoteFromTemplate('api_integration'),
    },
    {
      id: 'new_workflow',
      name: 'New Note from Template: Automation Workflow',
      icon: <Bot className="w-4 h-4 text-purple-500" />,
      action: () => createNoteFromTemplate('automation_workflow'),
    },
    {
      id: 'new_ai_concept',
      name: 'New Note from Template: AI Concept',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      action: () => createNoteFromTemplate('ai_concept'),
    },
    {
      id: 'new_cisco_lab',
      name: 'New Note from Template: Cisco Lab',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      action: () => createNoteFromTemplate('cisco_lab'),
    },
    {
      id: 'new_ts_journal',
      name: 'New Note from Template: Troubleshooting Journal',
      icon: <Wrench className="w-4 h-4 text-orange-600" />,
      action: () => createNoteFromTemplate('troubleshooting'),
    },
    {
      id: 'subnet_calc',
      name: 'CIDR & Subnet Calculator',
      shortcut: 'Ctrl+Shift+C',
      icon: <Calculator className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setSubnetCalculatorOpen(true),
    },
    {
      id: 'command_reference',
      name: 'Open Commands & Code Reference (Cisco, Git, Docker, n8n...)',
      icon: <Terminal className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setCommandReferenceOpen(true),
    },
    {
      id: 'questions_backlog',
      name: 'Open Questions / Learning Backlog',
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
      action: () => setQuestionsOpen(true),
    },
    {
      id: 'learning_timeline',
      name: 'Open Learning Timeline / History',
      icon: <Calendar className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setTimelineOpen(true),
    },
    {
      id: 'toggle_sidecar',
      name: isSidecarMode ? 'Exit Sidecar Mode' : 'Enter Sidecar / Mini Mode',
      shortcut: 'Ctrl+M',
      icon: <Columns2 className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => toggleSidecarMode(),
    },
    {
      id: 'toggle_theme',
      name: isDarkMode ? 'Switch to Light Theme' : 'Switch to Pure Dark Theme',
      icon: isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-500" />
      ),
      action: () => toggleDarkMode(),
    },
    {
      id: 'toggle_sidebar',
      name: 'Toggle Sidebar',
      icon: <PanelLeft className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => toggleSidebar(),
    },
    ...(activeNote
      ? [
          {
            id: 'toggle_review_later_note',
            name: activeNote.isReviewLater ? 'Remove from Review Later' : 'Mark for Review Later',
            icon: <Bookmark className="w-4 h-4 text-blue-500" />,
            action: () => toggleReviewLater(activeNote.id),
          },
          {
            id: 'status_dont_understand',
            name: 'Set Status: Don\'t Understand',
            icon: <span className="w-3 h-3 rounded-full bg-amber-500" />,
            action: () => setLearningStatus(activeNote.id, 'dont_understand'),
          },
          {
            id: 'status_reviewing',
            name: 'Set Status: Reviewing',
            icon: <span className="w-3 h-3 rounded-full bg-blue-500" />,
            action: () => setLearningStatus(activeNote.id, 'reviewing'),
          },
          {
            id: 'status_learned',
            name: 'Set Status: Learned',
            icon: <span className="w-3 h-3 rounded-full bg-emerald-500" />,
            action: () => setLearningStatus(activeNote.id, 'learned'),
          },
          {
            id: 'export_md',
            name: `Export "${activeNote.title || 'Note'}" to Markdown (.md)`,
            icon: <Download className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => downloadMarkdown(activeNote),
          },
          {
            id: 'print_pdf',
            name: `Print "${activeNote.title || 'Note'}" / Save as PDF`,
            icon: <Printer className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => printCleanDocument(),
          },
          {
            id: 'archive_note',
            name: activeNote.isArchived ? 'Unarchive Current Note' : 'Archive Current Note',
            icon: <Archive className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
            action: () => toggleArchive(activeNote.id),
          },
          {
            id: 'delete_note',
            name: 'Move Current Note to Trash',
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
            action: () => {
              if (window.confirm('Move this note to Trash?')) {
                moveToTrash(activeNote.id);
              }
            },
          },
        ]
      : []),
    {
      id: 'backup_db',
      name: 'Backup, Restore & Export Data',
      icon: <Database className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
      action: () => setBackupOpen(true),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        setCommandPaletteOpen(false);
        cmd.action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 mr-2.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-900 dark:text-zinc-100"
          />
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded">
            Esc
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto py-1.5 divide-y divide-gray-50 dark:divide-zinc-800/50">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 dark:text-zinc-500">
              No matching commands
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  cmd.action();
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {cmd.icon}
                  <span className="truncate">{cmd.name}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className="font-mono text-[10px] text-gray-400 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
