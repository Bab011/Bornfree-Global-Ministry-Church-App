import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { EVENT_CATEGORIES } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { submitEventRegistration, subscribePublishedEvents } from '@/src/services/firestoreService';
import { MinistryEvent } from '@/src/types/ministry';
import { downloadIcsEvent } from '@/src/utils/serviceSchedule';
import { isSafeHttpUrl } from '@/src/utils/media';
import { Link } from 'react-router-dom';
import { BORNFREE_PHOTOS, HighlighterSwipe } from '@/src/components/EditorialUI';

export const EventsPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<MinistryEvent | null>(null);

  // Registration state
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [attendanceMode, setAttendanceMode] = useState<'In Person' | 'Online'>('In Person');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    return subscribePublishedEvents(setEvents);
  }, []);

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'All') return events;
    return events.filter((e) => e.category === categoryFilter);
  }, [events, categoryFilter]);

  const handleAddEventCalendar = (ev: MinistryEvent) => {
    const startGuess = new Date(`${ev.date}T09:00:00Z`);
    const validStart = Number.isNaN(startGuess.getTime()) ? new Date() : startGuess;
    const validEnd = new Date(validStart.getTime() + 2 * 60 * 60 * 1000);
    downloadIcsEvent({
      title: ev.title,
      description: `${ev.theme ? `Theme: ${ev.theme}. ` : ''}${ev.description}`,
      location: ev.venue,
      startUtc: validStart,
      endUtc: validEnd,
      filename: `${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegError(null);
    if (!consentGiven) {
      setRegError('Please confirm your consent to complete event registration.');
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitEventRegistration({
        eventId: selectedEvent.id,
        fullName,
        email,
        phone,
        country,
        city,
        attendanceMode,
        consentGiven,
      });
      setRegSuccess(id);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Unable to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="bg-white border border-[#151515]/12 overflow-hidden rounded-[2px]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-6 md:p-8 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-normal text-[#6B6A67]">
                Gatherings, Conventions & Outreaches
              </p>
              <HighlighterSwipe
                highlight="Events"
                rest="& Ministry Programmes"
                as="h1"
                className="text-3xl sm:text-4xl"
              />
              <p className="text-sm text-[#6B6A67] max-w-2xl">
                Discover upcoming conventions, conferences, crusades, outreach programmes, and special prayer gatherings.
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', ...EVENT_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`btn-press px-3.5 py-2 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                    categoryFilter === cat
                      ? 'bg-[#151515] text-white'
                      : 'bg-[#F0F0EE] text-[#151515] hover:bg-[#E9DFC6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#151515]">
            <img
              src={BORNFREE_PHOTOS.convention2026}
              alt="Bornfree Global Ministry convention and gatherings"
              className="w-full h-52 lg:h-full object-cover object-center"
            />
          </div>
        </div>
      </header>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-[#151515]/12 p-8 text-center space-y-3 rounded-[2px]">
          <CalendarDays className="w-8 h-8 text-[#151515] mx-auto" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#151515]">No upcoming events published</p>
          <p className="text-xs text-[#6B6A67] max-w-md mx-auto">
            Event administrators can create and publish conventions, conferences, and outreach programmes from the Administrative Dashboard. Meanwhile, join our weekly Wednesday and Sunday services.
          </p>
          <div className="pt-2 flex justify-center gap-5 text-xs font-semibold text-[#151515]">
            <Link to="/services/wednesday" className="hover:underline">
              Wednesday Service
            </Link>
            <Link to="/services/sunday" className="hover:underline">
              Sunday Service
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((ev) => (
            <article
              key={ev.id}
              onClick={() => {
                setSelectedEvent(ev);
                setRegSuccess(null);
                setRegError(null);
              }}
              className="cursor-pointer bg-white border border-[#151515]/12 overflow-hidden hover:border-[#151515]/50 transition-colors flex flex-col justify-between rounded-[2px]"
            >
              <div>
                {ev.bannerUrl && isSafeHttpUrl(ev.bannerUrl) ? (
                  <div className="relative h-52 w-full bg-[#151515]">
                    <img
                      src={ev.bannerUrl}
                      alt={ev.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#151515]/80 px-5 py-2.5 flex items-center justify-between text-xs font-normal text-[#E5E5E2] tabular-nums">
                      <span>{ev.category}</span>
                      <span>{ev.date}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#151515] text-white px-6 py-5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#FCDC00] tabular-nums">
                      <span>{ev.category}</span>
                      <span>{ev.date}</span>
                    </div>
                    <h2 className="font-display font-light text-2xl text-white leading-snug">
                      {ev.title}
                    </h2>
                    {ev.theme && (
                      <p className="text-xs font-normal text-[#A3A19D]">Theme: {ev.theme}</p>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-3">
                  {ev.bannerUrl && isSafeHttpUrl(ev.bannerUrl) && (
                    <div className="space-y-1">
                      <h2 className="font-display font-normal text-2xl text-[#151515] leading-snug">
                        {ev.title}
                      </h2>
                      {ev.theme && (
                        <p className="text-xs font-medium text-[#6B6A67]">Theme: {ev.theme}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-[#151515]">
                    <p className="flex items-center gap-2 tabular-nums font-medium">
                      <Clock className="w-4 h-4 text-[#151515] shrink-0" strokeWidth={1.5} />
                      <span>
                        {ev.date} · {ev.startTime}
                        {ev.endTime ? ` – ${ev.endTime}` : ''}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-[#6B6A67]">
                      <MapPin className="w-4 h-4 text-[#151515] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{ev.venue}</span>
                    </p>
                    {ev.guestMinisters && (
                      <p className="flex items-start gap-2 text-[#6B6A67]">
                        <Users className="w-4 h-4 text-[#151515] shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{ev.guestMinisters}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#F0F0EE] border-t border-[#151515]/12 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddEventCalendar(ev);
                  }}
                  className="btn-press inline-flex items-center gap-1.5 rounded-[2px] bg-white border border-[#151515]/15 px-3.5 py-2 text-xs font-medium text-[#151515] hover:bg-[#E9DFC6] min-h-[40px]"
                >
                  <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Add to Calendar</span>
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#FCDC00] px-4 py-2 text-xs font-semibold text-[#151515] min-h-[40px]">
                  <span>{ev.registrationEnabled ? 'Register & Details' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Event Details & Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151515]/80 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#151515]/20 overflow-hidden my-8 rounded-[2px]">
            <div className="bg-[#151515] text-white px-6 py-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#FCDC00] tabular-nums">
                  {selectedEvent.category} · {selectedEvent.date}
                </p>
                <h2 className="font-display font-light text-2xl text-white">
                  {selectedEvent.title}
                </h2>
                {selectedEvent.theme && (
                  <p className="text-sm font-normal text-[#A3A19D]">
                    Theme: {selectedEvent.theme}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
                className="w-10 h-10 rounded-[2px] bg-white text-[#151515] hover:bg-[#FCDC00] flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {selectedEvent.bannerUrl && isSafeHttpUrl(selectedEvent.bannerUrl) && (
                <img
                  src={selectedEvent.bannerUrl}
                  alt={selectedEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-52 object-cover rounded-[2px]"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#151515] bg-[#F0F0EE] p-4 border border-[#151515]/12 rounded-[2px]">
                <div className="flex items-center gap-2 tabular-nums font-medium">
                  <Clock className="w-4 h-4 text-[#151515]" strokeWidth={1.5} />
                  <span>
                    {selectedEvent.startTime}
                    {selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#151515] shrink-0" strokeWidth={1.5} />
                  <span>{selectedEvent.venue}</span>
                </div>
                {selectedEvent.guestMinisters && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Users className="w-4 h-4 text-[#151515] shrink-0" strokeWidth={1.5} />
                    <span>Ministers: {selectedEvent.guestMinisters}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-[#151515] leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>

              {selectedEvent.contactInfo && (
                <p className="text-xs text-[#6B6A67] font-medium">
                  Contact: {selectedEvent.contactInfo}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAddEventCalendar(selectedEvent)}
                  className="btn-press inline-flex items-center gap-2 rounded-[2px] border border-[#151515]/20 bg-white px-4 py-2.5 text-xs font-medium text-[#151515] hover:bg-[#F0F0EE] min-h-[44px]"
                >
                  <CalendarPlus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Add to Calendar</span>
                </button>
              </div>

              {selectedEvent.registrationEnabled && (
                <div className="pt-4 border-t border-[#151515]/12 space-y-4">
                  <h3 className="font-display font-normal text-xl text-[#151515]">
                    Event Registration
                  </h3>

                  {regSuccess ? (
                    <div className="bg-[#F0F0EE] border border-[#151515]/12 p-5 space-y-1.5 rounded-[2px]">
                      <div className="flex items-center gap-2 font-medium text-sm text-[#151515]">
                        <CheckCircle2 className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
                        <span>Registration Confirmed</span>
                      </div>
                      <p className="text-xs text-[#6B6A67]">
                        Confirmation ID: <span className="font-mono text-[#151515]">{regSuccess}</span>. We look forward to welcoming you!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                      {regError && (
                        <div className="rounded-[2px] bg-red-50 border border-red-300 p-3 text-xs text-red-800">
                          {regError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full Name *"
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address *"
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone (optional)"
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        />
                        <select
                          value={attendanceMode}
                          onChange={(e) =>
                            setAttendanceMode(e.target.value as 'In Person' | 'Online')
                          }
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        >
                          <option value="In Person">Attending In Person</option>
                          <option value="Online">Attending Online</option>
                        </select>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country (optional)"
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City (optional)"
                          className="rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#151515] focus:outline-none min-h-[44px]"
                        />
                      </div>

                      <label className="flex items-start gap-2 text-xs text-[#6B6A67] cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                          className="mt-0.5 accent-[#151515]"
                        />
                        <span>
                          I consent to Bornfree Global Ministry processing my registration details for event coordination and reminders.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-press rounded-[2px] bg-[#FCDC00] px-5 py-2.5 text-sm font-semibold text-[#151515] hover:bg-[#ffe32e] min-h-[44px] disabled:opacity-60"
                      >
                        {submitting ? 'Registering...' : 'Complete Registration'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
