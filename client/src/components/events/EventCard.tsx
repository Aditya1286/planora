import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Video, Star, Heart, ArrowRight } from 'lucide-react';
import { EventItem } from '../../types';
import { formatCurrency, formatEventDate } from '../../lib/utils';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface EventCardProps {
  event: EventItem;
  isFavorited?: boolean;
  onFavoriteToggle?: (eventId: string, favorited: boolean) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isFavorited = false, onFavoriteToggle }) => {
  const { user, openAuthModal } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const category = typeof event.categoryId === 'object' ? event.categoryId : null;
  const venue = event.venueId;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal('login');
      return;
    }

    setFavLoading(true);
    try {
      const res = await api.post('/favorites/toggle', { eventId: event._id });
      if (res.data.success) {
        setFavorited(res.data.isFavorited);
        if (onFavoriteToggle) {
          onFavoriteToggle(event._id, res.data.isFavorited);
        }
      }
    } catch {
      // ignore
    } finally {
      setFavLoading(false);
    }
  };

  const getPriceLabel = () => {
    if (event.isFree || event.minPrice === 0) return 'Free Admission';
    if (event.minPrice !== undefined && event.minPrice > 0) {
      return `From ${formatCurrency(event.minPrice)}`;
    }
    return 'Tickets Available';
  };

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group rounded-3xl bg-white border border-brand-beige overflow-hidden card-hover-effect flex flex-col h-full shadow-brand"
    >
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-beige/20">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        {category && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md"
            style={{ backgroundColor: category.color || '#0047AB' }}
          >
            {category.name}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={favLoading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-ink hover:text-rose-600 transition-colors shadow-sm"
          title="Save to Favorites"
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Format Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
          {event.format === 'online' ? (
            <>
              <Video className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Virtual Live</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
              <span>{venue ? `${venue.city}, ${venue.name}` : 'In-Person'}</span>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatEventDate(event.startDate, 'EEE, MMM d • h:mm a')}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base text-brand-ink group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug mb-2">
            {event.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-brand-ink-muted line-clamp-2 leading-relaxed mb-4">
            {event.shortDescription || event.description}
          </p>
        </div>

        {/* Footer Area: Price & Rating */}
        <div className="pt-3 border-t border-brand-beige/60 flex items-center justify-between mt-auto">
          <div>
            <span className="block text-[10px] uppercase font-bold text-brand-ink-subtle tracking-wider">
              Admission
            </span>
            <span className="text-sm font-bold text-brand-ink">
              {getPriceLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-brand-yellow/15 text-brand-ink px-2 py-0.5 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                <span>{event.averageRating}</span>
              </div>
            )}
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
