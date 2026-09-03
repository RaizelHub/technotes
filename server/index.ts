import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { seedCategoriesOnly, DEFAULT_CATEGORIES, SAMPLE_NOTES } from '../prisma/seed.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json());

// Ensure default categories exist on startup (Zero mockup notes)
seedCategoriesOnly().catch((err) => {
  console.error('Failed to initialize default categories:', err);
});

// GET all categories with note count
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            notes: {
              where: { isArchived: false },
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

// POST new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT rename category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category (unlinks notes instead of deleting them)
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Set notes to null categoryId first
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

// GET distinct tags with non-archived note count
app.get('/api/tags', async (_req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { isArchived: false },
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

// GET notes with filtering, search, and sorting
app.get('/api/notes', async (req, res) => {
  try {
    const {
      search,
      category,
      pinned,
      archived,
      tag,
      sort = 'recently_updated',
    } = req.query;

    const where: any = {};

    // Archived filter (default to false if not specified)
    if (archived === 'true') {
      where.isArchived = true;
    } else if (archived === 'false' || archived === undefined) {
      where.isArchived = false;
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

    // Search query across title and content
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { category: { name: { contains: q } } },
        { tags: { contains: q } },
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
    const { title = 'Untitled Note', content = '', categoryId = null, isPinned = false, tags = '' } = req.body;
    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        content: content || '',
        categoryId: categoryId || null,
        isPinned: Boolean(isPinned),
        isArchived: false,
        tags: tags || '',
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
    const { title, content, categoryId, isPinned, isArchived, tags } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isPinned !== undefined) data.isPinned = Boolean(isPinned);
    if (isArchived !== undefined) data.isArchived = Boolean(isArchived);
    if (tags !== undefined) data.tags = tags;

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

// DELETE note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.note.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST duplicate note
app.post('/api/notes/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.note.findUnique({
      where: { id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const duplicated = await prisma.note.create({
      data: {
        title: `${existing.title} (Copy)`,
        content: existing.content,
        categoryId: existing.categoryId,
        isPinned: false,
        isArchived: false,
      },
      include: { category: true },
    });
    res.status(201).json(duplicated);
  } catch (error) {
    console.error('Error duplicating note:', error);
    res.status(500).json({ error: 'Failed to duplicate note' });
  }
});

// POST reset sample data
app.post('/api/seed/reset', async (_req, res) => {
  try {
    // Delete existing notes and categories
    await prisma.note.deleteMany({});
    await prisma.category.deleteMany({});

    // Seed afresh
    for (const catName of DEFAULT_CATEGORIES) {
      await prisma.category.create({
        data: { name: catName },
      });
    }

    const allCategories = await prisma.category.findMany();
    const catMap = new Map(allCategories.map((c) => [c.name, c.id]));

    for (const sample of SAMPLE_NOTES) {
      await prisma.note.create({
        data: {
          title: sample.title,
          content: sample.content.trim(),
          categoryId: catMap.get(sample.categoryName) || null,
          isPinned: sample.isPinned,
          isArchived: false,
        },
      });
    }

    res.json({ success: true, message: 'Sample data successfully restored' });
  } catch (error) {
    console.error('Error resetting sample data:', error);
    res.status(500).json({ error: 'Failed to reset sample data' });
  }
});

// POST clear all notes (for clean slate)
app.post('/api/notes/clear', async (_req, res) => {
  try {
    await prisma.note.deleteMany({});
    res.json({ success: true, message: 'All notes successfully removed' });
  } catch (error) {
    console.error('Error clearing notes:', error);
    res.status(500).json({ error: 'Failed to clear notes' });
  }
});

// GET SQLite database backup download
app.get('/api/backup', (_req, res) => {
  try {
    const dbPath = path.resolve('prisma', 'technotes.db');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.download(dbPath, `technotes-backup-${timestamp}.db`);
  } catch (error) {
    console.error('Error creating database backup:', error);
    res.status(500).json({ error: 'Failed to create database backup' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'TechNotes' });
});

app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`TechNotes API server running on http://127.0.0.1:${PORT}`);
});
