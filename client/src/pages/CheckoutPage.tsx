import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatEventDate } from '../lib/utils';
import { EventItem, TicketType } from '../types';

export const CheckoutPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateData = location.state as {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    promoCode?: string;
    subtotal: number;
    discount: number;
    total: number;
  } | null;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attendees form state
  const quantity = stateData?.quantity || 1;
  const [attendees, setAttendees] = useState<Array<{ name: string; email: string; phone: string }>>([]);

  // Demo payment details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardholder, setCardholder] = useState('');

  useEffect(() => {
    if (!stateData) {
      navigate(`/events/${slug}`);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/events/${slug}`);
        if (res.data.success) {
          setEvent(res.data.data);
          const tType = res.data.data.ticketTypes.find((t: any) => t._id === stateData.ticketTypeId);
          setTicketType(tType || null);

          // Initialize attendees array
          const initial = Array.from({ length: quantity }, (_, i) => ({
            name: i === 0 && user ? user.name : '',
            email: i === 0 && user ? user.email : '',
            phone: i === 0 && user ? user.phone || '' : '',
          }));
          setAttendees(initial);
          setCardholder(user?.name || 'Aria Chen');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [slug, stateData, user]);

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setAttendees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        eventId: stateData!.eventId,
        ticketTypeId: stateData!.ticketTypeId,
        quantity,
        promoCode: stateData?.promoCode,
        paymentMethod: stateData!.total === 0 ? 'free' : 'demo_card',
        attendeeDetails: attendees,
      };

      const res = await api.post('/bookings', payload);

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0047AB', '#FFC93C', '#E8DCC8'],
        });

        const bookingRef = res.data.data.bookingReference;
        setTimeout(() => {
          navigate(`/bookings/${bookingRef}`, { replace: true });
        }, 800);
      } else {
        setError(res.data.message || 'Payment processing failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error completing registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !event || !stateData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-ink-muted">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-beige pb-6">
        <div>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink-subtle hover:text-brand-blue transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Event</span>
          </Link>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-ink">
            Checkout & Attendee Registration
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Secure Order</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleCheckout} className="lg:col-span-2 space-y-8">
          {/* Attendee Details Card */}
          <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6">
            <h3 className="font-display font-bold text-lg text-brand-ink border-b border-brand-beige/60 pb-3">
              Attendee Information ({quantity} Pass{quantity > 1 ? 'es' : ''})
            </h3>

            {attendees.map((att, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-ivory/50 border border-brand-beige/70 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-blue">
                    Ticket #{idx + 1} Details
                  </h4>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-brand-ink-subtle">
                      Primary Contact
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={att.name}
                      onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Aria Chen"
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-semibold text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={att.email}
                      onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)}
                      placeholder="e.g. aria@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-semibold text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                      Mobile Number (Optional for SMS reminders)
                    </label>
                    <input
                      type="tel"
                      value={att.phone}
                      onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-semibold text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-3xl border border-brand-beige p-6 sm:p-8 shadow-brand space-y-6">
            <div className="flex items-center justify-between border-b border-brand-beige/60 pb-3">
              <h3 className="font-display font-bold text-lg text-brand-ink">
                Payment Method
              </h3>
              <span className="px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-ink text-xs font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                Demo Payment Mode
              </span>
            </div>

            {stateData.total > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed flex gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Demo Mode Active:</strong> No real bank transactions or card charges will be made. The credit card inputs below are simulated for demonstration.
                  </div>
                </div>

                {/* Card input mockup */}
                <div className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      required
                      value={cardholder}
                      onChange={(e) => setCardholder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-semibold text-brand-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-brand-ink-subtle absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-mono font-semibold text-brand-ink"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-mono font-semibold text-brand-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-ink-muted mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-mono font-semibold text-brand-ink"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Complimentary / Free Access Pass. No payment required.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-brand-blue text-white font-extrabold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Demo Booking...</span>
                </>
              ) : (
                <span>
                  Confirm & Generate Tickets ({formatCurrency(stateData.total)})
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Right 1 Col: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-beige p-6 shadow-brand space-y-6">
            <h3 className="font-display font-bold text-lg text-brand-ink border-b border-brand-beige/60 pb-3">
              Order Summary
            </h3>

            {/* Event snapshot */}
            <div className="flex gap-4">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-1 ring-brand-beige"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-brand-ink line-clamp-2 leading-tight">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-brand-blue font-semibold">
                  <Calendar className="w-3 h-3" />
                  <span>{formatEventDate(event.startDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-ink-subtle">
                  <MapPin className="w-3 h-3" />
                  <span>{event.venueId?.city || 'Virtual Event'}</span>
                </div>
              </div>
            </div>

            {/* Ticket line */}
            <div className="p-4 rounded-2xl bg-brand-ivory border border-brand-beige/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-brand-ink">
                <span>{ticketType?.name || 'General Pass'}</span>
                <span>{formatCurrency(ticketType?.price || 0)} each</span>
              </div>
              <div className="flex items-center justify-between text-xs text-brand-ink-subtle">
                <span>Quantity</span>
                <span>x{quantity}</span>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-2 border-t border-brand-beige/60 text-xs">
              <div className="flex justify-between text-brand-ink-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(stateData.subtotal)}</span>
              </div>
              {stateData.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({stateData.promoCode})</span>
                  <span>-{formatCurrency(stateData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-brand-ink font-display pt-2 border-t border-brand-beige/40">
                <span>Total Due</span>
                <span className="text-brand-blue">{formatCurrency(stateData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
