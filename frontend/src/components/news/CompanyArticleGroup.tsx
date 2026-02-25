import React, { useState } from 'react';
import {
  ChevronRight,
  Building2,
  User,
  Check,
  Minus,
} from 'lucide-react';
import type { NewsArticle } from '../../services/newsManager';
import { ArticleCard } from './ArticleCard';

interface CompanyArticleGroupProps {
  companyName: string;
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  selectedIds?: Set<string>;
  onToggleSelection?: (articleId: string, event: React.MouseEvent) => void;
  pinnedIds?: Set<string>;
  onTogglePin?: (articleId: string) => void;
  onToggleGroupSelection?: (articleIds: string[], event: React.MouseEvent) => void;
  groupType?: 'company' | 'person';
}

export const CompanyArticleGroup: React.FC<CompanyArticleGroupProps> = ({
  companyName,
  articles,
  onArticleClick,
  selectedIds,
  onToggleSelection,
  pinnedIds,
  onTogglePin,
  onToggleGroupSelection,
  groupType = 'company',
}) => {
  const [collapsed, setCollapsed] = useState(true);

  const isPerson = groupType === 'person';
  const Icon = isPerson ? User : Building2;

  const articleIds = articles.map(a => a.id);
  const allSelected = selectedIds ? articleIds.length > 0 && articleIds.every(id => selectedIds.has(id)) : false;
  const someSelected = selectedIds ? !allSelected && articleIds.some(id => selectedIds.has(id)) : false;

  return (
    <div className="relative">
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r ${isPerson ? 'from-purple-50 to-pink-50 border border-purple-100' : 'from-brand-50 to-violet-50 border border-brand-100'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className={`p-1.5 rounded-lg transition-transform ${collapsed ? 'rotate-0' : 'rotate-90'}`}>
            <ChevronRight size={18} className="text-slate-500" />
          </div>
          <div className={`p-2 rounded-xl shadow-md bg-gradient-to-br ${isPerson ? 'from-purple-400 to-pink-500' : 'from-brand-400 to-violet-500'}`}>
            <Icon className="text-white" size={18} />
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold text-slate-800">{companyName}</h3>
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold min-w-[28px] shadow-md border backdrop-blur-sm bg-gradient-to-r text-white ${isPerson ? 'from-purple-500 to-pink-500 border-purple-400/50 shadow-purple-500/30' : 'from-brand-500 to-violet-500 border-brand-400/50 shadow-brand-500/30'}`}>
              {articles.length}
            </span>
          </div>
        </button>
        {onToggleGroupSelection && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleGroupSelection(articleIds, e); }}
            role="checkbox"
            aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
            aria-label={`Select all articles for ${companyName}`}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              allSelected || someSelected
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-slate-300 hover:border-brand-400 bg-white'
            }`}
          >
            {allSelected && <Check size={12} strokeWidth={3} />}
            {someSelected && <Minus size={12} strokeWidth={3} />}
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onArticleClick(article)}
              isSelected={selectedIds?.has(article.id) || false}
              isPinned={pinnedIds?.has(article.id) || false}
              onToggleSelection={onToggleSelection}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
