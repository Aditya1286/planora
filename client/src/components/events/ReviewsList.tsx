import React, { useState } from 'react';
import { Star, MessageSquare, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WriteReviewModal } from './WriteReviewModal';

interface ReviewsListProps {
  eventId: string;
  reviews: Review[];
  averageRating: number;
  reviewsCount: number;
  onReviewAdded: () => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  eventId,
  reviews,
  averageRating,
  reviewsCount,
  onReviewAdded,
}) => {
  const { user, openAuthModal } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-8">
      {/* Header and Aggregate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-brand-beige/60">
        <div className="flex items-center gap-4">
          <div className="text-center p-4 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/30">
            <span className="font-display font-black text-3xl text-brand-ink block">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center gap-0.5 mt-1 text-brand-yellow">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(averageRating || 5)
                      ? 'fill-brand-yellow text-brand-yellow'
                      : 'text-brand-beige'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-brand-ink-subtle font-semibold mt-1 block">
              {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-brand-ink">Attendee Experiences</h3>
            <p className="text-xs text-brand-ink-muted mt-1 leading-relaxed max-w-md">
              Verified reviews from registered participants who attended this or previous editions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal('login');
            } else {
              setShowModal(true);
            }
          }}
          className="px-5 py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue-hover shadow-cobalt transition-all self-start sm:self-center shrink-0"
        >
          Leave a Review
        </button>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-8 h-8 text-brand-ink-subtle mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-brand-ink">No reviews yet</h4>
            <p className="text-xs text-brand-ink-muted mt-1">
              Be the first attendee to share feedback on this event experience!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="p-5 rounded-2xl bg-brand-ivory/50 border border-brand-beige/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.userId?.name}`}
                    alt={rev.userId?.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-blue/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-brand-ink">{rev.userId?.name}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Attendee
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-ink-subtle">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-brand-yellow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-brand-yellow text-brand-yellow' : 'text-brand-beige'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-sm text-brand-ink mb-1">{rev.title}</h5>
                <p className="text-xs text-brand-ink-muted leading-relaxed">{rev.comment}</p>
              </div>

              {/* Organizer Response */}
              {rev.organizerReply && rev.organizerReply.comment && (
                <div className="mt-3 ml-4 p-3 rounded-xl bg-white border border-brand-beige/80 text-xs flex gap-2">
                  <CornerDownRight className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-ink block mb-0.5">
                      Organizer Response ({rev.organizerReply.repliedBy?.name || 'Host'})
                    </span>
                    <p className="text-brand-ink-muted">{rev.organizerReply.comment}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <WriteReviewModal
          eventId={eventId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onReviewAdded();
          }}
        />
      )}
    </div>
  );
};
