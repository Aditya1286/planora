import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Download,
  CalendarPlus,
  ArrowRight,
  Ticket,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/api';
import { Booking } from '../types';
import { formatCurrency, formatEventDate, generateTicketPDF } from '../lib/utils';

export const BookingSuccessPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/reference/${reference}`);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchBooking();
    }
  }, [reference]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-ink-muted">Loading your booking confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-brand-ink">Booking Not Found</h2>
        <Link
          to="/my-tickets"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-blue text-white text-xs font-bold"
        >
          <span>View My Passes</span>
        </Link>
      </div>
    );
  }

  const ev = booking.eventId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Booking Confirmed
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink">
          You're All Set to Attend!
        </h1>
        <p className="text-xs sm:text-sm text-brand-ink-muted max-w-md mx-auto">
          Your reservation is stored securely in MongoDB. Present your digital QR code upon entrance.
        </p>
      </div>

      {/* Pass Card Container */}
      <div className="rounded-3xl bg-white border border-brand-beige shadow-2xl overflow-hidden">
        {/* Pass Header Banner */}
        <div className="bg-brand-blue text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-brand-yellow tracking-wider block mb-1">
              Official Planora Access Pass
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
              {ev?.title}
            </h3>
            <span className="text-xs text-white/80 mt-1 block">
              {formatEventDate(ev?.startDate, 'EEEE, MMMM d, yyyy • h:mm a')}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-center border border-white/20 self-start sm:self-center shrink-0">
            <span className="text-[10px] text-white/70 block uppercase font-bold">Booking Ref</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-brand-yellow">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Pass Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Details 2 cols */}
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-ivory border border-brand-beige/60">
              <div>
                <span className="text-brand-ink-subtle block font-semibold">Attendee</span>
                <span className="font-bold text-sm text-brand-ink">
                  {booking.attendeeDetails[0]?.name || booking.userId?.name}
                </span>
                <span className="text-[11px] text-brand-ink-muted block truncate">
                  {booking.attendeeDetails[0]?.email || booking.userId?.email}
                </span>
              </div>

              <div>
                <span className="text-brand-ink-subtle block font-semibold">Pass Tier</span>
                <span className="font-bold text-sm text-brand-ink">
                  {booking.ticketTypeId?.name || 'General Admission'}
                </span>
                <span className="text-[11px] text-brand-blue font-bold block">
                  x{booking.quantity} Pass{booking.quantity > 1 ? 'es' : ''} ({formatCurrency(booking.totalAmount)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-brand-ink font-semibold">
              <MapPin className="w-4 h-4 text-brand-yellow shrink-0" />
              <span>{ev?.venueId ? `${ev.venueId.name}, ${ev.venueId.city}` : ev?.onlineUrl || 'Virtual Stage'}</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Status: Paid & Ready for Check-In</span>
            </div>
          </div>

          {/* QR Code 1 col */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-ivory border border-brand-beige text-center space-y-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-brand-beige">
              <QRCodeSVG
                value={booking.bookingReference}
                size={130}
                bgColor="#FFFFFF"
                fgColor="#1A1A2E"
                level="M"
              />
            </div>
            <span className="text-[10px] font-bold text-brand-ink uppercase tracking-wider">
              Scan to Enter
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-brand-ivory/50 border-t border-brand-beige flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => generateTicketPDF(booking)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Pass</span>
            </button>

            {ev && (
              <a
                href={`/api/bookings/event/${ev._id}/calendar.ics`}
                download={`${ev.slug}.ics`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink text-xs font-bold hover:bg-brand-beige flex items-center justify-center gap-1.5"
              >
                <CalendarPlus className="w-4 h-4 text-brand-blue" />
                <span>Add to Cal</span>
              </a>
            )}
          </div>

          <Link
            to="/my-tickets"
            className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1"
          >
            <span>View All My Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
