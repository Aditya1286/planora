import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand-yellow/20 text-brand-ink flex items-center justify-center mx-auto shadow-sun">
        <Compass className="w-10 h-10 text-brand-blue animate-pulse" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-ink">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-brand-ink-muted max-w-md mx-auto leading-relaxed">
        The destination or event you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Planora Home</span>
      </Link>
    </div>
  );
};
