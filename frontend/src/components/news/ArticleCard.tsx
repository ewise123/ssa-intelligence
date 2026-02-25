import React from 'react';
import {
  Building2,
  User,
  Tag,
  Send,
  Check,
  Link2,
  Pin,
  X,
} from 'lucide-react';
import type { NewsArticle } from '../../services/newsManager';

/** Strip <cite index="...">…</cite> wrappers, keeping inner text */
const stripCitations = (text: string) => text.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, '$1');

interface ArticleCardProps {
  article: NewsArticle;
  onClick: () => void;
  accentColor?: 'amber' | 'brand';
  isSelected?: boolean;
  isPinned?: boolean;
  onToggleSelection?: (articleId: string, event: React.MouseEvent) => void;
  onTogglePin?: (articleId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  accentColor = 'brand',
  isSelected = false,
  isPinned = false,
  onToggleSelection,
  onTogglePin,
}) => {
  const accentHover = accentColor === 'amber'
    ? 'hover:border-amber-300 hover:shadow-amber-100'
    : 'hover:border-brand-300 hover:shadow-brand-100';

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 group ${accentHover} ${
        isSelected ? 'border-brand-400 ring-2 ring-brand-200 shadow-brand-100' : 'border-slate-200'
      }`}
    >
      {/* Header with checkbox, pin, and status badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {onToggleSelection && (
            <button
              onClick={(e) => onToggleSelection(article.id, e)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-slate-300 hover:border-brand-400 bg-white'
              }`}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
            </button>
          )}
          {article.isSent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/25 border border-emerald-400/50">
              <Send size={9} />
              Sent
            </span>
          )}
          {article.isDismissed && !article.isSent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-orange-500/25 border border-orange-400/50">
              <X size={9} />
              Dismissed
            </span>
          )}
          {article.isArchived && !article.isSent && !article.isDismissed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-slate-500/25 border border-slate-400/50">
              <Check size={9} />
              Archived
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onTogglePin && (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(article.id); }}
              className={`p-1.5 rounded-lg transition-all ${
                isPinned
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
              }`}
              title={isPinned ? 'Unpin article' : 'Pin article'}
            >
              <Pin size={14} className={isPinned ? 'fill-current' : ''} />
            </button>
          )}
          {article.sources && article.sources.length > 1 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/80 shadow-sm">
              <Link2 size={10} className="text-slate-400" />
              {article.sources.length}
            </span>
          )}
        </div>
      </div>

      {/* Headline */}
      <h4 className="font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">{stripCitations(article.headline)}</h4>

      {/* Short Summary */}
      {(article.shortSummary || article.summary) && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {stripCitations(article.shortSummary || article.summary || '')}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.company && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 via-blue-50 to-cyan-50 text-blue-700 rounded-full text-[11px] font-semibold border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
            <Building2 size={11} className="text-blue-500" />
            {article.company.name}
          </span>
        )}
        {article.person && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 via-purple-50 to-pink-50 text-purple-700 rounded-full text-[11px] font-semibold border border-purple-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
            <User size={11} className="text-purple-500" />
            {article.person.name}
          </span>
        )}
        {article.tag && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 text-emerald-700 rounded-full text-[11px] font-semibold border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
            <Tag size={11} className="text-emerald-500" />
            {article.tag.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">{article.sourceName || 'Unknown'}</span>
        <span className="text-xs text-slate-400">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
      </div>
    </div>
  );
};
