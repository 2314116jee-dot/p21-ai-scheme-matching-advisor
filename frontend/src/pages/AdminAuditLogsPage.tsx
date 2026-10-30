import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { AuditLogItem } from '../types';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { Activity, ArrowLeft, RefreshCw, Filter, ShieldCheck } from 'lucide-react';
import {
  MOTION_SPRINGS,
  staggerItemVariants,
} from '../styles/motion';

export const AdminAuditLogsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AuditLogItem[]>('/api/admin/audit-logs?limit=100');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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

        {/* Header */}
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
                Cryptographic Accountability Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              System Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Immutable log of user registrations, status updates, scheme verifications, and security events.
            </p>
          </div>

          <TactileButton
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={fetchLogs}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Events</span>
          </TactileButton>
        </motion.div>

        {/* Audit Table */}
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
                Retrieving audit events from database...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 font-hud-mono">
              No audit records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-hud-mono uppercase tracking-hud text-[11px]">
                    <th className="p-3.5 font-bold">Timestamp (UTC)</th>
                    <th className="p-3.5 font-bold">Action Event</th>
                    <th className="p-3.5 font-bold">Resource</th>
                    <th className="p-3.5 font-bold">Initiated By</th>
                    <th className="p-3.5 font-bold">IP Address</th>
                    <th className="p-3.5 font-bold">Payload / Audit Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5 font-hud-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 font-hud-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 border border-stone-200 inline-block">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        <span className="font-semibold text-slate-800">{log.resource_type}</span>
                        {log.resource_id && <span className="text-stone-400 ml-1 font-hud-mono">#{log.resource_id}</span>}
                      </td>
                      <td className="p-3.5 text-stone-700">
                        {log.user_email ? (
                          <span className="font-medium text-slate-900 font-hud-mono">{log.user_email}</span>
                        ) : log.user_id ? (
                          <span className="text-stone-500 font-hud-mono">User #{log.user_id}</span>
                        ) : (
                          <span className="text-stone-400 italic">System</span>
                        )}
                      </td>
                      <td className="p-3.5 font-hud-mono text-[11px] text-stone-500">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="p-3.5">
                        {log.details ? (
                          <pre className="text-[10px] bg-stone-100 p-1.5 rounded max-w-xs overflow-x-auto font-hud-mono text-stone-700 border border-stone-200">
                            {JSON.stringify(log.details)}
                          </pre>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};
