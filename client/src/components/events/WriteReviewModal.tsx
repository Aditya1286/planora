import React, { useState } from 'react';
import { X, Star, AlertCircle, Check } from 'lucide-react';
import api from '../../lib/api';

interface WriteReviewModalProps {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ eventId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/reviews', {
        eventId,
        rating,
        title,
        comment,
      });

      if (res.data.success) {
        onSuccess();
      } else {
        setError(res.data.message || 'Error submitting review');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Only registered attendees who have booked tickets for this event can leave a review.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-ivory rounded-3xl max-w-lg w-full shadow-2xl border border-brand-beige overflow-hidden relative p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-brand-ink-subtle hover:text-brand-ink hover:bg-brand-beige transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display font-bold text-xl text-brand-ink mb-1">Rate & Review Event</h3>
        <p className="text-xs text-brand-ink-muted mb-6">
          Share your experience to help future attendees and assist organizers in refining their events.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                return (
                  <button
                    type="button"
                    key={starVal}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        starVal <= (hoverRating || rating)
                          ? 'fill-brand-yellow text-brand-yellow'
                          : 'text-brand-beige'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-bold text-brand-ink">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flawless production and high-caliber speakers"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-1.5">
              Detailed Feedback
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What stood out most? How was the venue, audio, sessions, or networking?"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-beige text-xs font-bold text-brand-ink hover:bg-brand-beige transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
