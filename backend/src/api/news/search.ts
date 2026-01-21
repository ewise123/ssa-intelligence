/**
 * News Ad-Hoc Search API Route
 * POST /api/news/search - Search for news about specific company/person
 */

import { Router, Request, Response } from 'express';
import { searchNews } from '../../services/news-fetcher.js';

const router = Router();

// POST /api/news/search - Ad-hoc search
router.post('/', async (req: Request, res: Response) => {
  try {
    const { company, person, topics } = req.body;

    // At least one search parameter required
    if (!company && !person) {
      res.status(400).json({
        error: 'At least one of company or person is required',
      });
      return;
    }

    console.log('[search] Ad-hoc search:', { company, person, topics });

    const result = await searchNews({
      company: company?.trim(),
      person: person?.trim(),
      topics: Array.isArray(topics) ? topics : [],
    });

    res.json({
      success: true,
      articles: result.articles,
      coverageGaps: result.coverageGaps,
    });
  } catch (error) {
    console.error('[search] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
});

export default router;
