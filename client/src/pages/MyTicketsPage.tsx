import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Download,
  CalendarPlus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/api';
import { Booking } from '../types';
import { formatCurrency, formatEventDate, generateTicketPDF } from '../lib/utils';
import { WriteReviewModal } from '../components/events/WriteReviewModal';

export const MyTicketsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedReviewEventId, setSelectedReviewEventId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will restore ticket availability.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        cancellationReason: 'Cancelled by attendee request',
      });
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && b.eventId && new Date(b.eventId.endDate) >= now
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'confirmed' && b.eventId && new Date(b.eventId.endDate) < now
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const activeList =
    filterTab === 'upcoming'
      ? upcomingBookings
      : filterTab === 'past'
      ? pastBookings
      : cancelledBookings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige pb-6">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink">
            My Event Passes & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-brand-ink-muted mt-1">
            Access your digital QR passes, download printable tickets, or add to calendar.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex bg-brand-beige/50 p-1 rounded-2xl border border-brand-beige self-start sm:self-center">
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'upcoming'
                ? 'bg-brand-blue text-white shadow-cobalt'
                : 'text-brand-ink hover:text-brand-blue'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setFilterTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'past'
                ? 'bg-brand-blue text-white shadow-cobalt'
                : 'text-brand-ink hover:text-brand-blue'
            }`}
          >
            Past Events ({pastBookings.length})
          </button>
          <button
            onClick={() => setFilterTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'cancelled'
                ? 'bg-brand-blue text-white shadow-cobalt'
                : 'text-brand-ink hover:text-brand-blue'
            }`}
          >
            Cancelled ({cancelledBookings.length})
          </button>
        </div>
      </div>

      {/* Ticket Cards Stream */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-brand-ink-muted">Loading your passes...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-beige p-16 text-center shadow-brand space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center mx-auto text-brand-ink">
            <Ticket className="w-8 h-8 text-brand-blue" />
          </div>
          <h3 className="font-display font-bold text-xl text-brand-ink">
            No {filterTab} tickets found
          </h3>
          <p className="text-xs text-brand-ink-muted max-w-sm mx-auto">
            Explore live conferences, festivals, and summits to register for your next pass.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue-hover shadow-cobalt"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeList.map((booking) => {
            const ev = booking.eventId;
            if (!ev) return null;

            return (
              <div
                key={booking._id}
                className="rounded-3xl bg-white border border-brand-beige shadow-brand overflow-hidden card-hover-effect grid grid-cols-1 md:grid-cols-12"
              >
                {/* Event Cover & Quick Pill: 3 cols */}
                <div className="md:col-span-4 relative aspect-video md:aspect-auto bg-brand-beige/20">
                  <img
                    src={ev.coverImage}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-md">
                      Ref: {booking.bookingReference}
                    </span>
                  </div>
                </div>

                {/* Booking Info: 5 cols */}
                <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-blue mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatEventDate(ev.startDate, 'EEE, MMM d, yyyy • h:mm a')}</span>
                    </div>

                    <Link
                      to={`/events/${ev.slug}`}
                      className="font-display font-bold text-lg text-brand-ink hover:text-brand-blue transition-colors line-clamp-2"
                    >
                      {ev.title}
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs text-brand-ink-subtle mt-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                      <span>{ev.venueId ? `${ev.venueId.name}, ${ev.venueId.city}` : ev.onlineUrl || 'Virtual Live'}</span>
                    </div>

                    <div className="mt-4 p-3 rounded-2xl bg-brand-ivory border border-brand-beige/70 text-xs space-y-1">
                      <div className="flex justify-between text-brand-ink font-semibold">
                        <span>Tier: {booking.ticketTypeId?.name || 'Standard Pass'}</span>
                        <span>{booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-brand-ink-subtle">
                        <span>Total Paid</span>
                        <span className="font-bold text-brand-blue">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Check-In Badge & Cancel Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-beige/60">
                    {booking.status === 'confirmed' ? (
                      booking.checkInStatus === 'checked_in' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Checked In
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-brand-ink-muted">
                          Pass Valid • Ready for Check-in
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                      </span>
                    )}

                    {filterTab === 'upcoming' && booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                      >
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}

                    {filterTab === 'past' && booking.status === 'confirmed' && (
                      <button
                        onClick={() => setSelectedReviewEventId(ev._id)}
                        className="px-3 py-1.5 rounded-xl bg-brand-yellow text-brand-ink text-xs font-bold flex items-center gap-1 hover:bg-brand-yellow-hover"
                      >
                        <Star className="w-3.5 h-3.5 fill-brand-ink" />
                        <span>Rate Event</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Code & Actions: 3 cols */}
                <div className="md:col-span-3 p-6 bg-brand-ivory/60 border-t md:border-t-0 md:border-l border-brand-beige flex flex-col items-center justify-center text-center space-y-4">
                  {booking.status === 'confirmed' ? (
                    <>
                      <div className="p-3 bg-white rounded-2xl border border-brand-beige shadow-sm">
                        <QRCodeSVG
                          value={booking.bookingReference}
                          size={110}
                          bgColor="#FFFFFF"
                          fgColor="#1A1A2E"
                          level="M"
                        />
                      </div>
                      <span className="text-[10px] text-brand-ink-subtle font-semibold">
                        Scan at venue entrance
                      </span>

                      <div className="w-full space-y-2">
                        <button
                          onClick={() => generateTicketPDF(booking)}
                          className="w-full py-2 px-3 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Ticket</span>
                        </button>

                        <a
                          href={`/api/bookings/event/${ev._id}/calendar.ics`}
                          download={`${ev.slug}.ics`}
                          className="w-full py-1.5 px-3 rounded-xl border border-brand-beige bg-white text-brand-ink text-xs font-bold hover:bg-brand-beige/50 flex items-center justify-center gap-1.5"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Add to Cal</span>
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                      <p className="text-xs text-brand-ink-muted">
                        This pass is cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedReviewEventId && (
        <WriteReviewModal
          eventId={selectedReviewEventId}
          onClose={() => setSelectedReviewEventId(null)}
          onSuccess={() => {
            setSelectedReviewEventId(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
