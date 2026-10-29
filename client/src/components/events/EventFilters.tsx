import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Category } from '../../types';

interface EventFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  format: string;
  onFormatChange: (fmt: string) => void;
  price: string;
  onPriceChange: (pr: string) => void;
  dateRange: string;
  onDateRangeChange: (dr: string) => void;
  city: string;
  onCityChange: (c: string) => void;
  sort: string;
  onSortChange: (s: string) => void;
  onReset: () => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  format,
  onFormatChange,
  price,
  onPriceChange,
  dateRange,
  onDateRangeChange,
  city,
  onCityChange,
  sort,
  onSortChange,
  onReset,
}) => {
  const cities = ['All Cities', 'New York', 'San Francisco', 'Austin', 'London', 'Berlin', 'Paris', 'Tokyo', 'Toronto', 'Chicago', 'Sydney', 'Seattle', 'Denver'];

  return (
    <div className="bg-white rounded-3xl border border-brand-beige p-6 shadow-brand space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-blue" />
          <h3 className="font-display font-bold text-lg text-brand-ink">Filters & Search</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-brand-ink-subtle hover:text-brand-blue flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
          Search Keywords
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, topic, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-beige bg-brand-ivory/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Categories Horizontal Chips */}
      <div>
        <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-blue text-white shadow-cobalt'
                : 'bg-brand-ivory text-brand-ink hover:bg-brand-beige'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedCategory === cat.slug
                  ? 'bg-brand-blue text-white shadow-cobalt'
                  : 'bg-brand-ivory text-brand-ink hover:bg-brand-beige'
              }`}
            >
              <span>{cat.name}</span>
              {cat.eventCount > 0 && (
                <span className="text-[10px] opacity-75 font-normal">({cat.eventCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Format & Price Options */}
      <div className="grid grid-cols-2 gap-4">
        {/* Format */}
        <div>
          <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
            Event Format
          </label>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory/50 text-xs font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Formats</option>
            <option value="in-person">In-Person Only</option>
            <option value="online">Virtual / Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
            Price Type
          </label>
          <select
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory/50 text-xs font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>
      </div>

      {/* Date Range & City */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
            When
          </label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory/50 text-xs font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this_weekend">This Weekend</option>
            <option value="this_month">This Month</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
            City / Destination
          </label>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory/50 text-xs font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            {cities.map((c) => (
              <option key={c} value={c === 'All Cities' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sorting */}
      <div>
        <label className="block text-xs font-bold text-brand-ink-muted uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory/50 text-xs font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        >
          <option value="date_asc">Date: Upcoming First</option>
          <option value="date_desc">Date: Latest First</option>
          <option value="popularity">Popularity / Capacity</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
