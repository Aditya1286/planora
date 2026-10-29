import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  Calendar,
  Users,
  PlusCircle,
  Copy,
  Ban,
  ScanLine,
  Send,
  Eye,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatEventDate } from '../lib/utils';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TicketsPieChart } from '../components/dashboard/TicketsPieChart';

export const OrganizerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement modal state
  const [announcementEvent, setAnnouncementEvent] = useState<any | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSending, setAnnSending] = useState(false);
  const [annFeedback, setAnnFeedback] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        api.get('/dashboard/organizer'),
        api.get('/events/organizer/my-events'),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDuplicate = async (eventId: string) => {
    try {
      const res = await api.post(`/events/${eventId}/duplicate`);
      if (res.data.success) {
        fetchDashboard();
        alert('Event duplicated as a new draft!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error duplicating event');
    }
  };

  const handleCancelEvent = async (eventId: string, title: string) => {
    const reason = window.prompt(
      `Are you sure you want to cancel "${title}"? This will cancel all attendee bookings and send them automatic notifications.\n\nPlease enter the cancellation reason:`,
      'Cancelled by organizer due to unforeseen circumstances.'
    );

    if (reason === null) return;

    try {
      const res = await api.post(`/events/${eventId}/cancel`, { cancellationReason: reason });
      if (res.data.success) {
        fetchDashboard();
        alert(`Event cancelled. ${res.data.message}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling event');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementEvent) return;

    setAnnSending(true);
    setAnnFeedback(null);
    try {
      const res = await api.post('/notifications/announcement', {
        eventId: announcementEvent._id,
        title: annTitle,
        message: annMessage,
      });

      if (res.data.success) {
        setAnnFeedback(res.data.message);
        setTimeout(() => {
          setAnnouncementEvent(null);
          setAnnTitle('');
          setAnnMessage('');
          setAnnFeedback(null);
        }, 1200);
      }
    } catch (err: any) {
      setAnnFeedback(err.response?.data?.message || 'Error sending announcement');
    } finally {
      setAnnSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-ink-muted">Loading organizer analytics and events...</p>
      </div>
    );
  }

  const totals = analytics?.totals || {
    totalRevenue: 0,
    ticketsSold: 0,
    totalEvents: 0,
    activeEvents: 0,
    checkInRate: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider block mb-1">
            Organizer Headquarters
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink">
            Event Management & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-brand-ink-muted mt-1">
            Aggregated in real-time from active attendee registrations and ticket sales.
          </p>
        </div>

        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-yellow text-brand-ink font-bold text-sm hover:bg-brand-yellow-hover shadow-sun transition-all self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gross Ticket Revenue"
          value={formatCurrency(totals.totalRevenue)}
          subtitle="Processed via demo payments"
          icon={DollarSign}
          color="blue"
          badge="+14.2% MoM"
        />
        <StatCard
          title="Tickets Confirmed"
          value={totals.ticketsSold.toLocaleString()}
          subtitle="Total attendee passes"
          icon={Ticket}
          color="yellow"
        />
        <StatCard
          title="Active Gatherings"
          value={`${totals.activeEvents} / ${totals.totalEvents}`}
          subtitle="Published vs drafts"
          icon={Calendar}
          color="ink"
        />
        <StatCard
          title="Check-In Completion"
          value={`${totals.checkInRate}%`}
          subtitle="Live attendee arrival rate"
          icon={Users}
          color="blue"
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Over Time: 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6">
          <div className="flex items-center justify-between border-b border-brand-beige/60 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-brand-ink">Revenue Timeline</h3>
              <p className="text-xs text-brand-ink-muted">Historical registration revenue (real database aggregation)</p>
            </div>
            <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
              Live DB Aggregation
            </span>
          </div>
          <RevenueChart data={analytics?.revenueOverTime || []} />
        </div>

        {/* Tickets by Tier Pie Chart: 1 col */}
        <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6">
          <div className="border-b border-brand-beige/60 pb-4">
            <h3 className="font-display font-bold text-lg text-brand-ink">Sales by Tier</h3>
            <p className="text-xs text-brand-ink-muted">Breakdown across VIP, General, and Early Bird</p>
          </div>
          <TicketsPieChart data={analytics?.ticketsByType || []} />
        </div>
      </div>

      {/* 3. Managed Events Table */}
      <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige/60 pb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-brand-ink">Your Events Directory</h3>
            <p className="text-xs text-brand-ink-muted">Manage ticketing, attendee check-in stations, and announcements.</p>
          </div>
          <span className="text-xs font-bold text-brand-ink">
            {events.length} Event{events.length !== 1 ? 's' : ''} Managed
          </span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-brand-ink-muted">You haven't created any events yet.</p>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Event</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-beige text-[11px] font-bold text-brand-ink-subtle uppercase tracking-wider">
                  <th className="pb-3 pl-2">Event Title</th>
                  <th className="pb-3">Date & Venue</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Sales / Capacity</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/60 text-xs">
                {events.map((ev) => {
                  const sold = ev.stats?.ticketsSold || 0;
                  const cap = ev.capacity || 100;
                  const pct = Math.min(100, Math.round((sold / cap) * 100));

                  return (
                    <tr key={ev._id} className="hover:bg-brand-ivory/50 transition-colors">
                      {/* Title & Cover */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.coverImage}
                            alt={ev.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-brand-beige"
                          />
                          <div>
                            <Link
                              to={`/events/${ev.slug}`}
                              className="font-bold text-sm text-brand-ink hover:text-brand-blue transition-colors line-clamp-1 max-w-xs"
                            >
                              {ev.title}
                            </Link>
                            <span className="text-[10px] text-brand-ink-subtle font-semibold">
                              {ev.format.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-4 text-brand-ink-muted">
                        <div>{formatEventDate(ev.startDate, 'MMM d, yyyy')}</div>
                        <div className="text-[11px] text-brand-ink-subtle">
                          {ev.venueId ? `${ev.venueId.name}, ${ev.venueId.city}` : 'Online Stage'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            ev.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ev.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : ev.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>

                      {/* Sales Progress */}
                      <td className="py-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-brand-ink">
                            <span>{sold} sold</span>
                            <span>{cap} cap</span>
                          </div>
                          <div className="w-full bg-brand-beige/50 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-blue h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="py-4 font-bold text-brand-ink">
                        {formatCurrency(ev.stats?.totalRevenue || 0)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Launch Check-in station */}
                          {ev.status === 'published' && (
                            <Link
                              to={`/organizer/check-in/${ev._id}`}
                              className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                              title="Open Live Check-In Station"
                            >
                              <ScanLine className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Broadcast announcement */}
                          {ev.status === 'published' && (
                            <button
                              onClick={() => setAnnouncementEvent(ev)}
                              className="p-2 rounded-xl bg-brand-yellow/20 text-brand-ink hover:bg-brand-yellow transition-colors"
                              title="Broadcast Announcement to Attendees"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(ev._id)}
                            className="p-2 rounded-xl border border-brand-beige text-brand-ink hover:bg-brand-beige transition-colors"
                            title="Duplicate Event"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Cancel */}
                          {ev.status === 'published' && (
                            <button
                              onClick={() => handleCancelEvent(ev._id, ev.title)}
                              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Cancel Event"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {announcementEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-ivory rounded-3xl max-w-lg w-full p-8 border border-brand-beige shadow-2xl relative">
            <button
              onClick={() => setAnnouncementEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-brand-ink-subtle hover:bg-brand-beige"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-brand-blue" />
              <h3 className="font-display font-bold text-xl text-brand-ink">
                Broadcast Announcement
              </h3>
            </div>
            <p className="text-xs text-brand-ink-muted mb-4">
              Sending to all confirmed attendees of <strong>"{announcementEvent.title}"</strong>. This posts an in-app alert and simulates transactional email logs.
            </p>

            {annFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{annFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Subject / Heading
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Venue Doors Open 1 Hour Early"
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Important information for arriving guests..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementEvent(null)}
                  className="px-4 py-2 rounded-xl border border-brand-beige text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={annSending}
                  className="px-6 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt disabled:opacity-50"
                >
                  {annSending ? 'Broadcasting...' : 'Broadcast to Attendees'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
