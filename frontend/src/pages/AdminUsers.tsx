import React, { useEffect, useMemo, useState } from 'react';

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

export const AdminUsers: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);

  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

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

  const toggleMembership = async (user: AdminUser, groupId: string) => {
    const hasGroup = user.groups.some((g) => g.id === groupId);
    try {
      if (hasGroup) {
        await fetchJson(`/admin/groups/${groupId}/members/${user.id}`, {
          method: 'DELETE'
        });
      } else {
        await fetchJson(`/admin/groups/${groupId}/members`, {
          method: 'POST',
          body: JSON.stringify({ userId: user.id })
        });
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update membership.');
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
            <div key={group.id} className="border border-slate-200 rounded-lg p-3">
              <div className="font-semibold text-slate-800">{group.name}</div>
              <div className="text-xs text-slate-400">{group.slug}</div>
              <div className="text-xs text-slate-500 mt-1">{group.memberCount ?? 0} members</div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="text-sm text-slate-500">No groups created yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Users</h2>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">{user.name || user.email}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <span className="text-xs uppercase tracking-wider text-slate-500">{user.role}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-400 mb-2">Group Memberships</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groups.map((group) => {
                    const checked = user.groups.some((g) => g.id === group.id);
                    return (
                      <label key={group.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMembership(user, group.id)}
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
          {users.length === 0 && (
            <div className="text-sm text-slate-500">No users found yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
