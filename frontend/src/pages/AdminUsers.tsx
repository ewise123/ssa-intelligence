import React, { useEffect, useMemo, useState } from 'react';
import { UserEditModal } from '../components/UserEditModal';
import { UserAddModal } from '../components/UserAddModal';
import { UserCallDietSection } from '../components/UserCallDietSection';
import { applyUserDeletionToGroups } from '../utils/adminUsers';
import { ConfirmDialog } from '../components/ConfirmDialog';

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'MEMBER';
  status?: 'ACTIVE' | 'PENDING';
  groups: Array<{ id: string; name: string; slug: string }>;
};

type AdminGroup = {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
};

type InviteItem = {
  id: string;
  email: string;
  inviteUrl: string | null;
  status: 'active' | 'used' | 'expired';
  used: boolean;
  usedAt?: string | null;
  usedBy?: { email: string; name?: string | null } | null;
  createdBy?: { email: string; name?: string | null } | null;
  expiresAt: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const fetchJson = async (path: string, options?: RequestInit) => {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

export const AdminUsers: React.FC<{ isAdmin?: boolean; isSuperAdmin?: boolean; currentUserId?: string }> = ({ isAdmin, isSuperAdmin, currentUserId }) => {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'default';
  } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'MEMBER'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [expandedCallDietUserId, setExpandedCallDietUserId] = useState<string | null>(null);

  // Invite management state
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [invitesExpanded, setInvitesExpanded] = useState(true);

  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        user.email.toLowerCase().includes(query) ||
        (user.name?.toLowerCase().includes(query) ?? false);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, groupRes] = await Promise.all([
        fetchJson('/admin/users'),
        fetchJson('/admin/groups')
      ]);
      setUsers(userRes.results || []);
      setGroups(groupRes.results || []);

      // Load invites
      try {
        const inviteRes = await fetchJson('/admin/invites');
        setInvites(inviteRes.results || []);
      } catch {
        // Non-critical — invites may not be accessible
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData().catch(() => {});
  }, [isAdmin]);

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    setSavingGroup(true);
    try {
      await fetchJson('/admin/groups', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setNewGroupName('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group.');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setDeletingGroupId(groupId);
    try {
      await fetchJson(`/admin/groups/${groupId}`, { method: 'DELETE' });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setUsers((prev) => prev.map((u) => ({
        ...u,
        groups: u.groups.filter((g) => g.id !== groupId)
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group.');
    } finally {
      setDeletingGroupId(null);
    }
  };

  // Optimistic UI update for membership toggle - prevents scroll reset
  const toggleMembership = async (user: AdminUser, groupId: string) => {
    const hasGroup = user.groups.some((g) => g.id === groupId);
    const group = groupMap.get(groupId);

    // Guard against missing group (race condition protection)
    if (!group) {
      setError('Group not found. Please refresh the page.');
      return;
    }

    // Optimistic update - immediate UI response
    setUsers((prev) => prev.map((u) => {
      if (u.id !== user.id) return u;
      return hasGroup
        ? { ...u, groups: u.groups.filter((g) => g.id !== groupId) }
        : { ...u, groups: [...u.groups, group] };
    }));

    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      const newCount = Math.max(0, (g.memberCount ?? 0) + (hasGroup ? -1 : 1));
      return { ...g, memberCount: newCount };
    }));

    try {
      if (hasGroup) {
        await fetchJson(`/admin/groups/${groupId}/members/${user.id}`, { method: 'DELETE' });
      } else {
        await fetchJson(`/admin/groups/${groupId}/members`, {
          method: 'POST',
          body: JSON.stringify({ userId: user.id })
        });
      }
    } catch (err) {
      // Rollback on error
      setUsers((prev) => prev.map((u) => {
        if (u.id !== user.id) return u;
        return hasGroup
          ? { ...u, groups: [...u.groups, group] }
          : { ...u, groups: u.groups.filter((g) => g.id !== groupId) };
      }));
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        const newCount = Math.max(0, (g.memberCount ?? 0) + (hasGroup ? 1 : -1));
        return { ...g, memberCount: newCount };
      }));
      setError(err instanceof Error ? err.message : 'Failed to update membership.');
    }
  };

  const handleSaveUser = async (userId: string, data: { name?: string; role?: 'ADMIN' | 'MEMBER' }) => {
    const response = await fetchJson(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...response } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    const deletedUser = users.find((user) => user.id === userId);
    try {
      await fetchJson(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (deletedUser) {
        setGroups((prev) => applyUserDeletionToGroups(prev, deletedUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.');
    }
  };

  const handleAddUser = async (data: {
    email: string;
    name?: string;
    role: 'ADMIN' | 'MEMBER';
    groupIds: string[];
  }) => {
    const response = await fetchJson('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setUsers((prev) => [...prev, response]);
    // Update group member counts for groups confirmed by the server
    const responseGroups = Array.isArray(response?.groups) ? response.groups : [];
    const responseGroupIds = new Set(responseGroups.map((group: AdminGroup) => group.id));
    if (responseGroupIds.size > 0) {
      setGroups((prev) => prev.map((g) => {
        if (responseGroupIds.has(g.id)) {
          return { ...g, memberCount: (g.memberCount ?? 0) + 1 };
        }
        return g;
      }));
    }
  };

  const handleCreateInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setCreatingInvite(true);
    setInviteError(null);
    try {
      const result = await fetchJson('/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setInviteEmail('');
      // Refresh invites list
      const inviteRes = await fetchJson('/admin/invites');
      setInvites(inviteRes.results || []);
      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(result.inviteUrl);
        setCopiedInviteId(result.id);
        setTimeout(() => setCopiedInviteId(null), 3000);
      } catch {
        // Clipboard may not be available
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create invite';
      // Try to parse JSON error
      try {
        const parsed = JSON.parse(msg);
        setInviteError(parsed.error || msg);
      } catch {
        setInviteError(msg);
      }
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await fetchJson(`/admin/invites/${inviteId}`, { method: 'DELETE' });
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to revoke invite.');
    }
  };

  const handleCopyInviteUrl = async (invite: InviteItem) => {
    if (!invite.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopiedInviteId(invite.id);
      setTimeout(() => setCopiedInviteId(null), 3000);
    } catch {
      // Clipboard may not be available
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
        Admin access required.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
        Loading users and groups...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Management Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Invite Users</h2>
        {inviteError && <div className="text-sm text-rose-600 mb-3">{inviteError}</div>}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateInvite(); }}
          />
          <button
            onClick={handleCreateInvite}
            disabled={creatingInvite || !inviteEmail.trim()}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60"
          >
            {creatingInvite ? 'Creating...' : 'Generate Invite Link'}
          </button>
        </div>

        {invites.length > 0 && (
          <div>
            <button
              onClick={() => setInvitesExpanded((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${invitesExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Recent Invites
              <span className="text-xs text-slate-400">({invites.length})</span>
            </button>
            {invitesExpanded && (
              <div className="space-y-2 mt-3">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className={`border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                      invite.status === 'used' ? 'border-emerald-200 bg-emerald-50/50' :
                      invite.status === 'expired' ? 'border-slate-200 bg-slate-50 opacity-60' :
                      'border-brand-200 bg-brand-50/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 text-sm truncate">{invite.email}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {invite.status === 'used' && invite.usedAt && (
                          <span className="text-emerald-600">Used {new Date(invite.usedAt).toLocaleDateString()}</span>
                        )}
                        {invite.status === 'expired' && (
                          <span className="text-slate-400">Expired {new Date(invite.expiresAt).toLocaleDateString()}</span>
                        )}
                        {invite.status === 'active' && (
                          <span className="text-brand-600">Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded font-medium ${
                        invite.status === 'used' ? 'bg-emerald-100 text-emerald-700' :
                        invite.status === 'expired' ? 'bg-slate-100 text-slate-500' :
                        'bg-brand-100 text-brand-700'
                      }`}>
                        {invite.status}
                      </span>
                      {invite.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleCopyInviteUrl(invite)}
                            className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                            title="Copy invite URL"
                          >
                            {copiedInviteId === invite.id ? 'Copied!' : 'Copy Link'}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmState({
                                open: true,
                                title: 'Revoke Invite',
                                message: `Revoke the invite for ${invite.email}? This cannot be undone.`,
                                variant: 'danger',
                                onConfirm: () => {
                                  setConfirmState(null);
                                  handleRevokeInvite(invite.id);
                                }
                              });
                            }}
                            className="text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Revoke invite"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Groups</h2>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Create new group..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            onClick={handleCreateGroup}
            disabled={savingGroup}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60"
          >
            {savingGroup ? 'Saving...' : 'Add Group'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((group) => (
            <div key={group.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-start">
              <div>
                <div className="font-semibold text-slate-800">{group.name}</div>
                <div className="text-xs text-slate-400">{group.slug}</div>
                <div className="text-xs text-slate-500 mt-1">{group.memberCount ?? 0} members</div>
              </div>
              <button
                onClick={() => {
                  setConfirmState({
                    open: true,
                    title: 'Delete Group',
                    message: `Delete group "${group.name}"? Members will be removed from this group.`,
                    variant: 'danger',
                    onConfirm: () => {
                      setConfirmState(null);
                      handleDeleteGroup(group.id);
                    },
                  });
                }}
                disabled={deletingGroupId === group.id}
                className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-50"
                title="Delete group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="text-sm text-slate-500">No groups created yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Users</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-3 py-1.5 text-sm bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm min-w-[200px]"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'ADMIN' | 'MEMBER')}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>
        </div>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{user.name || user.email}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                    user.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : user.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.status === 'PENDING' ? 'PENDING' : user.role}
                  </span>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-slate-400 hover:text-brand-600 p-1"
                    title="Edit user"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-400 mb-2">Group Memberships</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groups.map((group) => {
                    const checked = user.groups.some((g) => g.id === group.id);
                    return (
                      <label key={group.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMembership(user, group.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        {group.name}
                      </label>
                    );
                  })}
                </div>
                {groups.length === 0 && (
                  <div className="text-xs text-slate-400">Create a group to assign memberships.</div>
                )}
              </div>
              {/* Call Diet Toggle */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setExpandedCallDietUserId(expandedCallDietUserId === user.id ? null : user.id)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  {expandedCallDietUserId === user.id ? 'Hide Call Diet' : 'Manage Call Diet'}
                </button>
                {expandedCallDietUserId === user.id && (
                  <div className="mt-3">
                    <UserCallDietSection userId={user.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-sm text-slate-500 text-center py-4">
              No users match your search criteria.
            </div>
          )}
          {users.length === 0 && (
            <div className="text-sm text-slate-500">No users found yet.</div>
          )}
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          currentUserId={currentUserId || ''}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
        />
      )}

      {showAddUser && (
        <UserAddModal
          groups={groups}
          onClose={() => setShowAddUser(false)}
          onSave={handleAddUser}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
};
