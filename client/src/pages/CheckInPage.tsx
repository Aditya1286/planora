import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Ticket,
  Search,
  ArrowLeft,
  Users,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';

export const CheckInPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalTickets: number;
    checkedIn: number;
    pending: number;
    checkInRate: number;
  } | null>(null);

  const [verifiedBooking, setVerifiedBooking] = useState<any | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    data?: any;
  } | null>(null);

  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  const fetchStats = async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/check-in/stats/${eventId}`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setCheckInResult(null);
    setVerifiedBooking(null);

    try {
      const res = await api.post('/check-in/verify', { code: code.trim() });
      if (res.data.success) {
        setVerifiedBooking(res.data.data);
      }
    } catch (err: any) {
      setCheckInResult({
        success: false,
        message: err.response?.data?.message || 'Invalid booking reference or QR code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      const res = await api.post('/check-in/check-in', { code: code.trim() });
      if (res.data.success) {
        setCheckInResult({
          success: true,
          message: 'Attendee successfully checked in! Access granted.',
          data: res.data.data,
        });
        setRecentCheckIns((prev) => [res.data.data, ...prev.slice(0, 9)]);
        setVerifiedBooking(res.data.data);
        fetchStats();
      }
    } catch (err: any) {
      setCheckInResult({
        success: false,
        alreadyCheckedIn: err.response?.data?.alreadyCheckedIn,
        message: err.response?.data?.message || 'Error executing check-in',
        data: err.response?.data?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setCode('');
    setVerifiedBooking(null);
    setCheckInResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige pb-6">
        <div>
          <Link
            to="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink-subtle hover:text-brand-blue mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Organizer Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-brand-blue" />
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-ink">
              Live Check-In Station
            </h1>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="p-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink text-xs font-bold hover:bg-brand-beige flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Counts</span>
        </button>
      </div>

      {/* Live Check-In Statistics Bar */}
      {stats && (
        <div className="bg-white rounded-3xl border border-brand-beige p-6 shadow-brand space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-beige/60">
              <span className="text-[10px] font-bold text-brand-ink-subtle uppercase">
                Total Registrations
              </span>
              <span className="font-display font-extrabold text-2xl text-brand-ink block mt-0.5">
                {stats.totalTickets}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                Checked In
              </span>
              <span className="font-display font-extrabold text-2xl text-emerald-800 block mt-0.5">
                {stats.checkedIn}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase">
                Pending Arrival
              </span>
              <span className="font-display font-extrabold text-2xl text-amber-800 block mt-0.5">
                {stats.pending}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
              <span className="text-[10px] font-bold text-brand-blue uppercase">
                Attendance Rate
              </span>
              <span className="font-display font-extrabold text-2xl text-brand-blue block mt-0.5">
                {stats.checkInRate}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-brand-beige/50 h-3 rounded-full overflow-hidden">
            <div
              className="bg-brand-blue h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.checkInRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Scanner / Verification Form */}
      <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
        <h3 className="font-display font-bold text-xl text-brand-ink">
          Scan QR Code or Enter Reference
        </h3>

        <form onSubmit={handleVerify} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-brand-ink-subtle absolute left-4 top-3.5" />
            <input
              type="text"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PLN-2026-AB12CD or Paste QR scan output"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-beige bg-brand-ivory text-sm font-mono font-bold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-6 py-3 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? 'Checking...' : 'Verify Pass'}
          </button>
        </form>

        {/* Verification Result Card */}
        {verifiedBooking && (
          <div className="p-6 rounded-2xl bg-brand-ivory/80 border border-brand-beige space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige/70 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider block">
                  Reference: {verifiedBooking.bookingReference}
                </span>
                <h4 className="font-display font-bold text-lg text-brand-ink">
                  {verifiedBooking.attendeeDetails[0]?.name || verifiedBooking.userId?.name}
                </h4>
                <p className="text-xs text-brand-ink-muted">
                  {verifiedBooking.attendeeDetails[0]?.email || verifiedBooking.userId?.email}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {verifiedBooking.checkInStatus === 'checked_in' ? (
                  <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>ALREADY CHECKED IN</span>
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VALID PASS • READY</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-brand-ink-subtle block">Ticket Tier</span>
                <span className="font-bold text-brand-ink">
                  {verifiedBooking.ticketTypeId?.name || 'Standard Pass'}
                </span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Passes in Order</span>
                <span className="font-bold text-brand-ink">{verifiedBooking.quantity} Ticket(s)</span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Order Date</span>
                <span className="font-bold text-brand-ink">
                  {new Date(verifiedBooking.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Payment Status</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {verifiedBooking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Check-In Action Button */}
            {verifiedBooking.checkInStatus === 'not_checked_in' ? (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Attendee Check-In</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-6 py-3.5 rounded-2xl border border-brand-beige bg-white text-xs font-bold text-brand-ink hover:bg-brand-beige"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>DO NOT ADMIT: This pass has already been used for entry.</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Checked in at: {new Date(verifiedBooking.checkedInAt).toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-bold text-xs"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback message banner */}
        {checkInResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              checkInResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                : 'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
            }`}
          >
            {checkInResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{checkInResult.message}</span>
          </div>
        )}
      </div>

      {/* Recent Check-Ins Activity */}
      {recentCheckIns.length > 0 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-6 shadow-brand space-y-4">
          <h4 className="font-display font-bold text-base text-brand-ink">
            Recent Check-Ins in this Station
          </h4>
          <div className="divide-y divide-brand-beige/60">
            {recentCheckIns.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-brand-ink">{item.attendeeDetails[0]?.name}</span>
                  <span className="text-brand-ink-subtle ml-2">({item.bookingReference})</span>
                </div>
                <span className="text-emerald-700 font-semibold">
                  Just now ({new Date(item.checkedInAt).toLocaleTimeString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
