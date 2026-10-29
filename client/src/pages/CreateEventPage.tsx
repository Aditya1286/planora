import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Plus,
  Trash2,
  Check,
  Save,
  AlertCircle,
  Upload,
} from 'lucide-react';
import api from '../lib/api';
import { Category, Venue } from '../types';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    format: 'in-person' as 'in-person' | 'online' | 'hybrid',
    onlineUrl: '',
    venueId: '',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    startDate: '',
    endDate: '',
    timezone: 'America/New_York',
    capacity: 250,
    visibility: 'public' as 'public' | 'private',
    status: 'published' as 'published' | 'draft',
    tags: ['Summit', 'Networking', 'Innovation'],
    ticketTypes: [
      {
        name: 'Early Bird Pass',
        description: 'Discounted access for early registrations',
        price: 49,
        totalQuantity: 75,
        perUserLimit: 4,
      },
      {
        name: 'General Admission',
        description: 'Full pass to all main stage sessions and exhibitions',
        price: 99,
        totalQuantity: 150,
        perUserLimit: 5,
      },
      {
        name: 'VIP All-Access Pass',
        description: 'Priority seating, speaker lounge access, and evening dinner',
        price: 249,
        totalQuantity: 25,
        perUserLimit: 2,
      },
    ],
    sessions: [
      {
        title: 'Opening Keynote & Strategic Vision',
        description: 'Setting the stage for the conference agenda.',
        track: 'Main Auditorium',
        startTime: '',
        endTime: '',
        speakerNames: ['Dr. Sarah Jenkins'],
      },
    ],
    speakers: [
      {
        name: 'Dr. Sarah Jenkins',
        role: 'Keynote Speaker & AI Research Fellow',
        company: 'Synthetica AI',
        bio: 'Leading researcher in neuro-symbolic systems.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      },
    ],
    sponsors: [
      {
        name: 'Planora Ventures',
        tier: 'Platinum' as const,
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Planora',
      },
    ],
  });

  // Load Categories & Venues
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/venues')]).then(([catRes, venRes]) => {
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
        if (catRes.data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data.data[0]._id }));
        }
      }
      if (venRes.data.success) {
        setVenues(venRes.data.data || []);
        if (venRes.data.data.length > 0 && !formData.venueId) {
          setFormData((prev) => ({ ...prev, venueId: venRes.data.data[0]._id }));
        }
      }
    });

    // Check localStorage autosave draft
    const saved = localStorage.getItem('planora_draft_event');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    localStorage.setItem('planora_draft_event', JSON.stringify(formData));
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: 'Custom Tier',
          description: '',
          price: 50,
          totalQuantity: 50,
          perUserLimit: 4,
        },
      ],
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const updateTicketType = (index: number, field: string, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.ticketTypes];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, ticketTypes: updated };
    });
  };

  const addSession = () => {
    setFormData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          title: 'Breakout Session',
          description: '',
          track: 'Track B',
          startTime: prev.startDate,
          endTime: prev.endDate,
          speakerNames: [],
        },
      ],
    }));
  };

  const removeSession = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (publishStatus: 'published' | 'draft') => {
    setError(null);
    setSubmitting(true);

    try {
      // Validate dates
      const start = formData.startDate ? new Date(formData.startDate) : new Date(Date.now() + 86400000 * 14);
      const end = formData.endDate ? new Date(formData.endDate) : new Date(start.getTime() + 86400000);

      const payload = {
        ...formData,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        status: publishStatus,
        sessions: formData.sessions.map((s) => ({
          ...s,
          startTime: s.startTime ? new Date(s.startTime).toISOString() : start.toISOString(),
          endTime: s.endTime ? new Date(s.endTime).toISOString() : end.toISOString(),
        })),
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        localStorage.removeItem('planora_draft_event');
        navigate(`/events/${res.data.data.slug}`);
      } else {
        setError(res.data.message || 'Error publishing event');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Validation error while creating event. Please review required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Autosave status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider block mb-1">
            Creation Wizard
          </span>
          <h1 className="font-display font-black text-3xl text-brand-ink">
            Create a New Experience
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="text-xs text-brand-ink-subtle flex items-center gap-1 font-semibold animate-in fade-in">
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              Draft Autosaved
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={submitting || !formData.title}
            className="px-4 py-2 rounded-xl border border-brand-beige bg-white text-xs font-bold text-brand-ink hover:bg-brand-beige transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* Steps Progress Indicator */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { num: 1, label: 'Basics' },
          { num: 2, label: 'Date & Location' },
          { num: 3, label: 'Tickets' },
          { num: 4, label: 'Schedule' },
          { num: 5, label: 'Review & Publish' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`p-3 rounded-2xl text-left border transition-all ${
              step === s.num
                ? 'border-brand-blue bg-brand-blue/5 shadow-sm ring-1 ring-brand-blue'
                : step > s.num
                ? 'border-brand-beige bg-white text-emerald-700'
                : 'border-brand-beige/50 bg-white/50 text-brand-ink-subtle'
            }`}
          >
            <span className="text-[10px] font-bold block uppercase tracking-wider">Step 0{s.num}</span>
            <span className="text-xs font-bold text-brand-ink truncate block">{s.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
          <h3 className="font-display font-bold text-xl text-brand-ink border-b border-brand-beige/60 pb-3">
            Step 1: Event Fundamentals
          </h3>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Pacific Northwest Design Conclave 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-sm font-bold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Format *
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              >
                <option value="in-person">In-Person Experience</option>
                <option value="online">Virtual / Online Live Stage</option>
                <option value="hybrid">Hybrid (Both In-Person & Streaming)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
              Short Hook / Elevator Pitch (1-2 sentences)
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="A high-impact gathering uniting leaders, practitioners, and creators..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
              Detailed Description & Highlights *
            </label>
            <textarea
              rows={6}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the themes, schedule format, keynote speakers, networking galas, and attendee perks..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-beige bg-white text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
              Cover Image URL *
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-brand-beige bg-white text-xs"
            />
            {formData.coverImage && (
              <div className="mt-2 aspect-video max-w-sm rounded-2xl overflow-hidden border border-brand-beige">
                <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Date, Time & Venue */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
          <h3 className="font-display font-bold text-xl text-brand-ink border-b border-brand-beige/60 pb-3">
            Step 2: Dates, Timezone & Venue
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              >
                <option value="America/New_York">Eastern Time (America/New_York)</option>
                <option value="America/Chicago">Central Time (America/Chicago)</option>
                <option value="America/Denver">Mountain Time (America/Denver)</option>
                <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                <option value="Europe/London">London (GMT / BST)</option>
                <option value="Europe/Paris">Paris / Berlin (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Total Venue Capacity *
              </label>
              <input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 100 })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {formData.format !== 'online' && (
            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Select Host Venue
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-semibold"
              >
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.city}, {v.country}) — Cap: {v.capacity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.format !== 'in-person' && (
            <div>
              <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1.5">
                Virtual Broadcast URL / Stream Link
              </label>
              <input
                type="url"
                value={formData.onlineUrl}
                onChange={(e) => setFormData({ ...formData, onlineUrl: e.target.value })}
                placeholder="https://meet.planora.dev/live-stage"
                className="w-full px-3 py-2.5 rounded-xl border border-brand-beige bg-white text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Ticket Types */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
          <div className="flex items-center justify-between border-b border-brand-beige/60 pb-3">
            <div>
              <h3 className="font-display font-bold text-xl text-brand-ink">
                Step 3: Ticket Tiers & Pricing
              </h3>
              <p className="text-xs text-brand-ink-muted">Set up free, general admission, or VIP tiers.</p>
            </div>

            <button
              type="button"
              onClick={addTicketType}
              className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.ticketTypes.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-brand-blue">
                    Tier #{idx + 1}
                  </span>
                  {formData.ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Tier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={tier.name}
                      onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                      placeholder="e.g. VIP All-Access"
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) => updateTicketType(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Tier Description / Included Perks
                    </label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => updateTicketType(idx, 'description', e.target.value)}
                      placeholder="Full day pass, catered lunch, speaker lounge access..."
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={tier.totalQuantity}
                      onChange={(e) => updateTicketType(idx, 'totalQuantity', parseInt(e.target.value, 10) || 50)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Limit Per User
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={tier.perUserLimit}
                      onChange={(e) => updateTicketType(idx, 'perUserLimit', parseInt(e.target.value, 10) || 4)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Agenda & Sessions */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
          <div className="flex items-center justify-between border-b border-brand-beige/60 pb-3">
            <div>
              <h3 className="font-display font-bold text-xl text-brand-ink">
                Step 4: Schedule & Tracks
              </h3>
              <p className="text-xs text-brand-ink-muted">Add sessions, panels, and keynote talks.</p>
            </div>

            <button
              type="button"
              onClick={addSession}
              className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Session</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.sessions.map((sess, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-beige space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-brand-blue">
                    Session #{idx + 1}
                  </span>
                  {formData.sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSession(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Session Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={sess.title}
                      onChange={(e) => {
                        const up = [...formData.sessions];
                        up[idx].title = e.target.value;
                        setFormData({ ...formData, sessions: up });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Track
                    </label>
                    <input
                      type="text"
                      value={sess.track}
                      onChange={(e) => {
                        const up = [...formData.sessions];
                        up[idx].track = e.target.value;
                        setFormData({ ...formData, sessions: up });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-ink-muted uppercase mb-1">
                      Speaker Names
                    </label>
                    <input
                      type="text"
                      value={sess.speakerNames?.join(', ') || ''}
                      onChange={(e) => {
                        const up = [...formData.sessions];
                        up[idx].speakerNames = e.target.value.split(',').map((s) => s.trim());
                        setFormData({ ...formData, sessions: up });
                      }}
                      placeholder="e.g. Dr. Sarah Jenkins, Marcus Vance"
                      className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Review & Publish */}
      {step === 5 && (
        <div className="bg-white rounded-3xl border border-brand-beige p-8 shadow-brand space-y-6">
          <h3 className="font-display font-bold text-xl text-brand-ink border-b border-brand-beige/60 pb-3">
            Step 5: Review Summary & Publish
          </h3>

          <div className="p-6 rounded-2xl bg-brand-ivory/60 border border-brand-beige space-y-4">
            <h4 className="font-bold text-base text-brand-ink">{formData.title || 'Untitled Gathering'}</h4>
            <p className="text-xs text-brand-ink-muted leading-relaxed">
              {formData.shortDescription || formData.description || 'No description provided'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <span className="text-brand-ink-subtle block">Format</span>
                <span className="font-bold text-brand-ink uppercase">{formData.format}</span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Capacity</span>
                <span className="font-bold text-brand-ink">{formData.capacity} Attendees</span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Tiers</span>
                <span className="font-bold text-brand-ink">{formData.ticketTypes.length} Ticket Tiers</span>
              </div>
              <div>
                <span className="text-brand-ink-subtle block">Sessions</span>
                <span className="font-bold text-brand-ink">{formData.sessions.length} Scheduled</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>
              Your event is ready to be published and immediately discoverable by attendees worldwide.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={submitting}
              className="px-6 py-3 rounded-2xl border border-brand-beige bg-white text-xs font-bold text-brand-ink hover:bg-brand-beige"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={submitting || !formData.title}
              className="px-8 py-3.5 rounded-2xl bg-brand-blue text-white font-extrabold text-sm hover:bg-brand-blue-hover shadow-cobalt flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <span>{submitting ? 'Publishing...' : 'Publish Live Event'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Wizard Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-6 py-2.5 rounded-xl border border-brand-beige bg-white text-xs font-bold text-brand-ink hover:bg-brand-beige flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
