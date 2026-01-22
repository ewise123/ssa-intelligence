import React, { useEffect, useMemo, useState } from 'react';
import { UserEditModal } from '../components/UserEditModal';

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'MEMBER';
  groups: Array<{ id: string; name: string; slug: string }>;
};

type AdminGroup = {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

const fetchJson = async (path: string, options?: RequestInit) => {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

export const AdminUsers: React.FC<{ isAdmin?: boolean; currentUserId?: string }> = ({ isAdmin, currentUserId }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'MEMBER'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

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

    // Optimistic update - immediate UI response
    setUsers((prev) => prev.map((u) => {
      if (u.id !== user.id) return u;
      return hasGroup
        ? { ...u, groups: u.groups.filter((g) => g.id !== groupId) }
        : { ...u, groups: [...u.groups, group!] };
    }));

    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      return { ...g, memberCount: (g.memberCount ?? 0) + (hasGroup ? -1 : 1) };
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
          ? { ...u, groups: [...u.groups, group!] }
          : { ...u, groups: u.groups.filter((g) => g.id !== groupId) };
      }));
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, memberCount: (g.memberCount ?? 0) + (hasGroup ? 1 : -1) };
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
    await fetchJson(`/admin/users/${userId}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
                  if (confirm(`Delete group "${group.name}"? Members will be removed from this group.`)) {
                    handleDeleteGroup(group.id);
                  }
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
          <h2 className="text-lg font-semibold text-slate-800">Users</h2>
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
                    user.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.role}
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
    </div>
  );
};
