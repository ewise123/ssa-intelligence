/**
 * Tracked Companies API Routes
 * GET /api/news/companies - List all tracked companies
 * POST /api/news/companies - Create a new tracked company
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/news/companies - List all tracked companies
router.get('/', async (req: Request, res: Response) => {
  try {
    const companies = await prisma.trackedCompany.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { callDiets: true, articles: true },
        },
      },
    });

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// POST /api/news/companies - Create a new tracked company
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, ticker } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Check if company already exists (case-insensitive)
    const existing = await prisma.trackedCompany.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Company already exists',
        existing,
      });
      return;
    }

    const company = await prisma.trackedCompany.create({
      data: {
        name: name.trim(),
        ticker: ticker?.trim() || null,
      },
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// DELETE /api/news/companies/:id - Delete a tracked company
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.trackedCompany.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    await prisma.trackedCompany.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;
