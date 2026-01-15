/**
 * POST /api/feedback
 * Capture user feedback (stored in DB)
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const MAX_MESSAGE_LENGTH = 5000;

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { name, email, message, pagePath, reportId } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback message is required.' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Feedback is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
    }

    if (email && typeof email === 'string') {
      const emailTrim = email.trim();
      const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim);
      if (!emailValid) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: typeof name === 'string' ? name.trim() : null,
        email: typeof email === 'string' ? email.trim() : null,
        message: message.trim(),
        pagePath: typeof pagePath === 'string' ? pagePath.trim() : null,
        reportId: typeof reportId === 'string' ? reportId.trim() : null
      }
    });

    console.log('[feedback] captured', feedback.id, 'from', feedback.email || 'anonymous');

    return res.status(201).json({ success: true, id: feedback.id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({
      error: 'Failed to submit feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
