import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Ban,
  UserCheck,
  History,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { StatCard } from '../components/dashboard/StatCard';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Users filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        page: userPage.toString(),
        limit: '10',
      });
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data.users || []);
        setTotalUserPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs?limit=25');
      if (res.data.success) {
        setAuditLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers(), fetchAuditLogs()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, userPage]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        fetchUsers();
        fetchAuditLogs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.put(`/admin/users/${userId}`, { status: nextStatus });
      if (res.data.success) {
        fetchUsers();
        fetchAuditLogs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-ink-muted">Loading platform administrative console...</p>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    ticketsSold: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-brand-beige pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-brand-blue" />
          <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider">
            Superuser Control Panel
          </span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink">
          Planora Administration Platform
        </h1>
        <p className="text-xs sm:text-sm text-brand-ink-muted mt-1">
          System-wide moderation, role permissions, revenue audits, and security telemetry.
        </p>
      </div>

      {/* Platform KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gross Platform Volume"
          value={formatCurrency(summary.totalRevenue)}
          subtitle="All confirmed bookings"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Registered Accounts"
          value={summary.totalUsers}
          subtitle="Attendees & Organizers"
          icon={Users}
          color="yellow"
        />
        <StatCard
          title="Catalog Gatherings"
          value={summary.totalEvents}
          subtitle="Worldwide events"
          icon={Calendar}
          color="ink"
        />
        <StatCard
          title="Tickets Confirmed"
          value={summary.ticketsSold}
          subtitle="Total attendee passes"
          icon={Ticket}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-beige gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-brand-ink-subtle hover:text-brand-ink'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-brand-ink-subtle hover:text-brand-ink'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6 animate-in fade-in duration-150">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search user by name, email, or company..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-beige bg-brand-ivory text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-brand-ink-subtle">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="organizer">Organizers</option>
                <option value="attendee">Attendees</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-beige text-[11px] font-bold text-brand-ink-subtle uppercase tracking-wider">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">City / Org</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/60 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-ivory/50 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-beige"
                        />
                        <div>
                          <span className="font-bold text-sm text-brand-ink block">{u.name}</span>
                          <span className="text-[11px] text-brand-ink-muted">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-brand-beige bg-white text-xs font-bold text-brand-ink"
                      >
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-3.5 text-brand-ink-muted">
                      <div>{u.city || 'Global'}</div>
                      <div className="text-[10px] text-brand-ink-subtle">{u.organization || '—'}</div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.status)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          u.status === 'active'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Pagination */}
          {totalUserPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-brand-beige text-xs">
              <span className="text-brand-ink-subtle">
                Page {userPage} of {totalUserPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserPage(Math.max(1, userPage - 1))}
                  disabled={userPage <= 1}
                  className="p-2 rounded-xl border border-brand-beige bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                  disabled={userPage >= totalUserPages}
                  className="p-2 rounded-xl border border-brand-beige bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Audit Trail Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-brand-beige/60 pb-3">
            <h3 className="font-display font-bold text-lg text-brand-ink">
              System Audit Trail & Security Logs
            </h3>
            <span className="text-xs text-brand-ink-subtle">Immutable Record Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-beige text-[11px] font-bold text-brand-ink-subtle uppercase tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity Type</th>
                  <th className="pb-3">User / Actor</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/60">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-brand-ivory/50">
                    <td className="py-3 text-brand-ink-subtle whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-blue">{log.action}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-brand-beige/40 text-brand-ink font-semibold text-[10px]">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 text-brand-ink font-semibold">
                      {log.userEmail || (log.userId as any)?.email || 'System'}
                    </td>
                    <td className="py-3 text-brand-ink-muted max-w-xs truncate font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
