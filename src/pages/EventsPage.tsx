import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, CheckCircle2, Clock, MapPin, Users, X } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { submitEventRegistration, subscribePublishedEvents } from '@/src/services/firestoreService';
import { MinistryEvent } from '@/src/types/ministry';
import { downloadIcsEvent } from '@/src/utils/serviceSchedule';
import { isSafeHttpUrl } from '@/src/utils/media';
import { Link } from 'react-router-dom';

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
    <div className="space-y-6">
      <header className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#26364A]">Gatherings, Conventions & Outreaches</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">
            Events & Ministry Programmes
          </h1>
          <p className="text-sm text-[#68717D] max-w-2xl">
            Discover upcoming conventions, conferences, crusades, outreach programmes, and special prayer gatherings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', ...EVENT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                categoryFilter === cat
                  ? 'bg-[#26364A] text-white'
                  : 'bg-[#F4F2EC] text-[#252B33] hover:bg-[#E5E7EB]/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-8 text-center space-y-2">
          <CalendarDays className="w-8 h-8 text-[#26364A] mx-auto" />
          <p className="text-sm font-semibold text-[#252B33]">No upcoming events published</p>
          <p className="text-xs text-[#68717D] max-w-md mx-auto">
            Event administrators can create and publish conventions, conferences, and outreach programmes from the Administrative Dashboard. Meanwhile, join our weekly Wednesday and Sunday services.
          </p>
          <div className="pt-2 flex justify-center gap-4 text-xs font-semibold text-[#26364A]">
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
              className="cursor-pointer rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#26364A]/45 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Luma-inspired Event Banner */}
                {ev.bannerUrl && isSafeHttpUrl(ev.bannerUrl) ? (
                  <div className="relative h-48 w-full bg-[#26364A]">
                    <img
                      src={ev.bannerUrl}
                      alt={ev.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1D2939]/85 via-[#1D2939]/20 to-transparent" />
                    <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs font-semibold text-[#E5E7EB] tabular-nums">
                      <span>{ev.category}</span>
                      <span>{ev.date}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#26364A] text-white px-6 py-5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#B99A55] tabular-nums">
                      <span>{ev.category}</span>
                      <span>{ev.date}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white leading-snug">{ev.title}</h2>
                    {ev.theme && (
                      <p className="text-xs font-medium text-[#E5E7EB]/85">Theme: {ev.theme}</p>
                    )}
                  </div>
                )}

                {/* Event Organised Metadata */}
                <div className="p-6 space-y-3">
                  {ev.bannerUrl && isSafeHttpUrl(ev.bannerUrl) && (
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-[#26364A] leading-snug">{ev.title}</h2>
                      {ev.theme && (
                        <p className="text-xs font-semibold text-[#68717D]">Theme: {ev.theme}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-[#252B33]">
                    <p className="flex items-center gap-2 tabular-nums font-medium">
                      <Clock className="w-4 h-4 text-[#26364A] shrink-0" />
                      <span>
                        {ev.date} · {ev.startTime}
                        {ev.endTime ? ` – ${ev.endTime}` : ''}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-[#68717D]">
                      <MapPin className="w-4 h-4 text-[#26364A] shrink-0 mt-0.5" />
                      <span>{ev.venue}</span>
                    </p>
                    {ev.guestMinisters && (
                      <p className="flex items-start gap-2 text-[#68717D]">
                        <Users className="w-4 h-4 text-[#26364A] shrink-0 mt-0.5" />
                        <span>{ev.guestMinisters}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="px-6 py-4 bg-[#F4F2EC]/80 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddEventCalendar(ev);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#E5E7EB] px-3.5 py-2 text-xs font-semibold text-[#252B33] hover:bg-[#E5E7EB]/50 min-h-[40px]"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-[#26364A]" />
                  <span>Add to Calendar</span>
                </button>
                <span className="inline-flex items-center rounded-lg bg-[#B99A55] px-4 py-2 text-xs font-semibold text-[#1D2939] hover:bg-[#c5a764] min-h-[40px]">
                  {ev.registrationEnabled ? 'Register & Details →' : 'View Details →'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Event Details & Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2939]/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden shadow-lg my-8">
            <div className="bg-[#26364A] text-white px-6 py-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#B99A55] tabular-nums">
                  {selectedEvent.category} · {selectedEvent.date}
                </p>
                <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                {selectedEvent.theme && (
                  <p className="text-sm font-medium text-[#E5E7EB]/85">
                    Theme: {selectedEvent.theme}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
                className="p-2 text-[#E5E7EB]/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {selectedEvent.bannerUrl && isSafeHttpUrl(selectedEvent.bannerUrl) && (
                <img
                  src={selectedEvent.bannerUrl}
                  alt={selectedEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-52 object-cover rounded-xl"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#252B33] bg-[#F4F2EC] rounded-xl p-4 border border-[#E5E7EB]">
                <div className="flex items-center gap-2 tabular-nums font-medium">
                  <Clock className="w-4 h-4 text-[#26364A]" />
                  <span>
                    {selectedEvent.startTime}
                    {selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#26364A] shrink-0" />
                  <span>{selectedEvent.venue}</span>
                </div>
                {selectedEvent.guestMinisters && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Users className="w-4 h-4 text-[#26364A] shrink-0" />
                    <span>Ministers: {selectedEvent.guestMinisters}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-[#252B33] leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>

              {selectedEvent.contactInfo && (
                <p className="text-xs text-[#68717D] font-medium">
                  Contact: {selectedEvent.contactInfo}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAddEventCalendar(selectedEvent)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#252B33] hover:bg-[#F4F2EC] min-h-[44px]"
                >
                  <CalendarPlus className="w-4 h-4 text-[#26364A]" />
                  <span>Add to Calendar</span>
                </button>
              </div>

              {selectedEvent.registrationEnabled && (
                <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
                  <h3 className="text-base font-semibold text-[#26364A]">Event Registration</h3>

                  {regSuccess ? (
                    <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-[#26364A]">
                        <CheckCircle2 className="w-5 h-5 text-[#B99A55]" />
                        <span>Registration Confirmed</span>
                      </div>
                      <p className="text-xs text-[#68717D]">
                        Confirmation ID: <span className="font-mono text-[#252B33]">{regSuccess}</span>. We look forward to welcoming you!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                      {regError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
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
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address *"
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone (optional)"
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        />
                        <select
                          value={attendanceMode}
                          onChange={(e) =>
                            setAttendanceMode(e.target.value as 'In Person' | 'Online')
                          }
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        >
                          <option value="In Person">Attending In Person</option>
                          <option value="Online">Attending Online</option>
                        </select>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country (optional)"
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City (optional)"
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                        />
                      </div>

                      <label className="flex items-start gap-2 text-xs text-[#68717D] cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                          className="mt-0.5 accent-[#26364A]"
                        />
                        <span>
                          I consent to Bornfree Global Ministry processing my registration details for event coordination and reminders.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-[#B99A55] px-5 py-2.5 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] min-h-[44px] disabled:opacity-60"
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
