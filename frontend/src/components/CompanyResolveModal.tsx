import React, { useState, useEffect } from 'react';
import type { CompanySuggestion } from '../services/researchManager';

type CompanyResolveModalProps = {
  isOpen: boolean;
  input: string;
  suggestions: CompanySuggestion[];
  status: 'corrected' | 'ambiguous';
  onConfirm: (selectedName: string) => void;
  onCancel: () => void;
};

export const CompanyResolveModal: React.FC<CompanyResolveModalProps> = ({
  isOpen,
  input,
  suggestions,
  status,
  onConfirm,
  onCancel
}) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    // Default to first suggestion if available
    if (suggestions.length > 0) {
      setSelectedValue(suggestions[0].canonicalName);
    } else {
      setSelectedValue(input);
    }
  }, [suggestions, input]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const title = status === 'corrected' ? 'Did you mean?' : 'Multiple matches found';
  const description =
    status === 'corrected'
      ? 'We detected a possible typo or variation. Please confirm the company you meant.'
      : 'Your search matches multiple companies. Please select the correct one.';

  const handleConfirm = () => {
    onConfirm(selectedValue || input);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p className="mb-1">
            <span className="font-medium">You entered:</span> "{input}"
          </p>
          <p className="text-amber-700">{description}</p>
        </div>

        <div className="space-y-2 mb-4">
          {suggestions.map((suggestion, index) => (
            <label
              key={`${suggestion.canonicalName}-${index}`}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                selectedValue === suggestion.canonicalName
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="company-suggestion"
                value={suggestion.canonicalName}
                checked={selectedValue === suggestion.canonicalName}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="mt-1 text-brand-600 focus:ring-brand-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{suggestion.displayName}</div>
                {suggestion.description && (
                  <div className="text-sm text-slate-500 mt-0.5">{suggestion.description}</div>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {suggestion.domain && <span>{suggestion.domain}</span>}
                  {suggestion.industry && <span>{suggestion.industry}</span>}
                </div>
              </div>
            </label>
          ))}

          {/* "Use as entered" option */}
          <label
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
              selectedValue === input
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="company-suggestion"
              value={input}
              checked={selectedValue === input}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="mt-1 text-brand-600 focus:ring-brand-500"
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900">Use as entered</div>
              <div className="text-sm text-slate-500 mt-0.5">
                Keep "{input}" without changes
              </div>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
