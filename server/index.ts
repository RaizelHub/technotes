import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { seedCategoriesOnly } from '../prisma/seed.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3100;

// Persistent Uploads Directory
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/attachments', express.static(uploadsDir));

// Initial seed for career track categories & default command references
async function initDefaults() {
  await seedCategoriesOnly();

  // Multi-Track Command Reference Seed Library
  const commandCount = await prisma.commandReference.count();
  if (commandCount < 15) {
    const DEFAULT_COMMANDS = [
      // --- IT & Networking ---
      {
        command: 'show ip interface brief',
        track: 'IT & Networking',
        category: 'Cisco',
        purpose: 'Displays summary of interface status, protocol, and assigned IP addresses.',
        example: 'Router# show ip interface brief',
        myNotes: 'Essential for quickly checking if interfaces are Up/Up or administratively down.',
      },
      {
        command: 'show running-config',
        track: 'IT & Networking',
        category: 'Cisco',
        purpose: 'Displays current active configuration in RAM.',
        example: 'Switch# show running-config | include vlan',
        myNotes: 'Pipe with include, section, or begin to filter large configs.',
      },
      {
        command: 'show ip route',
        track: 'IT & Networking',
        category: 'Cisco',
        purpose: 'Displays the active IPv4 routing table.',
        example: 'Router# show ip route ospf',
        myNotes: 'Codes: C=connected, S=static, O=OSPF, D=EIGRP, R=RIP.',
      },
      {
        command: 'show vlan brief',
        track: 'IT & Networking',
        category: 'Cisco',
        purpose: 'Lists configured VLANs and the access switchports assigned to them.',
        example: 'Switch# show vlan brief',
        myNotes: 'Trunk ports are not listed here; use show interfaces trunk.',
      },
      {
        command: 'ipconfig /all',
        track: 'IT & Networking',
        category: 'Windows',
        purpose: 'Displays comprehensive IP configuration including MAC, DHCP, and DNS servers.',
        example: 'C:\\> ipconfig /all',
        myNotes: 'First command to run when troubleshooting client network connectivity.',
      },
      {
        command: 'netstat -ano',
        track: 'IT & Networking',
        category: 'Windows',
        purpose: 'Displays active TCP/UDP connections with numeric ports and PID.',
        example: 'C:\\> netstat -ano | findstr :80',
        myNotes: 'Helps find port conflicts and malicious background connections.',
      },
      {
        command: 'Test-NetConnection -ComputerName 192.168.1.1 -Port 80',
        track: 'IT & Networking',
        category: 'PowerShell',
        purpose: 'Tests TCP connection to a host on a specific port (modern ping/telnet).',
        example: 'PS> Test-NetConnection 10.0.0.1 -Port 443',
        myNotes: 'Alias: tnc. Confirms firewall ports are open between devices.',
      },
      {
        command: 'ping -t 1.1.1.1',
        track: 'IT & Networking',
        category: 'Networking',
        purpose: 'Sends continuous ICMP echo requests until stopped with Ctrl+C.',
        example: 'C:\\> ping -t 8.8.8.8',
        myNotes: 'Great for monitoring packet loss while moving cables or rebooting switches.',
      },
      {
        command: 'ip a',
        track: 'IT & Networking',
        category: 'Linux',
        purpose: 'Displays network interfaces and IP addresses on Linux servers/appliances.',
        example: '$ ip a show eth0',
        myNotes: 'Replaces older ifconfig command.',
      },

      // --- Software Development ---
      {
        command: 'git status',
        track: 'Software Development',
        category: 'Git',
        purpose: 'Displays modified, staged, and untracked files in the working repository.',
        example: '$ git status -s',
        myNotes: 'Use -s for compact short-format output.',
      },
      {
        command: 'git rebase -i HEAD~3',
        track: 'Software Development',
        category: 'Git',
        purpose: 'Interactively squashes, rewords, or fixes the last 3 commits before pushing.',
        example: '$ git rebase -i origin/main',
        myNotes: 'Never rebase public commits that have already been pushed to shared branches.',
      },
      {
        command: 'npm run dev',
        track: 'Software Development',
        category: 'npm',
        purpose: 'Runs the local development server with hot module replacement (HMR).',
        example: '$ npm run dev -- --host',
        myNotes: 'Use -- --host to expose Vite to local network devices.',
      },
      {
        command: 'docker compose up -d',
        track: 'Software Development',
        category: 'Docker',
        purpose: 'Builds and starts all defined services in the background (detached mode).',
        example: '$ docker compose up -d --build',
        myNotes: 'Add --build to re-compile image layers when code changes.',
      },
      {
        command: 'docker exec -it <container> sh',
        track: 'Software Development',
        category: 'Docker',
        purpose: 'Opens an interactive shell terminal session inside a running Docker container.',
        example: '$ docker exec -it technotes-db psql -U postgres',
        myNotes: 'Use bash if the container has full bash installed, or sh for alpine.',
      },
      {
        command: 'SELECT * FROM users WHERE status = "active";',
        track: 'Software Development',
        category: 'SQL',
        purpose: 'Queries all active user rows from a relational SQL database.',
        example: 'EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;',
        myNotes: 'Use EXPLAIN ANALYZE in PostgreSQL to verify index usage and execution costs.',
      },
      {
        command: 'php artisan migrate',
        track: 'Software Development',
        category: 'Laravel',
        purpose: 'Executes outstanding database migrations in a Laravel application.',
        example: '$ php artisan migrate:status',
        myNotes: 'Use migrate:rollback to undo the last migration batch.',
      },

      // --- AI & Automation ---
      {
        command: 'n8n start --tunnel',
        track: 'AI & Automation',
        category: 'n8n',
        purpose: 'Starts local n8n instance with a secure public tunnel URL for incoming webhooks.',
        example: '$ n8n start --tunnel',
        myNotes: 'Essential when testing third-party webhooks (Stripe, GitHub) on localhost.',
      },
      {
        command: 'curl -X POST https://api.openai.com/v1/chat/completions',
        track: 'AI & Automation',
        category: 'curl',
        purpose: 'Tests an OpenAI LLM chat completion API endpoint directly from the CLI.',
        example:
          'curl -X POST https://api.openai.com/v1/chat/completions \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model": "gpt-4o", "messages": [{"role": "user", "content": "ping"}]}\'',
        myNotes: 'Quickest way to verify API key validity, rate limits, and raw JSON latency.',
      },
      {
        command: 'crypto.createHmac("sha256", secret)',
        track: 'AI & Automation',
        category: 'Webhooks',
        purpose: 'Generates HMAC SHA256 signature to verify inbound webhook authenticity.',
        example:
          'const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");',
        myNotes: 'Always compare signatures using crypto.timingSafeEqual to prevent timing attacks.',
      },
      {
        command: 'cat data.json | jq ".data[] | {id, name}"',
        track: 'AI & Automation',
        category: 'JSON',
        purpose: 'Filters and formats JSON payload outputs cleanly in the terminal.',
        example: '$ curl -s https://api.site.com/items | jq .',
        myNotes: 'Indispensable tool for inspecting webhook payloads and agent tool calling logs.',
      },
    ];

    for (const cmd of DEFAULT_COMMANDS) {
      const exists = await prisma.commandReference.findFirst({
        where: { command: cmd.command },
      });
      if (!exists) {
        await prisma.commandReference.create({ data: cmd });
      }
    }
  }
}

initDefaults().catch((err) => {
  console.error('Failed to initialize defaults:', err);
});

// ==========================================
// TRACKS SUMMARY (Requirement 10)
// ==========================================
app.get('/api/tracks/summary', async (_req, res) => {
  try {
    const tracks = ['IT & Networking', 'Software Development', 'AI & Automation'];
    const summaries = await Promise.all(
      tracks.map(async (track) => {
        const noteCount = await prisma.note.count({
          where: { track, isDeleted: false, isArchived: false },
        });
        const categoryCount = await prisma.category.count({
          where: { track },
        });
        const recentNote = await prisma.note.findFirst({
          where: { track, isDeleted: false, isArchived: false },
          orderBy: { updatedAt: 'desc' },
          select: { title: true },
        });
        return {
          track,
          noteCount,
          categoryCount,
          recentNoteTitle: recentNote?.title || undefined,
        };
      })
    );
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching tracks summary:', error);
    res.status(500).json({ error: 'Failed to fetch tracks summary' });
  }
});

// ==========================================
// CATEGORIES (Track-Aware)
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const { track } = req.query;
    const where: any = {};

    if (track && typeof track === 'string' && track !== 'all') {
      where.track = track;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            notes: {
              where: { isArchived: false, isDeleted: false },
            },
          },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, track = 'IT & Networking' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.upsert({
      where: {
        name_track: {
          name: name.trim(),
          track: track || 'IT & Networking',
        },
      },
      update: {},
      create: {
        name: name.trim(),
        track: track || 'IT & Networking',
      },
    });
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, track } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const data: any = { name: name.trim() };
    if (track) data.track = track;

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.note.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await prisma.category.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==========================================
// TAGS
// ==========================================
app.get('/api/tags', async (req, res) => {
  try {
    const { track } = req.query;
    const where: any = { isArchived: false, isDeleted: false };
    if (track && typeof track === 'string' && track !== 'all') {
      where.track = track;
    }

    const notes = await prisma.note.findMany({
      where,
      select: { tags: true },
    });

    const tagCounts: { [tag: string]: number } = {};
    for (const n of notes) {
      if (!n.tags) continue;
      const parsedTags = n.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      for (const t of parsedTags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
    const result = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Rename tag across all notes
app.put('/api/tags/:oldName/rename', async (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;
    if (!newName || !newName.trim()) {
      return res.status(400).json({ error: 'New tag name is required' });
    }
    const oldClean = oldName.trim().toLowerCase();
    const newClean = newName.trim().toLowerCase();

    const notes = await prisma.note.findMany({
      where: { tags: { contains: oldClean } },
    });

    for (const note of notes) {
      const tagsList = (note.tags || '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const replaced = tagsList.map((t) => (t === oldClean ? newClean : t));
      const unique = Array.from(new Set(replaced));
      await prisma.note.update({
        where: { id: note.id },
        data: { tags: unique.join(',') },
      });
    }

    res.json({ success: true, message: `Tag renamed from #${oldClean} to #${newClean}` });
  } catch (error) {
    console.error('Error renaming tag:', error);
    res.status(500).json({ error: 'Failed to rename tag' });
  }
});

// Delete tag across all notes
app.delete('/api/tags/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const targetTag = name.trim().toLowerCase();

    const notes = await prisma.note.findMany({
      where: { tags: { contains: targetTag } },
    });

    for (const note of notes) {
      const tagsList = (note.tags || '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const filtered = tagsList.filter((t) => t !== targetTag);
      await prisma.note.update({
        where: { id: note.id },
        data: { tags: filtered.join(',') },
      });
    }

    res.json({ success: true, message: `Tag #${targetTag} removed` });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// ==========================================
// NOTES (Track-Aware & Global Search)
// ==========================================
app.get('/api/notes', async (req, res) => {
  try {
    const {
      search,
      track,
      category,
      pinned,
      archived,
      trash,
      reviewLater,
      type,
      learningStatus,
      tag,
      sort = 'recently_updated',
    } = req.query;

    const where: any = {};

    // Trash filter
    if (trash === 'true') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;

      // Track filter
      if (track && typeof track === 'string' && track !== 'all') {
        where.track = track;
      }

      // Archived filter
      if (archived === 'true') {
        where.isArchived = true;
      } else if (archived === 'false' || archived === undefined) {
        where.isArchived = false;
      }

      // Review Later filter
      if (reviewLater === 'true') {
        where.isReviewLater = true;
      }

      // Note Type filter
      if (type && typeof type === 'string' && type !== 'all') {
        where.type = type;
      }

      // Learning status filter
      if (learningStatus && typeof learningStatus === 'string') {
        where.learningStatus = learningStatus;
      }

      // Pinned filter
      if (pinned === 'true') {
        where.isPinned = true;
      }

      // Category filter
      if (category && category !== 'all') {
        if (category === 'uncategorized') {
          where.categoryId = null;
        } else {
          where.categoryId = String(category);
        }
      }

      // Tag filter
      if (tag && typeof tag === 'string' && tag.trim() !== '') {
        where.tags = { contains: tag.trim().toLowerCase() };
      }
    }

    // Global Search: searches title, content, category, tags, and track
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { category: { name: { contains: q } } },
        { tags: { contains: q } },
        { track: { contains: q } },
      ];
    }

    // Sorting
    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'recently_created') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'alphabetical') {
      orderBy = { title: 'asc' };
    } else if (sort === 'recently_updated') {
      orderBy = { updatedAt: 'desc' };
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Random Review Endpoint: selects a random note from Review Later list or general notes
app.get('/api/notes/random-review', async (req, res) => {
  try {
    const { track } = req.query;
    const baseWhere: any = { isDeleted: false, isArchived: false };
    if (track && typeof track === 'string' && track !== 'all') {
      baseWhere.track = track;
    }

    // First try review later notes
    let notes = await prisma.note.findMany({
      where: { ...baseWhere, isReviewLater: true },
      include: { category: true },
    });

    // If none marked for review later, pick from any non-archived notes in track
    if (notes.length === 0) {
      notes = await prisma.note.findMany({
        where: baseWhere,
        include: { category: true },
      });
    }

    if (notes.length === 0) {
      return res.status(404).json({ error: 'No notes available for review' });
    }

    const randomIndex = Math.floor(Math.random() * notes.length);
    res.json(notes[randomIndex]);
  } catch (error) {
    console.error('Error picking random review note:', error);
    res.status(500).json({ error: 'Failed to pick random note' });
  }
});

// GET single note
app.get('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST create note
app.post('/api/notes', async (req, res) => {
  try {
    const {
      title = 'Untitled Note',
      content = '',
      type = 'general',
      track = 'IT & Networking',
      categoryId = null,
      isPinned = false,
      isReviewLater = false,
      learningStatus = 'none',
      tags = '',
      relatedNoteIds = '',
    } = req.body;

    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        content: content || '',
        type: type || 'general',
        track: track || 'IT & Networking',
        categoryId: categoryId || null,
        isPinned: Boolean(isPinned),
        isArchived: false,
        isReviewLater: Boolean(isReviewLater),
        learningStatus: learningStatus || 'none',
        isDeleted: false,
        tags: tags || '',
        relatedNoteIds: relatedNoteIds || '',
      },
      include: {
        category: true,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT update note (Auto-save)
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      type,
      track,
      categoryId,
      isPinned,
      isArchived,
      isReviewLater,
      learningStatus,
      isDeleted,
      tags,
      relatedNoteIds,
    } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (type !== undefined) data.type = type;
    if (track !== undefined) data.track = track;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isPinned !== undefined) data.isPinned = Boolean(isPinned);
    if (isArchived !== undefined) data.isArchived = Boolean(isArchived);
    if (isReviewLater !== undefined) data.isReviewLater = Boolean(isReviewLater);
    if (learningStatus !== undefined) data.learningStatus = learningStatus;
    if (isDeleted !== undefined) {
      data.isDeleted = Boolean(isDeleted);
      data.deletedAt = isDeleted ? new Date() : null;
    }
    if (tags !== undefined) data.tags = tags;
    if (relatedNoteIds !== undefined) data.relatedNoteIds = relatedNoteIds;

    const note = await prisma.note.update({
      where: { id },
      data,
      include: { category: true },
    });
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// PUT soft-delete / move note to trash
app.put('/api/notes/:id/trash', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res.json(note);
  } catch (error) {
    console.error('Error moving note to trash:', error);
    res.status(500).json({ error: 'Failed to move note to trash' });
  }
});

// PUT restore note from trash
app.put('/api/notes/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
    res.json(note);
  } catch (error) {
    console.error('Error restoring note from trash:', error);
    res.status(500).json({ error: 'Failed to restore note' });
  }
});

// DELETE note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!existing.isDeleted) {
      await prisma.note.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      res.json({ success: true, message: 'Note moved to trash' });
    } else {
      await prisma.note.delete({ where: { id } });
      res.json({ success: true, message: 'Note permanently deleted' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST empty trash permanently
app.post('/api/notes/trash/empty', async (_req, res) => {
  try {
    await prisma.note.deleteMany({
      where: { isDeleted: true },
    });
    res.json({ success: true, message: 'Trash emptied successfully' });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ error: 'Failed to empty trash' });
  }
});

// POST duplicate note
app.post('/api/notes/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = await prisma.note.create({
      data: {
        title: `${existing.title} (Copy)`,
        content: existing.content,
        type: existing.type,
        track: existing.track,
        categoryId: existing.categoryId,
        isPinned: existing.isPinned,
        isArchived: false,
        isReviewLater: existing.isReviewLater,
        learningStatus: existing.learningStatus,
        isDeleted: false,
        tags: existing.tags,
        relatedNoteIds: existing.relatedNoteIds,
      },
      include: { category: true },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error duplicating note:', error);
    res.status(500).json({ error: 'Failed to duplicate note' });
  }
});

// ==========================================
// ATTACHMENTS & IMAGE UPLOAD
// ==========================================
app.post('/api/attachments/upload', async (req, res) => {
  try {
    const { base64Data, filename, noteId } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.split('/')[1] || 'png';
    const cleanFilename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFilename);

    fs.writeFileSync(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        filename: cleanFilename,
        originalName: filename || cleanFilename,
        mimeType,
        size: buffer.length,
        noteId: noteId || null,
      },
    });

    res.json({
      success: true,
      url: `/api/attachments/${cleanFilename}`,
      attachment,
    });
  } catch (error) {
    console.error('Error saving image attachment:', error);
    res.status(500).json({ error: 'Failed to save attachment' });
  }
});

// ==========================================
// QUESTIONS (Learning Backlog)
// ==========================================
app.get('/api/questions', async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }
    const q = await prisma.question.create({
      data: {
        content: content.trim(),
        noteId: noteId || null,
      },
    });
    res.status(201).json(q);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isLearned } = req.body;
    const data: any = {};
    if (content !== undefined) data.content = content.trim();
    if (isLearned !== undefined) data.isLearned = Boolean(isLearned);

    const updated = await prisma.question.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ==========================================
// COMMAND REFERENCE (Multi-Track)
// ==========================================
app.get('/api/commands', async (req, res) => {
  try {
    const { track, category, search } = req.query;
    const where: any = {};

    if (track && track !== 'all') {
      where.track = String(track);
    }

    if (category && category !== 'all') {
      where.category = String(category);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { command: { contains: q } },
        { purpose: { contains: q } },
        { example: { contains: q } },
        { myNotes: { contains: q } },
        { track: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const commands = await prisma.commandReference.findMany({
      where,
      orderBy: [{ track: 'asc' }, { category: 'asc' }, { command: 'asc' }],
    });
    res.json(commands);
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

app.post('/api/commands', async (req, res) => {
  try {
    const { command, track = 'IT & Networking', category = 'Cisco', purpose = '', example = '', myNotes = '' } = req.body;
    if (!command || !command.trim()) {
      return res.status(400).json({ error: 'Command is required' });
    }
    const newCmd = await prisma.commandReference.create({
      data: {
        command: command.trim(),
        track: track || 'IT & Networking',
        category: category || 'Cisco',
        purpose: purpose || '',
        example: example || '',
        myNotes: myNotes || '',
      },
    });
    res.status(201).json(newCmd);
  } catch (error) {
    console.error('Error creating command:', error);
    res.status(500).json({ error: 'Failed to create command' });
  }
});

app.put('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { command, track, category, purpose, example, myNotes } = req.body;
    const data: any = {};
    if (command !== undefined) data.command = command.trim();
    if (track !== undefined) data.track = track;
    if (category !== undefined) data.category = category;
    if (purpose !== undefined) data.purpose = purpose;
    if (example !== undefined) data.example = example;
    if (myNotes !== undefined) data.myNotes = myNotes;

    const updated = await prisma.commandReference.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating command:', error);
    res.status(500).json({ error: 'Failed to update command' });
  }
});

app.delete('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.commandReference.delete({ where: { id } });
    res.json({ success: true, message: 'Command deleted' });
  } catch (error) {
    console.error('Error deleting command:', error);
    res.status(500).json({ error: 'Failed to delete command' });
  }
});

// ==========================================
// LEARNING TIMELINE
// ==========================================
app.get('/api/timeline', async (req, res) => {
  try {
    const { track } = req.query;
    const where: any = { isDeleted: false, isArchived: false };
    if (track && typeof track === 'string' && track !== 'all') {
      where.track = track;
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { category: true },
    });

    const groups: { [dateStr: string]: typeof notes } = {};
    for (const note of notes) {
      const d = new Date(note.updatedAt);
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(note);
    }

    const result = Object.entries(groups).map(([date, groupNotes]) => ({
      date,
      notes: groupNotes,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// ==========================================
// BACKUP & RESTORE
// ==========================================
app.get('/api/backup', async (_req, res) => {
  try {
    const dbPath = path.resolve('prisma/technotes.db');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.download(dbPath, `technotes-backup-${timestamp}.db`);
  } catch (error) {
    console.error('Error creating database backup:', error);
    res.status(500).json({ error: 'Failed to backup database' });
  }
});

app.post('/api/backup/restore', async (req, res) => {
  try {
    const { base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const dbPath = path.resolve('prisma/technotes.db');
    const matches = base64Data.match(/^data:.*?;base64,(.+)$/);
    const dataString = matches ? matches[1] : base64Data;
    const buffer = Buffer.from(dataString, 'base64');

    fs.writeFileSync(dbPath, buffer);
    res.json({ success: true, message: 'Database successfully restored from file.' });
  } catch (error) {
    console.error('Error restoring database backup:', error);
    res.status(500).json({ error: 'Failed to restore database' });
  }
});

// Clear all notes (preserves categories)
app.post('/api/notes/clear', async (_req, res) => {
  try {
    await prisma.note.deleteMany({});
    res.json({ success: true, message: 'All notes cleared' });
  } catch (error) {
    console.error('Error clearing notes:', error);
    res.status(500).json({ error: 'Failed to clear notes' });
  }
});

app.listen(PORT, () => {
  console.log(`TechNotes server running on http://127.0.0.1:${PORT}`);
});
