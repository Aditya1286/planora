import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Ticket,
  Star,
  Users,
} from 'lucide-react';
import api from '../lib/api';
import { EventItem, Category } from '../types';
import { EventCard } from '../components/events/EventCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes, catRes] = await Promise.all([
          api.get('/events/featured'),
          api.get('/events?limit=8&sort=popularity'),
          api.get('/categories'),
        ]);

        if (featRes.data.success) setFeaturedEvents(featRes.data.data || []);
        if (trendRes.data.success) setTrendingEvents(trendRes.data.data.events || []);
        if (catRes.data.success) setCategories(catRes.data.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-beige/70 border border-brand-beige text-brand-ink text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <span>Discover Over 60+ Curated Live Gatherings & Masterclasses</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-brand-ink leading-[1.08]">
            Where Extraordinary <br />
            <span className="text-brand-blue underline decoration-brand-yellow decoration-wavy decoration-2">
              Gatherings
            </span>{' '}
            Come to Life.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-brand-ink-muted max-w-2xl mx-auto leading-relaxed">
            Planora is the premier platform uniting world-class event organizers with curious minds, innovators, and creators across the globe.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto p-2 rounded-3xl bg-white border border-brand-beige shadow-brand-hover flex flex-col sm:flex-row gap-2 items-center"
          >
            <div className="relative flex-1 w-full flex items-center pl-4">
              <Search className="w-5 h-5 text-brand-blue shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI conferences, music festivals, design summits..."
                className="w-full pl-3 pr-4 py-3 bg-transparent text-sm text-brand-ink placeholder:text-brand-ink-subtle focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all shrink-0 flex items-center justify-center gap-2"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Key Stats Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto border-t border-brand-beige/70">
            <div>
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-brand-ink block">
                60+
              </span>
              <span className="text-xs text-brand-ink-subtle font-semibold">Live Events</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-brand-ink block">
                16
              </span>
              <span className="text-xs text-brand-ink-subtle font-semibold">Global Destinations</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-brand-blue block">
                300+
              </span>
              <span className="text-xs text-brand-ink-subtle font-semibold">Verified Attendees</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-brand-ink block">
                99.8%
              </span>
              <span className="text-xs text-brand-ink-subtle font-semibold">Check-in Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Quick Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">
              Browse Categories
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-ink">
              Find What Ignites Your Passion
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/events?category=${cat.slug}`}
              className="p-5 rounded-3xl bg-white border border-brand-beige card-hover-effect flex flex-col justify-between group shadow-brand"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-ink group-hover:text-brand-blue transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-brand-ink-subtle font-semibold mt-0.5 block">
                  {cat.eventCount} Events
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Curated Highlights */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider block mb-1 bg-brand-ink px-3 py-1 rounded-full w-max">
                Editor's Choice
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-ink mt-2">
                Featured World Summits & Experiences
              </h2>
            </div>
            <Link
              to="/events?sort=popularity"
              className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1 group"
            >
              <span>See More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.slice(0, 6).map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Trending & Upcoming Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">
              Top Trending
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-ink">
              Popular Live Gatherings This Season
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1 group"
          >
            <span>All Gatherings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingEvents.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      </section>

      {/* 5. Organizer Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-ink text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-brand-ink">
          {/* Subtle decorative circles */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none" />
          <div className="absolute right-40 top-0 w-60 h-60 rounded-full bg-brand-yellow/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-yellow text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Event Creator Infrastructure
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Host Your Next Sold-Out Event with Planora.
            </h2>

            <p className="text-sm sm:text-base text-brand-ivory/80 leading-relaxed">
              Create tiered tickets, customize agendas, stream virtual stages, prevent ticket fraud with QR validation, and track real-time revenue analytics.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/events/create"
                className="px-7 py-3.5 rounded-2xl bg-brand-yellow text-brand-ink font-bold text-sm hover:bg-brand-yellow-hover shadow-sun transition-all flex items-center gap-2"
              >
                <span>Create an Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/organizer/dashboard"
                className="px-7 py-3.5 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
              >
                Explore Organizer Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
