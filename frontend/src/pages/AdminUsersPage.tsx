import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { AdminUserItem } from '../types';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  modalDialogVariants,
  staggerItemVariants,
} from '../styles/motion';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for user status toggle
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [reason, setReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
      const data = await apiRequest<AdminUserItem[]>(`/api/admin/users${q}`);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const openStatusModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setReason('');
    setModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser || !reason.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: !selectedUser.is_active,
          reason: reason.trim(),
        }),
      });
      setModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <motion.div initial="initial" animate="animate" variants={staggerItemVariants}>
          <Link
            to="/admin"
            className="text-xs font-semibold text-stone-600 hover:text-slate-900 inline-flex items-center group transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5"
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-hud font-hud-mono">
                Governance & Access Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Inspect registered entrepreneur accounts, role assignments, and governance statuses.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerItemVariants}
          className="bg-white rounded-lg border border-stone-300 shadow-xs overflow-hidden"
        >
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-hud-mono tracking-hud uppercase">
                Querying user records...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 font-hud-mono">
              No registered users found matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-hud-mono uppercase tracking-hud text-[11px]">
                    <th className="p-3.5 font-bold">User Details</th>
                    <th className="p-3.5 font-bold">Contact</th>
                    <th className="p-3.5 font-bold">Roles</th>
                    <th className="p-3.5 font-bold">Profile Status</th>
                    <th className="p-3.5 font-bold">Account Status</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{u.full_name}</span>
                        <span className="text-[11px] text-stone-500 font-mono block font-hud-mono">{u.email}</span>
                      </td>
                      <td className="p-3.5 text-stone-600 font-hud-mono">
                        {u.mobile_number || 'None'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold font-hud-mono ${
                                r === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {u.has_profile ? (
                          <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px] font-hud-mono">
                            Configured
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px] font-hud-mono">Pending</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-hud-mono">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 font-hud-mono">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <TactileButton
                          size="sm"
                          variant={u.is_active ? 'secondary' : 'accent'}
                          onClick={() => openStatusModal(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </TactileButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {modalOpen && selectedUser && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={modalDialogVariants}
                className="bg-white rounded-lg border border-stone-300 p-6 max-w-md w-full shadow-lg text-left space-y-4"
              >
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-stone-100 pb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Confirm Status Transition</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  You are about to <strong className="text-slate-900">{selectedUser.is_active ? 'deactivate' : 'activate'}</strong> the account for{' '}
                  <strong className="text-slate-900">{selectedUser.full_name}</strong> ({selectedUser.email}).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Reason for Action <span className="text-rose-600">* (Logged in Audit Trail)</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Specify the regulatory or verification reason..."
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors leading-relaxed"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <TactileButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </TactileButton>
                  <TactileButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={submitting || !reason.trim()}
                    loading={submitting}
                    onClick={handleConfirmStatusChange}
                  >
                    Confirm & Save Audit Event
                  </TactileButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
