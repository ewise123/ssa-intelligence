import React, { useState, useEffect } from 'react';

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'MEMBER';
  groups: Array<{ id: string; name: string; slug: string }>;
};

type UserEditModalProps = {
  user: AdminUser;
  currentUserId: string;
  onClose: () => void;
  onSave: (userId: string, data: { name?: string; role?: 'ADMIN' | 'MEMBER' }) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
};

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  currentUserId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(user.role);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSelf = user.id === currentUserId;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const updates: { name?: string; role?: 'ADMIN' | 'MEMBER' } = {};
      if (name !== (user.name || '')) updates.name = name;
      if (role !== user.role) updates.role = role;

      if (Object.keys(updates).length > 0) {
        await onSave(user.id, updates);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Edit User</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              maxLength={100}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
              disabled={isSelf && user.role === 'ADMIN'}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            {isSelf && user.role === 'ADMIN' && (
              <p className="text-xs text-slate-500 mt-1">You cannot demote yourself from admin</p>
            )}
          </div>

          <div className="text-xs text-slate-500">
            <span className="font-medium">Groups:</span>{' '}
            {user.groups.length > 0 ? user.groups.map((g) => g.name).join(', ') : 'None'}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSelf || saving}
                className="px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete User
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full">
              <p className="text-sm text-slate-700 mb-3">
                Are you sure you want to delete <strong>{user.name || user.email}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

        {isSelf && !showDeleteConfirm && (
          <p className="text-xs text-slate-500 mt-2 text-center">You cannot delete your own account</p>
        )}
      </div>
    </div>
  );
};
