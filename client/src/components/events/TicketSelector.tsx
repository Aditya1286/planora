import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Plus, Minus, Tag, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { EventItem, TicketType } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

interface TicketSelectorProps {
  event: EventItem;
  ticketTypes: TicketType[];
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({ event, ticketTypes }) => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    ticketTypes.length > 0 ? ticketTypes[0]._id : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountValue: number;
    discountType: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const selectedTicket = ticketTypes.find((t) => t._id === selectedTicketId) || ticketTypes[0];

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setValidatingPromo(true);

    try {
      const currentSubtotal = (selectedTicket?.price || 0) * quantity;
      const res = await api.post('/promo-codes/validate', {
        code: promoInput.trim(),
        eventId: event._id,
        subtotal: currentSubtotal,
      });

      if (res.data.success) {
        setAppliedPromo(res.data.data);
      } else {
        setPromoError(res.data.message || 'Invalid promo code');
      }
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Invalid or expired promo code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const subtotal = (selectedTicket?.price || 0) * quantity;
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleProceed = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!selectedTicket) return;

    // Navigate to Checkout Page with state
    navigate(`/events/${event.slug}/checkout`, {
      state: {
        eventId: event._id,
        ticketTypeId: selectedTicket._id,
        quantity,
        promoCode: appliedPromo?.code || null,
        subtotal,
        discount,
        total,
      },
    });
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-brand-beige p-6 text-center shadow-brand">
        <Ticket className="w-8 h-8 text-brand-ink-subtle mx-auto mb-2" />
        <h4 className="font-bold text-sm text-brand-ink">No Tickets Available</h4>
        <p className="text-xs text-brand-ink-muted mt-1">This event does not currently have tickets for sale.</p>
      </div>
    );
  }

  const isSoldOut = selectedTicket?.status === 'sold_out' || selectedTicket?.remainingQuantity === 0;

  return (
    <div className="bg-white rounded-3xl border border-brand-beige p-6 shadow-brand space-y-6">
      <div className="flex items-center justify-between border-b border-brand-beige/60 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-ink-subtle">
            Registration
          </span>
          <h3 className="font-display font-bold text-lg text-brand-ink">Select Tickets</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-ink font-bold text-xs flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
          Guaranteed Pass
        </span>
      </div>

      {/* Ticket Tier Cards */}
      <div className="space-y-3">
        {ticketTypes.map((tier) => {
          const isSelected = selectedTicketId === tier._id;
          const soldOut = tier.status === 'sold_out' || tier.remainingQuantity === 0;

          return (
            <div
              key={tier._id}
              onClick={() => {
                if (!soldOut) {
                  setSelectedTicketId(tier._id);
                  setQuantity(1);
                  setAppliedPromo(null);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-blue bg-brand-blue/5 shadow-sm ring-1 ring-brand-blue'
                  : 'border-brand-beige/80 bg-white hover:border-brand-blue/40'
              } ${soldOut ? 'opacity-60 cursor-not-allowed bg-brand-beige/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-brand-ink">{tier.name}</h4>
                    {soldOut && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                        Sold Out
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-xs text-brand-ink-muted mt-1 leading-relaxed">
                      {tier.description}
                    </p>
                  )}
                  <span className="text-[10px] text-brand-ink-subtle mt-1.5 block">
                    {soldOut
                      ? 'Waitlist available'
                      : `${tier.remainingQuantity} passes remaining`}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-brand-ink font-display">
                    {formatCurrency(tier.price)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quantity Selector */}
      {!isSoldOut && (
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="block text-xs font-bold text-brand-ink">Quantity</span>
            <span className="text-[10px] text-brand-ink-subtle">
              Max {selectedTicket.perUserLimit || 5} per attendee
            </span>
          </div>

          <div className="flex items-center gap-3 bg-brand-ivory rounded-2xl border border-brand-beige p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-ink hover:bg-brand-beige transition-colors disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-brand-ink">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(
                  Math.min(
                    selectedTicket.perUserLimit || 5,
                    selectedTicket.remainingQuantity,
                    quantity + 1
                  )
                )
              }
              disabled={
                quantity >= (selectedTicket.perUserLimit || 5) ||
                quantity >= selectedTicket.remainingQuantity
              }
              className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-ink hover:bg-brand-beige transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Promo Code Input */}
      {selectedTicket?.price > 0 && !isSoldOut && (
        <div className="pt-2 border-t border-brand-beige/60">
          <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
            Have a Promo Code?
          </label>
          {appliedPromo ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4" />
                <span>Code {appliedPromo.code} applied! (-{formatCurrency(discount)})</span>
              </div>
              <button
                onClick={handleRemovePromo}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline text-xs"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-brand-ink-subtle absolute left-3 top-3" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PLANORA20"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={validatingPromo || !promoInput.trim()}
                className="px-4 py-2 rounded-xl bg-brand-beige text-brand-ink font-bold text-xs hover:bg-brand-beige-dark transition-colors shrink-0 disabled:opacity-50"
              >
                {validatingPromo ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          {promoError && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {promoError}
            </p>
          )}
        </div>
      )}

      {/* Pricing Summary */}
      <div className="pt-4 border-t border-brand-beige/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-brand-ink-muted">
          <span>Subtotal ({quantity} ticket{quantity > 1 ? 's' : ''})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-base font-extrabold text-brand-ink font-display pt-2 border-t border-brand-beige/40">
          <span>Total</span>
          <span className="text-brand-blue">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <button
        onClick={handleProceed}
        disabled={isSoldOut}
        className="w-full py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
      >
        <span>{isSoldOut ? 'Sold Out' : 'Proceed to Checkout'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[10px] text-center text-brand-ink-subtle">
        🔒 Instant confirmation with digital QR ticket. 100% demo payment simulation.
      </p>
    </div>
  );
};
