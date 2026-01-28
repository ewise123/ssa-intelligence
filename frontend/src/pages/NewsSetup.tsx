/**
 * News Setup Page
 * Manage Revenue Owners, their Call Diets, and Tags
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Building2, User, Tag, ChevronRight, ChevronDown, Loader2, Save, Settings, Users, Briefcase, Sparkles, Mail } from 'lucide-react';
import {
  useRevenueOwners,
  useNewsTags,
  useTrackedCompanies,
  RevenueOwner,
  NewsTag,
  TrackedCompany,
  TrackedPerson,
} from '../services/newsManager';
import { resolveCompanyApi, CompanySuggestion } from '../services/researchManager';
import { CompanyResolveModal } from '../components/CompanyResolveModal';

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
    updateOwner,
    deleteOwner,
    addCompanyToOwner,
    removeCompanyFromOwner,
    bulkRemoveCompaniesFromOwner,
    addPersonToOwner,
    removePersonFromOwner,
    bulkRemovePeopleFromOwner,
    addTagToOwner,
    removeTagFromOwner,
  } = useRevenueOwners();

  const { tags, loading: tagsLoading } = useNewsTags();
  const { companies: allCompanies } = useTrackedCompanies();

  const [selectedOwner, setSelectedOwner] = useState<RevenueOwner | null>(null);
  const [ownerDetails, setOwnerDetails] = useState<RevenueOwner | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [newOwnerName, setNewOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [companyInputs, setCompanyInputs] = useState<{ name: string }[]>([]);
  const [personInputs, setPersonInputs] = useState<{ name: string; companyId: string }[]>([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Collapse states (collapsed by default)
  const [companiesExpanded, setCompaniesExpanded] = useState(false);
  const [peopleExpanded, setPeopleExpanded] = useState(false);
  const [topicsExpanded, setTopicsExpanded] = useState(false);

  // Sort states
  const [companySortAsc, setCompanySortAsc] = useState(true);
  const [peopleSortColumn, setPeopleSortColumn] = useState<'name' | 'company'>('name');
  const [peopleSortAsc, setPeopleSortAsc] = useState(true);
  const [topicsSortColumn, setTopicsSortColumn] = useState<'name' | 'category'>('name');
  const [topicsSortAsc, setTopicsSortAsc] = useState(true);

  // Company resolution state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveInput, setResolveInput] = useState('');
  const [resolveIndex, setResolveIndex] = useState<number>(0);
  const [resolveSuggestions, setResolveSuggestions] = useState<CompanySuggestion[]>([]);
  const [resolveStatus, setResolveStatus] = useState<'corrected' | 'ambiguous'>('corrected');
  const [resolving, setResolving] = useState(false);

  // Bulk selection state
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Load owner details when selected
  useEffect(() => {
    if (selectedOwner) {
      setLoadingDetails(true);
      // Collapse all sections and clear selections when switching owners
      setCompaniesExpanded(false);
      setPeopleExpanded(false);
      setTopicsExpanded(false);
      setSelectedCompanyIds(new Set());
      setSelectedPeopleIds(new Set());
      getOwnerDetails(selectedOwner.id)
        .then((details) => {
          setOwnerDetails(details);
          setOwnerEmail(details.email || '');
        })
        .finally(() => setLoadingDetails(false));
    } else {
      setOwnerDetails(null);
      setOwnerEmail('');
      setSelectedCompanyIds(new Set());
      setSelectedPeopleIds(new Set());
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

  const handleSaveEmail = async () => {
    if (!selectedOwner) return;
    setSavingEmail(true);
    try {
      await updateOwner(selectedOwner.id, { email: ownerEmail.trim() || null });
      // Update local state
      if (ownerDetails) {
        setOwnerDetails({ ...ownerDetails, email: ownerEmail.trim() || null });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save email');
    } finally {
      setSavingEmail(false);
    }
  };

  // Company input handlers
  const addCompanyInputRow = () => {
    setCompanyInputs(prev => [...prev, { name: '' }]);
  };

  const updateCompanyInput = (index: number, field: 'name', value: string) => {
    setCompanyInputs(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeCompanyInputRow = (index: number) => {
    setCompanyInputs(prev => prev.filter((_, i) => i !== index));
  };

  // Person input handlers
  const addPersonInputRow = () => {
    setPersonInputs(prev => [...prev, { name: '', companyId: '' }]);
  };

  const updatePersonInput = (index: number, field: 'name' | 'companyId', value: string) => {
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

  // Company resolution - resolve a single company name
  const resolveCompanyName = async (name: string, index: number): Promise<string | null> => {
    try {
      const result = await resolveCompanyApi(name.trim());

      if (result.status === 'exact') {
        // Exact match - use the canonical name
        return result.suggestions[0]?.canonicalName || name;
      } else if (result.status === 'corrected' || result.status === 'ambiguous') {
        // Show modal for user to confirm
        setResolveInput(name);
        setResolveIndex(index);
        setResolveSuggestions(result.suggestions);
        setResolveStatus(result.status);
        setResolveModalOpen(true);
        return null; // Will be handled by modal
      } else {
        // Unknown - use as entered
        return name;
      }
    } catch (err) {
      console.error('Failed to resolve company:', err);
      return name; // Use as entered on error
    }
  };

  // Handle modal confirmation
  const handleResolveConfirm = (selectedName: string) => {
    setCompanyInputs(prev => prev.map((item, i) =>
      i === resolveIndex ? { ...item, name: selectedName } : item
    ));
    setResolveModalOpen(false);
    // Continue saving after resolution
    continueAfterResolve(resolveIndex + 1);
  };

  // Handle modal cancel
  const handleResolveCancel = () => {
    setResolveModalOpen(false);
    setResolving(false);
    setSaving(false);
  };

  // Continue resolving remaining companies
  const continueAfterResolve = async (startIndex: number) => {
    for (let i = startIndex; i < validCompanyInputs.length; i++) {
      const company = validCompanyInputs[i];
      const resolved = await resolveCompanyName(company.name, i);
      if (resolved === null) {
        // Modal opened, will continue after user confirms
        return;
      }
      // Update the company name with resolved name
      setCompanyInputs(prev => prev.map((item, idx) =>
        idx === i ? { ...item, name: resolved } : item
      ));
    }
    // All companies resolved, proceed to save
    setResolving(false);
    await doSaveChanges();
  };

  // Actual save logic (called after all companies are resolved)
  const doSaveChanges = async () => {
    if (!selectedOwner) return;
    try {
      // Add companies (use current companyInputs which have resolved names)
      const currentValidCompanies = companyInputs.filter(c => c.name.trim());
      for (const company of currentValidCompanies) {
        await addCompanyToOwner(
          selectedOwner.id,
          company.name.trim()
        );
      }

      // Add people
      for (const person of validPersonInputs) {
        // Get company name from companyId for companyAffiliation
        const selectedCompany = allCompanies.find(c => c.id === person.companyId);
        const companyName = selectedCompany?.name || undefined;
        await addPersonToOwner(selectedOwner.id, person.name.trim(), companyName);
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

  const handleSaveChanges = async () => {
    if (!selectedOwner) return;
    setSaving(true);
    setResolving(true);

    // Start resolving companies from index 0
    await continueAfterResolve(0);
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

  // Toggle company selection
  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // Toggle all companies selection
  const toggleAllCompanies = () => {
    if (!ownerDetails?.companies) return;
    if (selectedCompanyIds.size === ownerDetails.companies.length) {
      setSelectedCompanyIds(new Set());
    } else {
      setSelectedCompanyIds(new Set(ownerDetails.companies.map(c => c.id)));
    }
  };

  // Toggle person selection
  const togglePersonSelection = (personId: string) => {
    setSelectedPeopleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  // Toggle all people selection
  const toggleAllPeople = () => {
    if (!ownerDetails?.people) return;
    if (selectedPeopleIds.size === ownerDetails.people.length) {
      setSelectedPeopleIds(new Set());
    } else {
      setSelectedPeopleIds(new Set(ownerDetails.people.map(p => p.id)));
    }
  };

  // Bulk delete companies
  const handleBulkDeleteCompanies = async () => {
    if (!selectedOwner || selectedCompanyIds.size === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedCompanyIds.size} company(ies)?`)) return;

    setBulkDeleting(true);
    try {
      await bulkRemoveCompaniesFromOwner(selectedOwner.id, Array.from(selectedCompanyIds));
      setSelectedCompanyIds(new Set());
      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);
      fetchOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete companies');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Bulk delete people
  const handleBulkDeletePeople = async () => {
    if (!selectedOwner || selectedPeopleIds.size === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedPeopleIds.size} person(s)?`)) return;

    setBulkDeleting(true);
    try {
      await bulkRemovePeopleFromOwner(selectedOwner.id, Array.from(selectedPeopleIds));
      setSelectedPeopleIds(new Set());
      const updated = await getOwnerDetails(selectedOwner.id);
      setOwnerDetails(updated);
      fetchOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete people');
    } finally {
      setBulkDeleting(false);
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
                <div className="flex items-center gap-3 mb-4">
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

                {/* Email field */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="Email address for news delivery..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveEmail}
                    disabled={savingEmail || ownerEmail === (ownerDetails?.email || '')}
                    className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2"
                  >
                    {savingEmail ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Companies Section */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 overflow-hidden">
                  <button
                    onClick={() => setCompaniesExpanded(!companiesExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-md shadow-blue-500/20">
                        <Building2 size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-slate-800">Companies</span>
                      <span className="text-sm text-slate-500">({ownerDetails?.companies?.length || 0})</span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${companiesExpanded ? '' : '-rotate-90'}`} />
                  </button>

                  {companiesExpanded && (
                    <div className="px-5 pb-5">
                      {!showAddCompany && (
                        <button
                          onClick={() => {
                            setShowAddCompany(true);
                            setCompanyInputs([{ name: '' }]);
                          }}
                          className="mb-4 flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white text-blue-600 font-medium text-sm rounded-lg border border-blue-200 hover:border-blue-300 transition-all shadow-sm"
                        >
                          <Plus size={14} />
                          Add Company
                        </button>
                      )}

                      {showAddCompany && (
                        <div className="mb-4 p-4 bg-white/80 rounded-xl border border-blue-100 space-y-3">
                          {companyInputs.map((input, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={input.name}
                                onChange={(e) => updateCompanyInput(index, 'name', e.target.value)}
                                placeholder="Company name"
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                              />
                              <button
                                onClick={() => removeCompanyInputRow(index)}
                                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2">
                            <button
                              onClick={addCompanyInputRow}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
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

                      {ownerDetails?.companies?.length === 0 && !showAddCompany ? (
                        <p className="text-sm text-slate-500 italic">No companies added yet</p>
                      ) : (ownerDetails?.companies?.length || 0) > 0 && (
                        <div className="bg-white/80 rounded-xl border border-blue-100 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-blue-100">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={toggleAllCompanies}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  selectedCompanyIds.size === ownerDetails?.companies?.length && selectedCompanyIds.size > 0
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500'
                                    : selectedCompanyIds.size > 0
                                    ? 'bg-blue-200 border-blue-400'
                                    : 'border-slate-300 hover:border-blue-400'
                                }`}
                              >
                                {selectedCompanyIds.size === ownerDetails?.companies?.length && selectedCompanyIds.size > 0 && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {selectedCompanyIds.size > 0 && selectedCompanyIds.size < (ownerDetails?.companies?.length || 0) && (
                                  <div className="w-2 h-0.5 bg-blue-600 rounded"></div>
                                )}
                              </button>
                              <button
                                onClick={() => setCompanySortAsc(!companySortAsc)}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                              >
                                Name
                                <ChevronDown size={14} className={`transition-transform ${companySortAsc ? '' : 'rotate-180'}`} />
                              </button>
                            </div>
                            {selectedCompanyIds.size > 0 && (
                              <button
                                onClick={handleBulkDeleteCompanies}
                                disabled={bulkDeleting}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                              >
                                <Trash2 size={12} />
                                Delete ({selectedCompanyIds.size})
                              </button>
                            )}
                          </div>
                          <div className="divide-y divide-blue-50">
                            {[...(ownerDetails?.companies || [])].sort((a, b) =>
                              companySortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
                            ).map((company) => (
                              <div
                                key={company.id}
                                className={`flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/50 transition-colors ${
                                  selectedCompanyIds.has(company.id) ? 'bg-blue-50/80' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleCompanySelection(company.id)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      selectedCompanyIds.has(company.id)
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500'
                                        : 'border-slate-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {selectedCompanyIds.has(company.id) && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                  <span className="text-slate-700 font-medium">{company.name}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveCompany(company.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* People Section */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 overflow-hidden">
                  <button
                    onClick={() => setPeopleExpanded(!peopleExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-pink-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-md shadow-pink-500/20">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-slate-800">People</span>
                      <span className="text-sm text-slate-500">({ownerDetails?.people?.length || 0})</span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${peopleExpanded ? '' : '-rotate-90'}`} />
                  </button>

                  {peopleExpanded && (
                    <div className="px-5 pb-5">
                      {!showAddPerson && (
                        <button
                          onClick={() => {
                            setShowAddPerson(true);
                            setPersonInputs([{ name: '', companyId: '' }]);
                          }}
                          className="mb-4 flex items-center gap-1 px-3 py-1.5 bg-white/80 hover:bg-white text-pink-600 font-medium text-sm rounded-lg border border-pink-200 hover:border-pink-300 transition-all shadow-sm"
                        >
                          <Plus size={14} />
                          Add Person
                        </button>
                      )}

                      {showAddPerson && (
                        <div className="mb-4 p-4 bg-white/80 rounded-xl border border-pink-100 space-y-3">
                          {personInputs.map((input, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={input.name}
                                onChange={(e) => updatePersonInput(index, 'name', e.target.value)}
                                placeholder="Person name"
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all"
                              />
                              <select
                                value={input.companyId}
                                onChange={(e) => updatePersonInput(index, 'companyId', e.target.value)}
                                className="w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all cursor-pointer"
                              >
                                <option value="">Select company...</option>
                                {allCompanies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removePersonInputRow(index)}
                                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2">
                            <button
                              onClick={addPersonInputRow}
                              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
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

                      {ownerDetails?.people?.length === 0 && !showAddPerson ? (
                        <p className="text-sm text-slate-500 italic">No people added yet</p>
                      ) : (ownerDetails?.people?.length || 0) > 0 && (
                        <div className="bg-white/80 rounded-xl border border-pink-100 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-pink-50/50 border-b border-pink-100">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={toggleAllPeople}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  selectedPeopleIds.size === ownerDetails?.people?.length && selectedPeopleIds.size > 0
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-500'
                                    : selectedPeopleIds.size > 0
                                    ? 'bg-pink-200 border-pink-400'
                                    : 'border-slate-300 hover:border-pink-400'
                                }`}
                              >
                                {selectedPeopleIds.size === ownerDetails?.people?.length && selectedPeopleIds.size > 0 && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {selectedPeopleIds.size > 0 && selectedPeopleIds.size < (ownerDetails?.people?.length || 0) && (
                                  <div className="w-2 h-0.5 bg-pink-600 rounded"></div>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (peopleSortColumn === 'name') {
                                    setPeopleSortAsc(!peopleSortAsc);
                                  } else {
                                    setPeopleSortColumn('name');
                                    setPeopleSortAsc(true);
                                  }
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                              >
                                Name
                                {peopleSortColumn === 'name' && (
                                  <ChevronDown size={14} className={`transition-transform ${peopleSortAsc ? '' : 'rotate-180'}`} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (peopleSortColumn === 'company') {
                                    setPeopleSortAsc(!peopleSortAsc);
                                  } else {
                                    setPeopleSortColumn('company');
                                    setPeopleSortAsc(true);
                                  }
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors ml-auto"
                              >
                                Company
                                {peopleSortColumn === 'company' && (
                                  <ChevronDown size={14} className={`transition-transform ${peopleSortAsc ? '' : 'rotate-180'}`} />
                                )}
                              </button>
                            </div>
                            {selectedPeopleIds.size > 0 && (
                              <button
                                onClick={handleBulkDeletePeople}
                                disabled={bulkDeleting}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50 ml-3"
                              >
                                <Trash2 size={12} />
                                Delete ({selectedPeopleIds.size})
                              </button>
                            )}
                          </div>
                          <div className="divide-y divide-pink-50">
                            {[...(ownerDetails?.people || [])].sort((a, b) => {
                              const aVal = peopleSortColumn === 'name' ? a.name : (a.companyAffiliation || '');
                              const bVal = peopleSortColumn === 'name' ? b.name : (b.companyAffiliation || '');
                              return peopleSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                            }).map((person) => (
                              <div
                                key={person.id}
                                className={`grid grid-cols-[auto,1fr,1fr,40px] items-center gap-3 px-4 py-2.5 hover:bg-pink-50/50 transition-colors ${
                                  selectedPeopleIds.has(person.id) ? 'bg-pink-50/80' : ''
                                }`}
                              >
                                <button
                                  onClick={() => togglePersonSelection(person.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    selectedPeopleIds.has(person.id)
                                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-500'
                                      : 'border-slate-300 hover:border-pink-400'
                                  }`}
                                >
                                  {selectedPeopleIds.has(person.id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <span className="text-slate-700 font-medium">{person.name}</span>
                                <span className="text-slate-500 text-sm">{person.companyAffiliation || '—'}</span>
                                <button
                                  onClick={() => handleRemovePerson(person.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all justify-self-end"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 overflow-hidden">
                  <button
                    onClick={() => setTopicsExpanded(!topicsExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-green-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md shadow-green-500/20">
                        <Tag size={16} className="text-white" />
                      </div>
                      <span className="font-bold text-slate-800">Topics to Track</span>
                      <span className="text-sm text-slate-500">({ownerDetails?.tags?.length || 0} selected)</span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${topicsExpanded ? '' : '-rotate-90'}`} />
                  </button>

                  {topicsExpanded && (
                    <div className="px-5 pb-5">
                      {tags.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No topics available</p>
                      ) : (
                        <div className="bg-white/80 rounded-xl border border-green-100 overflow-hidden">
                          <div className="grid grid-cols-[1fr,auto,40px] px-4 py-2 bg-green-50/50 border-b border-green-100">
                            <button
                              onClick={() => {
                                if (topicsSortColumn === 'name') {
                                  setTopicsSortAsc(!topicsSortAsc);
                                } else {
                                  setTopicsSortColumn('name');
                                  setTopicsSortAsc(true);
                                }
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Topic
                              {topicsSortColumn === 'name' && (
                                <ChevronDown size={14} className={`transition-transform ${topicsSortAsc ? '' : 'rotate-180'}`} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (topicsSortColumn === 'category') {
                                  setTopicsSortAsc(!topicsSortAsc);
                                } else {
                                  setTopicsSortColumn('category');
                                  setTopicsSortAsc(true);
                                }
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                            >
                              Category
                              {topicsSortColumn === 'category' && (
                                <ChevronDown size={14} className={`transition-transform ${topicsSortAsc ? '' : 'rotate-180'}`} />
                              )}
                            </button>
                            <span></span>
                          </div>
                          <div className="divide-y divide-green-50">
                            {[...tags].sort((a, b) => {
                              const aVal = topicsSortColumn === 'name' ? a.name : a.category;
                              const bVal = topicsSortColumn === 'name' ? b.name : b.category;
                              return topicsSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                            }).map((tag) => {
                              const isSelected = ownerDetails?.tags?.some((t) => t.id === tag.id);
                              return (
                                <div
                                  key={tag.id}
                                  className="grid grid-cols-[1fr,auto,40px] items-center px-4 py-2.5 hover:bg-green-50/50 transition-colors cursor-pointer"
                                  onClick={() => handleToggleTag(tag.id)}
                                >
                                  <span className="text-slate-700 font-medium">{tag.name}</span>
                                  <span className="text-slate-500 text-sm px-2 py-0.5 bg-slate-100 rounded text-xs">
                                    {tag.category === 'pe' ? 'PE-Specific' : tag.category.charAt(0).toUpperCase() + tag.category.slice(1)}
                                  </span>
                                  <div className="justify-self-end">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                                        : 'border-slate-300 hover:border-green-400'
                                    }`}>
                                      {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                          {resolving ? 'Validating companies...' : 'Saving...'}
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

      {/* Company Resolve Modal */}
      <CompanyResolveModal
        isOpen={resolveModalOpen}
        input={resolveInput}
        suggestions={resolveSuggestions}
        status={resolveStatus}
        onConfirm={handleResolveConfirm}
        onCancel={handleResolveCancel}
      />
    </div>
  );
};
