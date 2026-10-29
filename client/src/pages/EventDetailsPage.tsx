import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Share2,
  CalendarPlus,
  Users,
  Star,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Building,
} from 'lucide-react';
import api from '../lib/api';
import { EventItem, TicketType, Review } from '../types';
import { formatCurrency, formatEventDate } from '../lib/utils';
import { TicketSelector } from '../components/events/TicketSelector';
import { ReviewsList } from '../components/events/ReviewsList';
import { EventCard } from '../components/events/EventCard';

export const EventDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'speakers' | 'venue' | 'reviews'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchEventData = async () => {
    if (!slug) return;
    try {
      const res = await api.get(`/events/${slug}`);
      if (res.data.success) {
        setEvent(res.data.data);
        setTicketTypes(res.data.data.ticketTypes || []);
        setRelatedEvents(res.data.data.relatedEvents || []);

        // Fetch reviews
        if (res.data.data._id) {
          const revRes = await api.get(`/reviews/event/${res.data.data._id}`);
          if (revRes.data.success) {
            setReviews(revRes.data.data || []);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEventData();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-brand-ink-muted">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-brand-ink">Event Not Found</h2>
        <p className="text-xs text-brand-ink-muted">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-blue text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const category = typeof event.categoryId === 'object' ? event.categoryId : null;
  const organizer = typeof event.organizerId === 'object' ? event.organizerId : null;
  const venue = event.venueId;

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Hero Banner */}
      <div className="relative bg-brand-ink text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ivory/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Gatherings</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {category && (
              <span
                className="px-3.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: category.color || '#0047AB' }}
              >
                {category.name}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-white/10 text-brand-yellow text-xs font-semibold backdrop-blur-md">
              {event.format === 'in-person'
                ? '📍 In-Person'
                : event.format === 'online'
                ? '💻 Virtual Event'
                : '🌐 Hybrid Experience'}
            </span>
            {event.averageRating > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-yellow/20 text-brand-yellow text-xs font-bold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-brand-yellow" />
                <span>{event.averageRating} Rating</span>
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-brand-ivory/80 max-w-3xl leading-relaxed">
            {event.shortDescription || event.description}
          </p>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap gap-6 pt-4 text-xs font-semibold text-brand-ivory/90 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-yellow" />
              <span>{formatEventDate(event.startDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-yellow" />
              <span>
                {formatEventDate(event.startDate, 'h:mm a')} - {formatEventDate(event.endDate, 'h:mm a')} ({event.timezone})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-yellow" />
              <span>
                {venue ? `${venue.name}, ${venue.city}` : event.onlineUrl || 'Virtual Live Stage'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content & Sticky Ticket Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Tabs & Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Tabs Navigation */}
            <div className="flex border-b border-brand-beige overflow-x-auto gap-8 pb-1">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'agenda', label: `Agenda (${event.sessions?.length || 0})` },
                { key: 'speakers', label: `Speakers (${event.speakers?.length || 0})` },
                { key: 'venue', label: 'Venue & Directions' },
                { key: 'reviews', label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-brand-ink-subtle hover:text-brand-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
                  <h3 className="font-display font-bold text-xl text-brand-ink">About this Event</h3>
                  <div className="prose prose-sm max-w-none text-brand-ink-muted leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="pt-4 border-t border-brand-beige/60">
                      <span className="text-xs font-bold text-brand-ink-subtle uppercase tracking-wider block mb-2">
                        Tags & Topics
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 rounded-xl bg-brand-ivory border border-brand-beige text-brand-ink text-xs font-semibold"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sponsors Row */}
                {event.sponsors && event.sponsors.length > 0 && (
                  <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-4">
                    <h3 className="font-display font-bold text-lg text-brand-ink">Official Event Partners</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {event.sponsors.map((sp, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-brand-ivory/50 border border-brand-beige flex items-center gap-3"
                        >
                          <img
                            src={sp.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${sp.name}`}
                            alt={sp.name}
                            className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-brand-beige/50"
                          />
                          <div>
                            <span className="font-bold text-xs text-brand-ink block">{sp.name}</span>
                            <span className="text-[10px] text-brand-blue font-bold uppercase">{sp.tier} Partner</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Agenda / Sessions */}
            {activeTab === 'agenda' && (
              <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6 animate-in fade-in duration-150">
                <h3 className="font-display font-bold text-xl text-brand-ink">Conference Agenda</h3>
                {event.sessions && event.sessions.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-brand-beige">
                    {event.sessions.map((sess, i) => (
                      <div key={i} className="relative pl-10">
                        <div className="absolute left-3.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-blue ring-4 ring-white" />
                        <div className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-brand-blue/10 text-brand-blue text-[11px] font-bold">
                              {sess.track || 'Main Track'}
                            </span>
                            <span className="text-xs font-semibold text-brand-ink-subtle">
                              {formatEventDate(sess.startTime, 'h:mm a')} - {formatEventDate(sess.endTime, 'h:mm a')}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-brand-ink">{sess.title}</h4>
                          {sess.description && (
                            <p className="text-xs text-brand-ink-muted mt-1 leading-relaxed">
                              {sess.description}
                            </p>
                          )}
                          {sess.speakerNames && sess.speakerNames.length > 0 && (
                            <div className="mt-3 text-xs text-brand-ink font-semibold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-brand-blue" />
                              <span>Speakers: {sess.speakerNames.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-ink-muted">Detailed schedule will be published shortly.</p>
                )}
              </div>
            )}

            {/* TAB: Speakers */}
            {activeTab === 'speakers' && (
              <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6 animate-in fade-in duration-150">
                <h3 className="font-display font-bold text-xl text-brand-ink">Featured Speakers</h3>
                {event.speakers && event.speakers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.speakers.map((spk, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige flex gap-4"
                      >
                        <img
                          src={spk.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${spk.name}`}
                          alt={spk.name}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-brand-blue/20"
                        />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-brand-ink">{spk.name}</h4>
                          <p className="text-xs text-brand-blue font-semibold">
                            {spk.role} • {spk.company}
                          </p>
                          {spk.bio && (
                            <p className="text-xs text-brand-ink-muted line-clamp-2 leading-relaxed">
                              {spk.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-ink-muted">Speakers list will be finalized soon.</p>
                )}
              </div>
            )}

            {/* TAB: Venue */}
            {activeTab === 'venue' && (
              <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6 animate-in fade-in duration-150">
                <h3 className="font-display font-bold text-xl text-brand-ink">Venue & Location</h3>
                {venue ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-brand-blue" />
                        <h4 className="font-bold text-base text-brand-ink">{venue.name}</h4>
                      </div>
                      <p className="text-xs text-brand-ink-muted">
                        {venue.address}, {venue.city}, {venue.state} {venue.postalCode}, {venue.country}
                      </p>
                      <div className="text-xs text-brand-ink font-semibold">
                        Capacity: {venue.capacity.toLocaleString()} Attendees
                      </div>
                    </div>

                    {venue.amenities && venue.amenities.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-brand-ink-subtle uppercase tracking-wider block mb-2">
                          Venue Amenities
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {venue.amenities.map((a, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-xl bg-brand-beige/40 text-brand-ink text-xs font-semibold flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-brand-ivory/60 border border-brand-beige text-xs text-brand-ink-muted">
                    This is an online virtual gathering. Broadcast links will be provided upon registration.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Reviews */}
            {activeTab === 'reviews' && (
              <ReviewsList
                eventId={event._id}
                reviews={reviews}
                averageRating={event.averageRating}
                reviewsCount={event.reviewsCount}
                onReviewAdded={fetchEventData}
              />
            )}
          </div>

          {/* Right 1 Col: Sticky Ticket Selector & Host Info */}
          <div className="space-y-6 lg:sticky lg:top-24 h-max">
            {/* Ticket Selector Component */}
            <TicketSelector event={event} ticketTypes={ticketTypes} />

            {/* Organizer Profile Card */}
            {organizer && (
              <div className="p-6 rounded-3xl bg-white border border-brand-beige shadow-brand space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-ink-subtle block">
                  Hosted by
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={organizer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${organizer.name}`}
                    alt={organizer.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-blue/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-brand-ink">{organizer.name}</h4>
                    <p className="text-xs text-brand-ink-muted">{organizer.organization || 'Event Host'}</p>
                  </div>
                </div>
                {organizer.bio && (
                  <p className="text-xs text-brand-ink-muted leading-relaxed line-clamp-3">
                    {organizer.bio}
                  </p>
                )}
              </div>
            )}

            {/* Calendar & Share Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`/api/bookings/event/${event._id}/calendar.ics`}
                download={`${event.slug}.ics`}
                className="p-3 rounded-2xl border border-brand-beige bg-white hover:bg-brand-beige/50 text-brand-ink text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CalendarPlus className="w-4 h-4 text-brand-blue" />
                <span>Add to Cal</span>
              </a>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl border border-brand-beige bg-white hover:bg-brand-beige/50 text-brand-ink text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4 text-brand-blue" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Related Gatherings */}
      {relatedEvents.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-brand-beige">
          <h3 className="font-display font-bold text-2xl text-brand-ink mb-6">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((rel) => (
              <EventCard key={rel._id} event={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
