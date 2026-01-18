/**
 * News Setup Page
 * Manage Revenue Owners, their Call Diets, and Tags
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Building2, User, Tag, ChevronRight, Loader2, Save, Settings, Users, Briefcase, Sparkles } from 'lucide-react';
import {
  useRevenueOwners,
  useNewsTags,
  RevenueOwner,
  NewsTag,
  TrackedCompany,
  TrackedPerson,
} from '../services/newsManager';

interface NewsSetupProps {
  onNavigate: (path: string) => void;
}

export const NewsSetup: React.FC<NewsSetupProps> = ({ onNavigate }) => {
  const {
    owners,
    loading: ownersLoading,
    fetchOwners,
    getOwnerDetails,
    createOwner,
    deleteOwner,
    addCompanyToOwner,
    removeCompanyFromOwner,
    addPersonToOwner,
    removePersonFromOwner,
    addTagToOwner,
    removeTagFromOwner,
  } = useRevenueOwners();

  const { tags, loading: tagsLoading } = useNewsTags();

  const [selectedOwner, setSelectedOwner] = useState<RevenueOwner | null>(null);
  const [ownerDetails, setOwnerDetails] = useState<RevenueOwner | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [newOwnerName, setNewOwnerName] = useState('');
  const [companyInputs, setCompanyInputs] = useState<{ name: string; ticker: string; cik: string }[]>([]);
  const [personInputs, setPersonInputs] = useState<{ name: string; title: string }[]>([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load owner details when selected
  useEffect(() => {
    if (selectedOwner) {
      setLoadingDetails(true);
      getOwnerDetails(selectedOwner.id)
        .then(setOwnerDetails)
        .finally(() => setLoadingDetails(false));
    } else {
      setOwnerDetails(null);
    }
  }, [selectedOwner, getOwnerDetails]);

  const handleCreateOwner = async () => {
    if (!newOwnerName.trim()) return;
    try {
      const owner = await createOwner(newOwnerName.trim());
      setNewOwnerName('');
      setSelectedOwner(owner);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    }
  };

  const handleDeleteOwner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Revenue Owner?')) return;
    try {
      await deleteOwner(id);
      if (selectedOwner?.id === id) {
        setSelectedOwner(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Company input handlers
  const addCompanyInputRow = () => {
    setCompanyInputs(prev => [...prev, { name: '', ticker: '', cik: '' }]);
  };

  const updateCompanyInput = (index: number, field: 'name' | 'ticker' | 'cik', value: string) => {
    setCompanyInputs(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeCompanyInputRow = (index: number) => {
    setCompanyInputs(prev => prev.filter((_, i) => i !== index));
  };

  // Person input handlers
  const addPersonInputRow = () => {
    setPersonInputs(prev => [...prev, { name: '', title: '' }]);
  };

  const updatePersonInput = (index: number, field: 'name' | 'title', value: string) => {
    setPersonInputs(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removePersonInputRow = (index: number) => {
    setPersonInputs(prev => prev.filter((_, i) => i !== index));
  };

  // Get valid inputs (with non-empty names)
  const validCompanyInputs = companyInputs.filter(c => c.name.trim());
  const validPersonInputs = personInputs.filter(p => p.name.trim());

  const handleSaveChanges = async () => {
    if (!selectedOwner) return;
    setSaving(true);
    try {
      // Add companies
      for (const company of validCompanyInputs) {
        await addCompanyToOwner(
          selectedOwner.id,
          company.name.trim(),
          company.ticker.trim() || undefined,
          company.cik.trim() || undefined
        );
      }

      // Add people
      for (const person of validPersonInputs) {
        await addPersonToOwner(selectedOwner.id, person.name.trim(), person.title.trim() || undefined);
      }

      // Clear inputs and refresh
      setCompanyInputs([]);
      setPersonInputs([]);
      setShowAddCompany(false);
      setShowAddPerson(false);

      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);

      // Refresh the owners list to update counts
      fetchOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCompany = async (companyId: string) => {
    if (!selectedOwner) return;
    try {
      await removeCompanyFromOwner(selectedOwner.id, companyId);
      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);
      fetchOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove company');
    }
  };

  const handleRemovePerson = async (personId: string) => {
    if (!selectedOwner) return;
    try {
      await removePersonFromOwner(selectedOwner.id, personId);
      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);
      fetchOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove person');
    }
  };

  const handleToggleTag = async (tagId: string) => {
    if (!selectedOwner || !ownerDetails) return;
    const hasTag = ownerDetails.tags?.some(t => t.id === tagId);
    try {
      if (hasTag) {
        await removeTagFromOwner(selectedOwner.id, tagId);
      } else {
        await addTagToOwner(selectedOwner.id, tagId);
      }
      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update tag');
    }
  };

  if (ownersLoading || tagsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl shadow-lg">
                <Settings className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">News Setup</h2>
            </div>
            <p className="text-slate-300 ml-12">
              Configure Revenue Owners and their tracked companies, people, and topics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Owners List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg shadow-sm">
                <Users size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800">Revenue Owners</h3>
              <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs font-bold min-w-[26px] shadow-md shadow-violet-500/30 border border-violet-400/30">
                {owners.length}
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="New owner name..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOwner()}
                />
              </div>
              <button
                onClick={handleCreateOwner}
                disabled={!newOwnerName.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {owners.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="text-slate-400" size={24} />
                </div>
                <p className="text-slate-500 font-medium">No revenue owners yet</p>
                <p className="text-slate-400 text-sm mt-1">Create one to get started</p>
              </div>
            ) : (
              <div className="p-2">
                {owners.map((owner) => (
                  <div
                    key={owner.id}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                      selectedOwner?.id === owner.id
                        ? 'bg-gradient-to-r from-brand-100 to-violet-100 border border-brand-200 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    onClick={() => setSelectedOwner(owner)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                        selectedOwner?.id === owner.id
                          ? 'bg-gradient-to-br from-brand-500 to-violet-500 text-white'
                          : 'bg-gradient-to-br from-brand-100 to-violet-100 text-brand-600'
                      }`}>
                        {owner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`font-semibold ${selectedOwner?.id === owner.id ? 'text-brand-800' : 'text-slate-800'}`}>
                          {owner.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 size={10} />
                            {owner._count?.companies || 0}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            {owner._count?.people || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOwner(owner.id);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className={selectedOwner?.id === owner.id ? 'text-brand-500' : 'text-slate-300'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call Diet Editor */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {!selectedOwner ? (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Briefcase className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Select a Revenue Owner</p>
              <p className="text-slate-400 text-sm mt-1">to edit their Call Diet configuration</p>
            </div>
          ) : loadingDetails ? (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium">Loading configuration...</p>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-violet-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl shadow-md">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      Call Diet for {selectedOwner.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Configure companies, people, and topics to track for news
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Companies Section */}
                <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-sm">
                        <Building2 size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-slate-800">Companies</span>
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-bold min-w-[26px] shadow-md shadow-blue-500/30 border border-blue-400/30">
                        {ownerDetails?.companies?.length || 0}
                      </span>
                    </div>
                    {!showAddCompany && (
                      <button
                        onClick={() => {
                          setShowAddCompany(true);
                          setCompanyInputs([{ name: '', ticker: '', cik: '' }]);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 hover:text-blue-700 font-semibold text-sm rounded-lg border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow transition-all"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>

                  {showAddCompany && (
                    <div className="mb-4 p-4 bg-white rounded-xl border border-blue-100 space-y-3 shadow-sm">
                      {companyInputs.map((input, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={input.name}
                            onChange={(e) => updateCompanyInput(index, 'name', e.target.value)}
                            placeholder="Company name"
                            className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                          />
                          <input
                            type="text"
                            value={input.ticker}
                            onChange={(e) => updateCompanyInput(index, 'ticker', e.target.value)}
                            placeholder="Ticker"
                            className="w-24 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                          />
                          <input
                            type="text"
                            value={input.cik}
                            onChange={(e) => updateCompanyInput(index, 'cik', e.target.value)}
                            placeholder="CIK"
                            className="w-24 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                            title="SEC Central Index Key (10 digits)"
                          />
                          <button
                            onClick={() => removeCompanyInputRow(index)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <button
                          onClick={addCompanyInputRow}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <Plus size={14} />
                          Add another
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCompany(false);
                            setCompanyInputs([]);
                          }}
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {ownerDetails?.companies?.length === 0 && (
                      <div className="w-full py-4 text-center text-sm text-slate-400">
                        No companies added yet
                      </div>
                    )}
                    {ownerDetails?.companies?.map((company) => (
                      <span
                        key={company.id}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30 hover:shadow-xl hover:scale-[1.02] transition-all group"
                      >
                        <Building2 size={14} />
                        {company.name}
                        {(company.ticker || company.cik) && (
                          <span className="text-blue-100 text-xs font-medium">
                            ({[company.ticker, company.cik && `CIK: ${company.cik}`].filter(Boolean).join(' | ')})
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveCompany(company.id)}
                          className="ml-1 text-blue-200 hover:text-white hover:bg-white/20 p-0.5 rounded-full transition-all"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* People Section */}
                <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-sm">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-slate-800">People</span>
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold min-w-[26px] shadow-md shadow-purple-500/30 border border-purple-400/30">
                        {ownerDetails?.people?.length || 0}
                      </span>
                    </div>
                    {!showAddPerson && (
                      <button
                        onClick={() => {
                          setShowAddPerson(true);
                          setPersonInputs([{ name: '', title: '' }]);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-purple-600 hover:text-purple-700 font-semibold text-sm rounded-lg border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow transition-all"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    )}
                  </div>

                  {showAddPerson && (
                    <div className="mb-4 p-4 bg-white rounded-xl border border-purple-100 space-y-3 shadow-sm">
                      {personInputs.map((input, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={input.name}
                            onChange={(e) => updatePersonInput(index, 'name', e.target.value)}
                            placeholder="Person name"
                            className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
                          />
                          <input
                            type="text"
                            value={input.title}
                            onChange={(e) => updatePersonInput(index, 'title', e.target.value)}
                            placeholder="Title"
                            className="w-36 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
                          />
                          <button
                            onClick={() => removePersonInputRow(index)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <button
                          onClick={addPersonInputRow}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          <Plus size={14} />
                          Add another
                        </button>
                        <button
                          onClick={() => {
                            setShowAddPerson(false);
                            setPersonInputs([]);
                          }}
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {ownerDetails?.people?.length === 0 && (
                      <div className="w-full py-4 text-center text-sm text-slate-400">
                        No people added yet
                      </div>
                    )}
                    {ownerDetails?.people?.map((person) => (
                      <span
                        key={person.id}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-purple-500/25 border border-purple-400/30 hover:shadow-xl hover:scale-[1.02] transition-all group"
                      >
                        <User size={14} />
                        {person.name}
                        {person.title && (
                          <span className="text-purple-100 text-xs font-medium">({person.title})</span>
                        )}
                        <button
                          onClick={() => handleRemovePerson(person.id)}
                          className="ml-1 text-purple-200 hover:text-white hover:bg-white/20 p-0.5 rounded-full transition-all"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl p-5 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-sm">
                      <Tag size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800">Topics to Track</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/30 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
                      {ownerDetails?.tags?.length || 0} selected
                    </span>
                  </div>

                  <div className="space-y-4">
                    {['universal', 'pe', 'industrials'].map((category) => {
                      const categoryTags = tags.filter((t) => t.category === category);
                      if (categoryTags.length === 0) return null;
                      return (
                        <div key={category} className="bg-white/60 rounded-xl p-4 border border-emerald-100/50">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                            {category === 'pe' ? 'PE-Specific' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categoryTags.map((tag) => {
                              const isSelected = ownerDetails?.tags?.some((t) => t.id === tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => handleToggleTag(tag.id)}
                                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                  }`}
                                >
                                  {tag.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button */}
                {(validCompanyInputs.length > 0 || validPersonInputs.length > 0) && (
                  <div className="pt-5 border-t border-slate-100">
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="w-full px-5 py-4 bg-gradient-to-r from-brand-500 to-violet-500 text-white rounded-xl hover:from-brand-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-3 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                            {validCompanyInputs.length + validPersonInputs.length} items
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-violet-500/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Users size={14} className="text-white" />
              </div>
              <div className="text-sm font-medium text-white/80">Revenue Owners</div>
            </div>
            <div className="text-3xl font-bold text-white">{owners.length}</div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Tag size={14} className="text-white" />
              </div>
              <div className="text-sm font-medium text-white/80">Available Tags</div>
            </div>
            <div className="text-3xl font-bold text-white">{tags.length}</div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-brand-500/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="text-sm font-medium text-white/80">Ready for News</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {owners.filter((o) => (o._count?.companies || 0) > 0 || (o._count?.people || 0) > 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
