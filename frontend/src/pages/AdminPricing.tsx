import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface AdminPricingProps {
  isAdmin?: boolean;
}

interface PricingRate {
  id: string;
  provider: string;
  model: string;
  inputRate: number;
  outputRate: number;
  cacheReadRate: number;
  cacheWriteRate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const AdminPricing: React.FC<AdminPricingProps> = ({ isAdmin }) => {
  const [rates, setRates] = useState<PricingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<PricingRate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    provider: 'anthropic',
    model: '',
    inputRate: '',
    outputRate: '',
    cacheReadRate: '',
    cacheWriteRate: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/admin/pricing`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch pricing rates');
      }

      const data = await res.json();
      setRates(data.rates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRate(null);
    setFormData({
      provider: 'anthropic',
      model: '',
      inputRate: '',
      outputRate: '',
      cacheReadRate: '0',
      cacheWriteRate: '0',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (rate: PricingRate) => {
    setEditingRate(rate);
    setFormData({
      provider: rate.provider,
      model: rate.model,
      inputRate: rate.inputRate.toString(),
      outputRate: rate.outputRate.toString(),
      cacheReadRate: rate.cacheReadRate.toString(),
      cacheWriteRate: rate.cacheWriteRate.toString(),
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRate(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        provider: formData.provider,
        model: formData.model,
        inputRate: parseFloat(formData.inputRate),
        outputRate: parseFloat(formData.outputRate),
        cacheReadRate: parseFloat(formData.cacheReadRate) || 0,
        cacheWriteRate: parseFloat(formData.cacheWriteRate) || 0,
      };

      if (isNaN(payload.inputRate) || isNaN(payload.outputRate)) {
        throw new Error('Input and output rates are required');
      }

      let res: Response;
      if (editingRate) {
        res = await fetch(`${apiBase}/admin/pricing/${editingRate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiBase}/admin/pricing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save pricing rate');
      }

      closeModal();
      fetchRates();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rate: PricingRate) => {
    if (!confirm(`Delete pricing rate for ${rate.provider}/${rate.model}?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/pricing/${rate.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete pricing rate');
      }

      fetchRates();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Pricing Rates</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Rate
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Input Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Output Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Cache Read</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Cache Write</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Effective</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No pricing rates configured
                    </td>
                  </tr>
                ) : (
                  rates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">{rate.provider}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{rate.model}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">${rate.inputRate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">${rate.outputRate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">${rate.cacheReadRate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">${rate.cacheWriteRate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(rate.effectiveFrom)}</td>
                      <td className="px-4 py-3">
                        {rate.effectiveTo === null ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rate.effectiveTo === null && (
                            <button
                              onClick={() => openEditModal(rate)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(rate)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingRate ? 'Edit Pricing Rate' : 'Add New Pricing Rate'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="anthropic"
                  required
                  disabled={!!editingRate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="claude-sonnet-4-5-20250514"
                  required
                  disabled={!!editingRate}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Input Rate ($/1M tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.inputRate}
                    onChange={(e) => setFormData({ ...formData, inputRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="3.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Output Rate ($/1M tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.outputRate}
                    onChange={(e) => setFormData({ ...formData, outputRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="15.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cache Read Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cacheReadRate}
                    onChange={(e) => setFormData({ ...formData, cacheReadRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0.30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cache Write Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cacheWriteRate}
                    onChange={(e) => setFormData({ ...formData, cacheWriteRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="3.75"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
