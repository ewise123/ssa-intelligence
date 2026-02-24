import React from 'react';
import { Portal } from '../Portal';
import {
  X,
  Building2,
  User,
  Tag,
  ExternalLink,
  Newspaper,
  Sparkles,
  Link2,
  Archive,
  Pin,
  Check,
  FileDown,
} from 'lucide-react';
import type { NewsArticle } from '../../services/newsManager';
import { useArticleViewTracker, trackEvent } from '../../services/activityTracker';

interface ArticleDetailModalProps {
  article: NewsArticle;
  onClose: () => void;
  onArchive?: (articleId: string) => void;
  onExport?: (articleId: string, format: 'pdf' | 'markdown' | 'docx') => void;
  isPinned?: boolean;
  onTogglePin?: (articleId: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onArchive,
  onExport,
  isPinned = false,
  onTogglePin,
}) => {
  // Track article open/close with duration
  useArticleViewTracker(article.id);

  return (
    <Portal>
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative p-6 bg-gradient-to-br from-brand-600 to-violet-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white leading-tight">{article.headline}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white/90 rounded-lg text-sm font-medium">
                    {article.sourceName}
                  </span>
                  {article.publishedAt && (
                    <span className="text-white/70 text-sm">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Tags Row */}
          <div className="flex flex-wrap gap-2.5">
            {article.company && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <Building2 size={14} />
                {article.company.name}
              </span>
            )}
            {article.person && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-purple-500/25 border border-purple-400/30">
                <User size={14} />
                {article.person.name}
              </span>
            )}
            {article.tag && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                <Tag size={14} />
                {article.tag.name}
              </span>
            )}
          </div>

          {/* Summary */}
          {(article.longSummary || article.shortSummary || article.summary) && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Newspaper size={16} className="text-slate-500" />
                Summary
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {article.longSummary || article.shortSummary || article.summary}
              </p>
            </div>
          )}

          {/* Why It Matters */}
          {article.whyItMatters && (
            <div className="bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 rounded-2xl p-5">
              <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-500" />
                Why It Matters
              </h3>
              <p className="text-brand-700 leading-relaxed">{article.whyItMatters}</p>
            </div>
          )}

          {/* Sources */}
          {article.sources && article.sources.length > 0 ? (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Link2 size={16} className="text-slate-500" />
                Sources
                <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full text-xs font-bold shadow-sm min-w-[24px]">{article.sources.length}</span>
              </h3>
              <div className="space-y-2">
                {article.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent({ type: 'article_link_click', articleId: article.id, metadata: { sourceName: source.sourceName } })}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:from-brand-50 hover:to-white border border-slate-100 hover:border-brand-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 group-hover:bg-brand-100 rounded-lg transition-colors">
                        <Link2 size={14} className="text-slate-500 group-hover:text-brand-600" />
                      </div>
                      <span className="text-slate-700 font-medium group-hover:text-brand-700 transition-colors">{source.sourceName}</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-500" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ type: 'article_link_click', articleId: article.id })}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-lg shadow-brand-500/30 hover:shadow-xl"
              >
                Read Full Article
                <ExternalLink size={16} />
              </a>
            )
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            {article.isArchived && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium">
                <Check size={14} />
                Archived
              </span>
            )}
            {isPinned && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium">
                <Pin size={14} className="fill-current" />
                Pinned
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onArchive && !article.isArchived && (
                <button
                  onClick={() => onArchive(article.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-slate-200 text-slate-600 hover:bg-slate-300"
                >
                  <Archive size={16} />
                  Archive
                </button>
              )}
              {onTogglePin && (
                <button
                  onClick={() => onTogglePin(article.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    isPinned
                      ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <Pin size={16} className={isPinned ? 'fill-current' : ''} />
                  {isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}
            </div>
            {onExport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExport(article.id, 'pdf')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:from-brand-600 hover:to-brand-700"
                >
                  <FileDown size={16} />
                  PDF
                </button>
                <button
                  onClick={() => onExport(article.id, 'markdown')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-slate-600 text-white shadow-md hover:bg-slate-700"
                >
                  <FileDown size={16} />
                  Markdown
                </button>
                <button
                  onClick={() => onExport(article.id, 'docx')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-slate-500 text-white shadow-md hover:bg-slate-600"
                >
                  <FileDown size={16} />
                  DOCX
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
};
