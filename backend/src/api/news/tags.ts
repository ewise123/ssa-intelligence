/**
 * News Tags API Routes
 * GET /api/news/tags - List all tags
 * POST /api/news/tags - Create a new tag
 * DELETE /api/news/tags/:id - Delete a tag
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { TagCategory } from '@prisma/client';

const router = Router();

// GET /api/news/tags - List all tags
router.get('/', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.newsTag.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { callDiets: true, articles: true },
        },
      },
    });

    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// POST /api/news/tags - Create a new tag
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!category || !['universal', 'pe', 'industrials'].includes(category)) {
      res.status(400).json({ error: 'Valid category is required (universal, pe, industrials)' });
      return;
    }

    // Check if tag already exists
    const existing = await prisma.newsTag.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      res.status(409).json({ error: 'Tag with this name already exists' });
      return;
    }

    const tag = await prisma.newsTag.create({
      data: {
        name: name.trim(),
        category: category as TagCategory,
      },
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// DELETE /api/news/tags/:id - Delete a tag
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check usage before deleting
    const tag = await prisma.newsTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { callDiets: true, articles: true },
        },
      },
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    // Warn if in use (but still allow deletion due to cascade)
    const inUseCount = tag._count.callDiets + tag._count.articles;

    await prisma.newsTag.delete({
      where: { id },
    });

    res.json({
      success: true,
      warning: inUseCount > 0 ? `Tag was in use by ${inUseCount} items` : undefined,
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
