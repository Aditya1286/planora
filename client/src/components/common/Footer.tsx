import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-brand-ivory border-t border-brand-ink/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand-blue flex items-center justify-center text-brand-yellow font-display font-black text-lg">
                P
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-white">
                Planora<span className="text-brand-yellow">.</span>
              </span>
            </Link>
            <p className="text-xs text-brand-ivory/70 leading-relaxed">
              Planora is the modern end-to-end event infrastructure platform connecting world-class organizers with passionate attendees across the globe.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-yellow">
              <Sparkles className="w-4 h-4" />
              <span>Full-Stack & Production Ready</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-brand-ivory/80">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=technology-ai" className="hover:text-white transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/events?category=music-festivals" className="hover:text-white transition-colors">
                  Music & Festivals
                </Link>
              </li>
              <li>
                <Link to="/events?category=design-creative" className="hover:text-white transition-colors">
                  Design & Creative
                </Link>
              </li>
              <li>
                <Link to="/events?price=free" className="hover:text-white transition-colors">
                  Free Community Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-brand-yellow uppercase tracking-wider">
              For Organizers
            </h4>
            <ul className="space-y-2 text-xs text-brand-ivory/80">
              <li>
                <Link to="/events/create" className="hover:text-white transition-colors">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="hover:text-white transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition-colors">
                  Check-In Scanner
                </Link>
              </li>
              <li>
                <span className="text-brand-ivory/50">Ticket Tier Management</span>
              </li>
              <li>
                <span className="text-brand-ivory/50">Attendee Demographics</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Demo Mode */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Stay Informed
            </h4>
            <p className="text-xs text-brand-ivory/70 leading-relaxed">
              Subscribe for weekly digests of curated events and VIP ticket drops in your city.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-brand-yellow"
              />
              <button
                onClick={() => alert('Thank you for subscribing to Planora updates!')}
                className="px-3 py-2 rounded-xl bg-brand-yellow text-brand-ink text-xs font-bold hover:bg-brand-yellow-hover shrink-0"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-ivory/60">
          <p>© 2026 Planora Inc. All rights reserved. Crafted with care in warm beige, cobalt, and sun yellow.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
