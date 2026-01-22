/**
 * Bug Tracker / Feedback API
 *
 * POST   /api/feedback      - Submit new feedback
 * GET    /api/feedback      - List all feedback with filtering
 * PATCH  /api/feedback/:id  - Update status/resolution notes
 * DELETE /api/feedback/:id  - Delete feedback entry
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { FeedbackType, FeedbackStatus } from '@prisma/client';

// Validation constants
const MAX_TITLE_LENGTH = 200;
const MIN_TITLE_LENGTH = 3;
const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_RESOLUTION_NOTES_LENGTH = 2000;

// Valid enum values for runtime validation
const VALID_TYPES: FeedbackType[] = ['bug', 'issue', 'feature', 'other'];
const VALID_STATUSES: FeedbackStatus[] = ['new_feedback', 'reviewed', 'in_progress', 'resolved', 'wont_fix'];

/**
 * POST /api/feedback
 * Submit new feedback/bug report
 */
export async function submitFeedback(req: Request, res: Response) {
  try {
    const { type, title, name, email, message, pagePath, reportId } = req.body || {};

    // Validate type if provided
    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    // Validate title if provided
    if (title) {
      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string.' });
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < MIN_TITLE_LENGTH) {
        return res.status(400).json({ error: `Title must be at least ${MIN_TITLE_LENGTH} characters.` });
      }
      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        return res.status(400).json({ error: `Title must be at most ${MAX_TITLE_LENGTH} characters.` });
      }
    }

    // Validate message (required)
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Description/message is required.' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Description must be at least ${MIN_MESSAGE_LENGTH} characters.` });
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Description must be at most ${MAX_MESSAGE_LENGTH} characters.` });
    }

    // Validate email format if provided
    if (email && typeof email === 'string') {
      const emailTrim = email.trim();
      const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim);
      if (!emailValid) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        type: type || 'other',
        title: typeof title === 'string' ? title.trim() : null,
        name: typeof name === 'string' ? name.trim() : null,
        email: typeof email === 'string' ? email.trim() : null,
        message: trimmedMessage,
        pagePath: typeof pagePath === 'string' ? pagePath.trim() : null,
        reportId: typeof reportId === 'string' ? reportId.trim() : null,
        status: 'new_feedback'
      }
    });

    console.log(`[feedback] submitted ${feedback.type}: "${feedback.title || '(no title)'}" (id: ${feedback.id})`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      id: feedback.id
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({
      error: 'Failed to submit feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/feedback
 * List all feedback with optional filtering
 */
export async function listFeedback(req: Request, res: Response) {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    // Build where clause
    const where: { status?: FeedbackStatus; type?: FeedbackType } = {};

    if (status && typeof status === 'string' && VALID_STATUSES.includes(status as FeedbackStatus)) {
      where.status = status as FeedbackStatus;
    }

    if (type && typeof type === 'string' && VALID_TYPES.includes(type as FeedbackType)) {
      where.type = type as FeedbackType;
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Fetch feedback with count
    const [data, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.feedback.count({ where })
    ]);

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error listing feedback:', error);
    return res.status(500).json({
      error: 'Failed to list feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * PATCH /api/feedback/:id
 * Update feedback status and/or resolution notes
 */
export async function updateFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Feedback ID is required.' });
    }

    // Check if feedback exists
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    // Build update data
    const updateData: {
      status?: FeedbackStatus;
      resolutionNotes?: string | null;
      resolvedAt?: Date | null;
    } = {};

    // Validate and set status
    if (status !== undefined) {
      if (typeof status !== 'string' || !VALID_STATUSES.includes(status as FeedbackStatus)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      updateData.status = status as FeedbackStatus;

      // Auto-set resolvedAt when status changes to resolved or wont_fix
      if (status === 'resolved' || status === 'wont_fix') {
        if (!existing.resolvedAt) {
          updateData.resolvedAt = new Date();
        }
      } else {
        // Clear resolvedAt if moving back to non-resolved status
        updateData.resolvedAt = null;
      }
    }

    // Validate and set resolution notes
    if (resolutionNotes !== undefined) {
      if (resolutionNotes === null || resolutionNotes === '') {
        updateData.resolutionNotes = null;
      } else if (typeof resolutionNotes === 'string') {
        if (resolutionNotes.length > MAX_RESOLUTION_NOTES_LENGTH) {
          return res.status(400).json({ error: `Resolution notes must be at most ${MAX_RESOLUTION_NOTES_LENGTH} characters.` });
        }
        updateData.resolutionNotes = resolutionNotes.trim();
      } else {
        return res.status(400).json({ error: 'Resolution notes must be a string.' });
      }
    }

    // Guard against empty update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nothing to update. Provide status or resolutionNotes.' });
    }

    // Perform update
    const updated = await prisma.feedback.update({
      where: { id },
      data: updateData
    });

    console.log(`[feedback] updated ${id}: status=${updated.status}`);

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return res.status(500).json({
      error: 'Failed to update feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * DELETE /api/feedback/:id
 * Delete a feedback entry
 */
export async function deleteFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Feedback ID is required.' });
    }

    // Check if feedback exists
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    await prisma.feedback.delete({ where: { id } });

    console.log(`[feedback] deleted ${id}: "${existing.title || (existing.message?.substring(0, 30) ?? '(no message)')}..."`);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({
      error: 'Failed to delete feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
