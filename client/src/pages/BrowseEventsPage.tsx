import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Frown,
} from 'lucide-react';
import api from '../lib/api';
import { EventItem, Category } from '../types';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';

export const BrowseEventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state synced with URL searchParams
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const format = searchParams.get('format') || 'all';
  const price = searchParams.get('price') || 'all';
  const dateRange = searchParams.get('dateRange') || 'upcoming';
  const city = searchParams.get('city') || 'all';
  const sort = searchParams.get('sort') || 'date_asc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories once
  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    });
  }, []);

  // Fetch events whenever filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search,
          category,
          format,
          price,
          dateRange,
          city,
          sort,
          page: page.toString(),
          limit: '12',
        });

        const res = await api.get(`/events?${queryParams.toString()}`);
        if (res.data.success) {
          setEvents(res.data.data.events || []);
          setTotalPages(res.data.data.pagination?.totalPages || 1);
          setTotalCount(res.data.data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, format, price, dateRange, city, sort, page]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '' || (key === 'page' && value === '1')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige pb-6">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink tracking-tight">
            Explore Events & Gatherings
          </h1>
          <p className="text-xs sm:text-sm text-brand-ink-muted mt-1">
            Showing <strong className="text-brand-ink">{totalCount}</strong> verified experiences
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl border transition-all ${
              viewMode === 'grid'
                ? 'bg-brand-blue text-white border-brand-blue shadow-cobalt'
                : 'bg-white text-brand-ink border-brand-beige hover:bg-brand-beige'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl border transition-all ${
              viewMode === 'list'
                ? 'bg-brand-blue text-white border-brand-blue shadow-cobalt'
                : 'bg-white text-brand-ink border-brand-beige hover:bg-brand-beige'
            }`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Event Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <EventFilters
            categories={categories}
            selectedCategory={category}
            onSelectCategory={(val) => updateParam('category', val)}
            search={search}
            onSearchChange={(val) => updateParam('search', val)}
            format={format}
            onFormatChange={(val) => updateParam('format', val)}
            price={price}
            onPriceChange={(val) => updateParam('price', val)}
            dateRange={dateRange}
            onDateRangeChange={(val) => updateParam('dateRange', val)}
            city={city}
            onCityChange={(val) => updateParam('city', val)}
            sort={sort}
            onSortChange={(val) => updateParam('sort', val)}
            onReset={handleReset}
          />
        </div>

        {/* Events Grid / List */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-brand-beige p-4 space-y-4 animate-pulse h-80"
                >
                  <div className="w-full h-44 bg-brand-beige/40 rounded-2xl" />
                  <div className="w-3/4 h-4 bg-brand-beige/50 rounded" />
                  <div className="w-1/2 h-3 bg-brand-beige/30 rounded" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-3xl border border-brand-beige p-16 text-center shadow-brand space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center mx-auto text-brand-ink">
                <Frown className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-brand-ink">No Events Found</h3>
              <p className="text-xs text-brand-ink-muted max-w-sm mx-auto">
                No active events matched your combination of filters. Try broadening your search or resetting all filters.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue-hover shadow-cobalt"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {events.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 border-t border-brand-beige">
              <button
                onClick={() => updateParam('page', Math.max(1, page - 1).toString())}
                disabled={page <= 1}
                className="p-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink hover:bg-brand-beige disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-brand-ink">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => updateParam('page', Math.min(totalPages, page + 1).toString())}
                disabled={page >= totalPages}
                className="p-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink hover:bg-brand-beige disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
