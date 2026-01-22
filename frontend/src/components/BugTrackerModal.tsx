import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Bug,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  RefreshCw,
  StickyNote
} from 'lucide-react';

// Types
type FeedbackType = 'bug' | 'issue' | 'feature' | 'other';
type FeedbackStatus = 'new_feedback' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string | null;
  message: string;
  name: string | null;
  email: string | null;
  pagePath: string | null;
  reportId: string | null;
  status: FeedbackStatus;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BugTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    type: FeedbackType;
    title: string;
    message: string;
    pagePath?: string;
    reportId?: string;
  }) => Promise<void>;
  onList: (filters?: { status?: FeedbackStatus; type?: FeedbackType }) => Promise<{
    data: FeedbackItem[];
    pagination: { total: number };
  }>;
  onUpdate: (id: string, data: { status?: FeedbackStatus; resolutionNotes?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  context: { pagePath?: string; reportId?: string };
}

// Type configuration
const typeConfig: Record<FeedbackType, { label: string; icon: typeof Bug; colors: string }> = {
  bug: {
    label: 'Bug',
    icon: Bug,
    colors: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
  },
  issue: {
    label: 'Issue',
    icon: AlertCircle,
    colors: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
  },
  feature: {
    label: 'Feature',
    icon: Lightbulb,
    colors: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
  },
  other: {
    label: 'Other',
    icon: HelpCircle,
    colors: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
  }
};

// Status configuration
const statusConfig: Record<FeedbackStatus, { label: string; colors: string }> = {
  new_feedback: { label: 'New', colors: 'bg-blue-50 text-blue-700 border-blue-200' },
  reviewed: { label: 'Reviewed', colors: 'bg-purple-50 text-purple-700 border-purple-200' },
  in_progress: { label: 'In Progress', colors: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', colors: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  wont_fix: { label: "Won't Fix", colors: 'bg-slate-100 text-slate-600 border-slate-200' }
};

const statusOptions: FeedbackStatus[] = ['new_feedback', 'reviewed', 'in_progress', 'resolved', 'wont_fix'];
const typeOptions: FeedbackType[] = ['bug', 'issue', 'feature', 'other'];

export const BugTrackerModal: React.FC<BugTrackerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onList,
  onUpdate,
  onDelete,
  context
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');

  // Submit tab state
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // View tab state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Ref to track auto-close timer for cleanup
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Define fetchFeedback before it's used in useEffect
  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const filters: { status?: FeedbackStatus; type?: FeedbackType } = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      const result = await onList(filters);
      setFeedbackList(result.data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, onList]);

  // Fetch feedback when view tab is activated
  useEffect(() => {
    if (isOpen && activeTab === 'view') {
      fetchFeedback();
    }
  }, [isOpen, activeTab, fetchFeedback]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clear any pending auto-close timer
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      setActiveTab('submit');
      setType('bug');
      setTitle('');
      setDescription('');
      setSubmitSuccess(false);
      setSubmitError(null);
      setFetchError(null);
      setExpandedId(null);
      setEditingNotes(null);
      setDeleteConfirmId(null);
      setDeletingId(null);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, submitting, onClose]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim() || title.trim().length < 3) {
      setSubmitError('Title must be at least 3 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setSubmitError('Description must be at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        type,
        title: title.trim(),
        message: description.trim(),
        ...context
      });
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      // Store timer ID for cleanup if modal is closed before timeout
      submitTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingId(id);
    try {
      await onUpdate(id, { status: newStatus });
      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
                resolvedAt: newStatus === 'resolved' || newStatus === 'wont_fix' ? new Date().toISOString() : null
              }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingNotes) return;
    setSavingNotes(true);
    try {
      await onUpdate(editingNotes.id, { resolutionNotes: editingNotes.notes });
      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === editingNotes.id ? { ...item, resolutionNotes: editingNotes.notes } : item
        )
      );
      setEditingNotes(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirmId(null);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'bug':
        return 'Describe the bug: What happened? What did you expect to happen? Steps to reproduce...';
      case 'issue':
        return 'Describe the issue you encountered...';
      case 'feature':
        return 'Describe the feature you would like to see...';
      default:
        return 'Share your feedback...';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-tracker-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header with tabs */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h3 id="bug-tracker-title" className="text-lg font-bold text-slate-800">Report Issue</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Submit
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'view'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                View All
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            disabled={submitting}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'submit' ? (
            /* Submit Tab */
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-medium text-slate-800">Thank you for your feedback!</p>
                  <p className="text-sm text-slate-500">We'll review it shortly.</p>
                </div>
              ) : (
                <>
                  {/* Type selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((t) => {
                        const config = typeConfig[t];
                        const Icon = config.icon;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                              type === t
                                ? `${config.colors} ring-2 ring-offset-1 ring-brand-300`
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon size={16} />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of the issue"
                      maxLength={200}
                      required
                    />
                    <div className="text-right text-[11px] text-slate-400 mt-1">{title.length}/200</div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[140px] focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={getPlaceholder()}
                      maxLength={5000}
                      required
                    />
                    <div className="text-right text-[11px] text-slate-400 mt-1">{description.length}/5000</div>
                  </div>

                  {/* Error/Success messages */}
                  {submitError && (
                    <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                      {submitError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow disabled:opacity-60 flex items-center gap-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* View All Tab */
            <div className="px-6 py-5">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusConfig[s].label}
                    </option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300"
                >
                  <option value="all">All Types</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {typeConfig[t].label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchFeedback}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                <span className="text-xs text-slate-400 ml-auto">
                  {feedbackList.length} item{feedbackList.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Error message */}
              {fetchError && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2 mb-4">
                  {fetchError}
                </div>
              )}

              {/* Feedback List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                </div>
              ) : fetchError ? null : feedbackList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">No feedback found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {feedbackList.map((item) => {
                    const typeConf = typeConfig[item.type];
                    const TypeIcon = typeConf.icon;
                    const statusConf = statusConfig[item.status];
                    const isExpanded = expandedId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        {/* Row header */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                          aria-expanded={isExpanded}
                          aria-controls={`feedback-details-${item.id}`}
                        >
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                          )}
                          <TypeIcon size={16} className={typeConf.colors.split(' ')[1]} />
                          <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                            {item.title || item.message.substring(0, 50)}
                          </span>
                          {item.resolutionNotes && (
                            <span title="Has notes">
                              <StickyNote size={14} className="text-emerald-500 flex-shrink-0" />
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConf.colors}`}
                          >
                            {statusConf.label}
                          </span>
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {formatDate(item.createdAt)}
                          </span>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div
                            id={`feedback-details-${item.id}`}
                            className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50"
                          >
                            {/* Description */}
                            <div className="mb-4">
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.message}</p>
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-slate-500 space-y-1 mb-4">
                              {item.name && <p>Submitted by: {item.name}</p>}
                              {item.email && <p>Email: {item.email}</p>}
                              <p>Created: {formatDate(item.createdAt)}</p>
                              {item.resolvedAt && <p>Resolved: {formatDate(item.resolvedAt)}</p>}
                              {item.pagePath && (
                                <p>
                                  Page:{' '}
                                  <a
                                    href={item.pagePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    {item.pagePath.length > 50
                                      ? `${item.pagePath.substring(0, 50)}...`
                                      : item.pagePath}
                                    <ExternalLink size={10} />
                                  </a>
                                </p>
                              )}
                            </div>

                            {/* Resolution notes */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-slate-600">
                                  Resolution Notes
                                </label>
                                {editingNotes?.id !== item.id && (
                                  <button
                                    onClick={() =>
                                      setEditingNotes({ id: item.id, notes: item.resolutionNotes || '' })
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    {item.resolutionNotes ? 'Edit' : 'Add notes'}
                                  </button>
                                )}
                              </div>
                              {editingNotes?.id === item.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingNotes.notes}
                                    onChange={(e) =>
                                      setEditingNotes({ ...editingNotes, notes: e.target.value })
                                    }
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300"
                                    placeholder="Add implementation notes, workarounds, or resolution details..."
                                    maxLength={2000}
                                  />
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400">
                                      {editingNotes.notes.length}/2000
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setEditingNotes(null)}
                                        className="text-xs text-slate-500 hover:text-slate-700"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes}
                                        className="text-xs text-white bg-brand-600 hover:bg-brand-700 px-3 py-1 rounded-md disabled:opacity-50"
                                      >
                                        {savingNotes ? 'Saving...' : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : item.resolutionNotes ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-slate-700">
                                  {item.resolutionNotes}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No notes yet.</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">Status:</label>
                                <select
                                  value={item.status}
                                  onChange={(e) =>
                                    handleStatusChange(item.id, e.target.value as FeedbackStatus)
                                  }
                                  disabled={updatingId === item.id}
                                  className="border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300 disabled:opacity-50"
                                >
                                  {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                      {statusConfig[s].label}
                                    </option>
                                  ))}
                                </select>
                                {updatingId === item.id && (
                                  <Loader2 size={12} className="animate-spin text-slate-400" />
                                )}
                              </div>

                              {deleteConfirmId === item.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">Delete?</span>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-2 py-1 rounded-md disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {deletingId === item.id ? (
                                      <>
                                        <Loader2 size={10} className="animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      'Yes'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={deletingId === item.id}
                                    className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(item.id)}
                                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                                  title="Delete"
                                  aria-label="Delete feedback"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
