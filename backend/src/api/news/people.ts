/**
 * Tracked People API Routes
 * GET /api/news/people - List all tracked people
 * POST /api/news/people - Create a new tracked person
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/news/people - List all tracked people
router.get('/', async (req: Request, res: Response) => {
  try {
    const people = await prisma.trackedPerson.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { callDiets: true, articles: true },
        },
      },
    });

    res.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

// POST /api/news/people - Create a new tracked person
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, title } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Check if person already exists (case-insensitive)
    const existing = await prisma.trackedPerson.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Person already exists',
        existing,
      });
      return;
    }

    const person = await prisma.trackedPerson.create({
      data: {
        name: name.trim(),
        title: title?.trim() || null,
      },
    });

    res.status(201).json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// DELETE /api/news/people/:id - Delete a tracked person
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const person = await prisma.trackedPerson.findUnique({
      where: { id },
    });

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    await prisma.trackedPerson.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

export default router;
