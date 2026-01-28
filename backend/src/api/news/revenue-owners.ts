/**
 * Revenue Owners API Routes
 * Full CRUD for revenue owners and their Call Diets
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/news/revenue-owners - List all revenue owners
router.get('/', async (req: Request, res: Response) => {
  try {
    const owners = await prisma.revenueOwner.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            companies: true,
            people: true,
            tags: true,
          },
        },
      },
    });

    res.json(owners);
  } catch (error) {
    console.error('Error fetching revenue owners:', error);
    res.status(500).json({ error: 'Failed to fetch revenue owners' });
  }
});

// GET /api/news/revenue-owners/:id - Get revenue owner with full Call Diet
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await prisma.revenueOwner.findUnique({
      where: { id },
      include: {
        companies: {
          include: { company: true },
        },
        people: {
          include: { person: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!owner) {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    // Flatten the response for easier consumption
    res.json({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
      companies: owner.companies.map(c => c.company),
      people: owner.people.map(p => p.person),
      tags: owner.tags.map(t => t.tag),
    });
  } catch (error) {
    console.error('Error fetching revenue owner:', error);
    res.status(500).json({ error: 'Failed to fetch revenue owner' });
  }
});

// POST /api/news/revenue-owners - Create a new revenue owner
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const owner = await prisma.revenueOwner.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(owner);
  } catch (error) {
    console.error('Error creating revenue owner:', error);
    res.status(500).json({ error: 'Failed to create revenue owner' });
  }
});

// PUT /api/news/revenue-owners/:id - Update revenue owner name and/or email
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updateData: { name?: string; email?: string | null } = {};

    if (name && typeof name === 'string') {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      updateData.email = email ? email.trim() : null;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Name or email is required' });
      return;
    }

    const owner = await prisma.revenueOwner.update({
      where: { id },
      data: updateData,
    });

    res.json(owner);
  } catch (error) {
    console.error('Error updating revenue owner:', error);
    res.status(500).json({ error: 'Failed to update revenue owner' });
  }
});

// DELETE /api/news/revenue-owners/:id - Delete a revenue owner
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await prisma.revenueOwner.findUnique({
      where: { id },
    });

    if (!owner) {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    await prisma.revenueOwner.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting revenue owner:', error);
    res.status(500).json({ error: 'Failed to delete revenue owner' });
  }
});

// ============================================================================
// Call Diet Management - Companies
// ============================================================================

// POST /api/news/revenue-owners/:id/companies - Add company to Call Diet
router.post('/:id/companies', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId, name, ticker, cik } = req.body;

    // Verify owner exists
    const owner = await prisma.revenueOwner.findUnique({ where: { id } });
    if (!owner) {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    let targetCompanyId = companyId;

    // If no companyId provided, create or find company by name
    if (!companyId && name) {
      let company = await prisma.trackedCompany.findFirst({
        where: { name: { equals: name.trim(), mode: 'insensitive' } },
      });

      if (!company) {
        company = await prisma.trackedCompany.create({
          data: {
            name: name.trim(),
            ticker: ticker?.trim() || null,
            cik: cik?.trim() || null,
          },
        });
      } else if (cik && !company.cik) {
        // Update existing company with CIK if provided and not already set
        company = await prisma.trackedCompany.update({
          where: { id: company.id },
          data: { cik: cik.trim() },
        });
      }

      targetCompanyId = company.id;
    }

    if (!targetCompanyId) {
      res.status(400).json({ error: 'Either companyId or name is required' });
      return;
    }

    // Add to call diet (upsert to handle duplicates gracefully)
    await prisma.callDietCompany.upsert({
      where: {
        revenueOwnerId_companyId: {
          revenueOwnerId: id,
          companyId: targetCompanyId,
        },
      },
      create: {
        revenueOwnerId: id,
        companyId: targetCompanyId,
      },
      update: {},
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding company to call diet:', error);
    res.status(500).json({ error: 'Failed to add company' });
  }
});

// DELETE /api/news/revenue-owners/:id/companies/:companyId - Remove company from Call Diet
router.delete('/:id/companies/:companyId', async (req: Request, res: Response) => {
  try {
    const { id, companyId } = req.params;

    await prisma.callDietCompany.delete({
      where: {
        revenueOwnerId_companyId: {
          revenueOwnerId: id,
          companyId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing company from call diet:', error);
    res.status(500).json({ error: 'Failed to remove company' });
  }
});

// POST /api/news/revenue-owners/:id/companies/bulk-delete - Remove multiple companies from Call Diet
router.post('/:id/companies/bulk-delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyIds } = req.body;

    if (!Array.isArray(companyIds) || companyIds.length === 0) {
      res.status(400).json({ error: 'companyIds must be a non-empty array' });
      return;
    }

    const result = await prisma.callDietCompany.deleteMany({
      where: {
        revenueOwnerId: id,
        companyId: { in: companyIds },
      },
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error bulk removing companies from call diet:', error);
    res.status(500).json({ error: 'Failed to remove companies' });
  }
});

// ============================================================================
// Call Diet Management - People
// ============================================================================

// POST /api/news/revenue-owners/:id/people - Add person to Call Diet
router.post('/:id/people', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { personId, name, companyAffiliation } = req.body;

    // Verify owner exists
    const owner = await prisma.revenueOwner.findUnique({ where: { id } });
    if (!owner) {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    let targetPersonId = personId;

    // If no personId provided, create or find person by name
    if (!personId && name) {
      let person = await prisma.trackedPerson.findFirst({
        where: { name: { equals: name.trim(), mode: 'insensitive' } },
      });

      if (!person) {
        person = await prisma.trackedPerson.create({
          data: { name: name.trim(), companyAffiliation: companyAffiliation?.trim() || null },
        });
      }

      targetPersonId = person.id;
    }

    if (!targetPersonId) {
      res.status(400).json({ error: 'Either personId or name is required' });
      return;
    }

    // Add to call diet
    await prisma.callDietPerson.upsert({
      where: {
        revenueOwnerId_personId: {
          revenueOwnerId: id,
          personId: targetPersonId,
        },
      },
      create: {
        revenueOwnerId: id,
        personId: targetPersonId,
      },
      update: {},
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding person to call diet:', error);
    res.status(500).json({ error: 'Failed to add person' });
  }
});

// DELETE /api/news/revenue-owners/:id/people/:personId - Remove person from Call Diet
router.delete('/:id/people/:personId', async (req: Request, res: Response) => {
  try {
    const { id, personId } = req.params;

    await prisma.callDietPerson.delete({
      where: {
        revenueOwnerId_personId: {
          revenueOwnerId: id,
          personId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing person from call diet:', error);
    res.status(500).json({ error: 'Failed to remove person' });
  }
});

// POST /api/news/revenue-owners/:id/people/bulk-delete - Remove multiple people from Call Diet
router.post('/:id/people/bulk-delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { personIds } = req.body;

    if (!Array.isArray(personIds) || personIds.length === 0) {
      res.status(400).json({ error: 'personIds must be a non-empty array' });
      return;
    }

    const result = await prisma.callDietPerson.deleteMany({
      where: {
        revenueOwnerId: id,
        personId: { in: personIds },
      },
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error bulk removing people from call diet:', error);
    res.status(500).json({ error: 'Failed to remove people' });
  }
});

// ============================================================================
// Call Diet Management - Tags
// ============================================================================

// POST /api/news/revenue-owners/:id/tags - Add tag to Call Diet
router.post('/:id/tags', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    if (!tagId) {
      res.status(400).json({ error: 'tagId is required' });
      return;
    }

    // Verify owner exists
    const owner = await prisma.revenueOwner.findUnique({ where: { id } });
    if (!owner) {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    // Verify tag exists
    const tag = await prisma.newsTag.findUnique({ where: { id: tagId } });
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    // Add to call diet
    await prisma.callDietTag.upsert({
      where: {
        revenueOwnerId_tagId: {
          revenueOwnerId: id,
          tagId,
        },
      },
      create: {
        revenueOwnerId: id,
        tagId,
      },
      update: {},
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding tag to call diet:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// DELETE /api/news/revenue-owners/:id/tags/:tagId - Remove tag from Call Diet
router.delete('/:id/tags/:tagId', async (req: Request, res: Response) => {
  try {
    const { id, tagId } = req.params;

    await prisma.callDietTag.delete({
      where: {
        revenueOwnerId_tagId: {
          revenueOwnerId: id,
          tagId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing tag from call diet:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

export default router;
