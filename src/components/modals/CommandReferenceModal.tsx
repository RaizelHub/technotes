import React, { useState, useEffect } from 'react';
import { CommandItem, CommandCategory, Track, ALL_TRACKS } from '../../types';
import {
  Terminal,
  Search,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  Network,
  Code,
  Bot,
} from 'lucide-react';

interface CommandReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoNote?: (html: string) => void;
}

const TRACK_CATEGORIES: Record<Track, string[]> = {
  'IT & Networking': ['Cisco', 'Windows', 'PowerShell', 'Networking', 'Linux'],
  'Software Development': ['Git', 'npm', 'Docker', 'SQL', 'Laravel', 'Node.js'],
  'AI & Automation': ['n8n', 'curl', 'Webhooks', 'JSON', 'AI_API'],
};

export const CommandReferenceModal: React.FC<CommandReferenceModalProps> = ({
  isOpen,
  onClose,
  onInsertIntoNote,
}) => {
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for adding/editing command
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cmdText, setCmdText] = useState('');
  const [cmdTrack, setCmdTrack] = useState<Track>('IT & Networking');
  const [cmdCategory, setCmdCategory] = useState<string>('Cisco');
  const [cmdPurpose, setCmdPurpose] = useState('');
  const [cmdExample, setCmdExample] = useState('');
  const [cmdNotes, setCmdNotes] = useState('');

  const fetchCommands = async () => {
    try {
      const res = await fetch('/api/commands');
      if (res.ok) {
        const data = await res.json();
        setCommands(data);
      }
    } catch (err) {
      console.error('Failed to fetch commands:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCommands();
      setIsEditing(false);
      setEditingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, onClose]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((c) => {
    const matchTrack = activeTrack === 'all' || c.track === activeTrack;
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch =
      search.trim() === '' ||
      c.command.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase()) ||
      c.example.toLowerCase().includes(search.toLowerCase()) ||
      c.myNotes.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchTrack && matchCat && matchSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleInsert = (c: CommandItem) => {
    if (!onInsertIntoNote) return;
    const html = `<pre><code>${c.example || c.command}</code></pre><p><strong>Purpose:</strong> ${c.purpose}</p>${c.myNotes ? `<p><em>Notes: ${c.myNotes}</em></p>` : ''}`;
    onInsertIntoNote(html);
    onClose();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setCmdText('');
    const targetTrack = activeTrack === 'all' ? 'IT & Networking' : activeTrack;
    setCmdTrack(targetTrack);
    setCmdCategory(TRACK_CATEGORIES[targetTrack][0] || 'General');
    setCmdPurpose('');
    setCmdExample('');
    setCmdNotes('');
    setIsEditing(true);
  };

  const handleOpenEdit = (c: CommandItem) => {
    setEditingId(c.id);
    setCmdText(c.command);
    setCmdTrack(c.track || 'IT & Networking');
    setCmdCategory(c.category);
    setCmdPurpose(c.purpose);
    setCmdExample(c.example);
    setCmdNotes(c.myNotes);
    setIsEditing(true);
  };

  const handleSaveCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdText.trim()) return;

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/commands/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: cmdText,
            track: cmdTrack,
            category: cmdCategory,
            purpose: cmdPurpose,
            example: cmdExample,
            myNotes: cmdNotes,
          }),
        });
        if (res.ok) {
          fetchCommands();
          setIsEditing(false);
        }
      } else {
        // Create
        const res = await fetch('/api/commands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: cmdText,
            track: cmdTrack,
            category: cmdCategory,
            purpose: cmdPurpose,
            example: cmdExample,
            myNotes: cmdNotes,
          }),
        });
        if (res.ok) {
          fetchCommands();
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error('Save command failed:', err);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    if (!window.confirm('Delete this command from reference?')) return;
    try {
      const res = await fetch(`/api/commands/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCommands(commands.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Delete command failed:', err);
    }
  };

  // Subcategories to display based on selected track
  const availableSubcategories =
    activeTrack === 'all'
      ? ['all', ...Array.from(new Set(Object.values(TRACK_CATEGORIES).flat()))]
      : ['all', ...(TRACK_CATEGORIES[activeTrack] || [])];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
            <span className="font-semibold text-xs font-mono uppercase tracking-tight">
              Commands & Code Reference
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({commands.length} commands)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Command</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          /* Add / Edit Form */
          <form onSubmit={handleSaveCommand} className="p-5 space-y-3 overflow-y-auto flex-1">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {editingId ? 'Edit Command' : 'New Command'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Command / Snippet *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={cmdText}
                  onChange={(e) => setCmdText(e.target.value)}
                  placeholder="e.g. docker compose up -d"
                  className="w-full text-xs font-mono px-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Track
                </label>
                <select
                  value={cmdTrack}
                  onChange={(e) => {
                    const nextTrack = e.target.value as Track;
                    setCmdTrack(nextTrack);
                    setCmdCategory(TRACK_CATEGORIES[nextTrack][0] || 'General');
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none cursor-pointer"
                >
                  {ALL_TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={cmdCategory}
                  onChange={(e) => setCmdCategory(e.target.value)}
                  placeholder="e.g. Git, Docker, Cisco"
                  className="w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Purpose
              </label>
              <input
                type="text"
                value={cmdPurpose}
                onChange={(e) => setCmdPurpose(e.target.value)}
                placeholder="What this command does..."
                className="w-full text-xs px-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                CLI Example / Syntax
              </label>
              <textarea
                rows={3}
                value={cmdExample}
                onChange={(e) => setCmdExample(e.target.value)}
                placeholder="$ docker compose up -d --build"
                className="w-full text-xs font-mono px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                My Notes
              </label>
              <textarea
                rows={2}
                value={cmdNotes}
                onChange={(e) => setCmdNotes(e.target.value)}
                placeholder="Key things to remember..."
                className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium"
              >
                {editingId ? 'Save Changes' : 'Create Command'}
              </button>
            </div>
          </form>
        ) : (
          /* Commands Explorer */
          <>
            {/* Track Switcher Tabs */}
            <div className="px-3 pt-2.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTrack('all');
                  setActiveCategory('all');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
                  activeTrack === 'all'
                    ? 'border-black dark:border-white text-black dark:text-white font-semibold'
                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                All Tracks
              </button>
              {ALL_TRACKS.map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => {
                    setActiveTrack(track);
                    setActiveCategory('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTrack === track
                      ? 'border-black dark:border-white text-black dark:text-white font-semibold'
                      : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {track === 'IT & Networking' && <Network className="w-3 h-3 text-blue-600" />}
                  {track === 'Software Development' && <Code className="w-3 h-3 text-emerald-600" />}
                  {track === 'AI & Automation' && <Bot className="w-3 h-3 text-purple-600" />}
                  <span>{track}</span>
                </button>
              ))}
            </div>

            {/* Filters Bar: Search & Subcategory Pills */}
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands, flags, tools, or purposes..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-zinc-100"
                />
              </div>

              {/* Subcategory Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {availableSubcategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-0.8 rounded text-[11px] font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Commands */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800/60 p-2">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  No commands match your filter. Click "+ Add Command" to create one.
                </div>
              ) : (
                filteredCommands.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 hover:bg-gray-50/60 dark:hover:bg-zinc-950/50 rounded-md transition-colors group space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-zinc-100 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                          {c.command}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 uppercase">
                          {c.category}
                        </span>
                        {activeTrack === 'all' && c.track && (
                          <span className="text-[9px] font-mono text-gray-400">
                            • {c.track}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleCopy(c.id, c.example || c.command)}
                          className="p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-zinc-800"
                          title="Copy command"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {onInsertIntoNote && (
                          <button
                            type="button"
                            onClick={() => handleInsert(c)}
                            className="p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-zinc-800"
                            title="Insert into current note"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-zinc-800"
                          title="Edit command"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCommand(c.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-200 dark:hover:bg-zinc-800"
                          title="Delete command"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {c.purpose && (
                      <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                        {c.purpose}
                      </p>
                    )}

                    {c.example && (
                      <pre className="text-[11px] font-mono bg-gray-50 dark:bg-zinc-950 p-2 rounded border border-gray-200/80 dark:border-zinc-800 overflow-x-auto text-gray-800 dark:text-zinc-200">
                        {c.example}
                      </pre>
                    )}

                    {c.myNotes && (
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 italic">
                        Notes: {c.myNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
