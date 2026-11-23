import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  MapPin,
  Radio,
  HeartHandshake,
  PlayCircle,
  BookOpen,
  CalendarDays,
  UserPlus,
  MessageSquareHeart,
  ChevronRight,
  Clock,
  Megaphone,
} from 'lucide-react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  subscribeAppSettings,
  subscribePublishedAnnouncements,
  subscribePublishedDevotionals,
  subscribePublishedEvents,
  subscribePublishedSermons,
} from '@/src/services/firestoreService';
import { Announcement, AppSettings, Devotional, MinistryEvent, Sermon } from '@/src/types/ministry';
import { downloadIcsEvent, getDirectionsUrl, getNextWorshipService } from '@/src/utils/serviceSchedule';
import { isSafeHttpUrl } from '@/src/utils/media';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';

export const HomePage: React.FC = () => {
  const { isSignedIn, profile, user } = useAuth();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs = [
      subscribePublishedSermons((items) => {
        setSermons(items);
        setLoading(false);
      }),
      subscribePublishedDevotionals(setDevotionals),
      subscribePublishedEvents(setEvents),
      subscribePublishedAnnouncements(setAnnouncements),
      subscribeAppSettings(setSettings),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const nextService = useMemo(() => getNextWorshipService(), []);
  const latestSermon = sermons[0] || null;
  const latestDevotional = devotionals[0] || null;
  const nextEvent = events[0] || null;
  const latestAnnouncement = announcements[0] || null;

  const hasValidLivestream = Boolean(
    settings?.isLiveNow && settings?.livestreamUrl && isSafeHttpUrl(settings.livestreamUrl)
  );

  const firstName =
    profile?.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    null;

  const handleAddServiceToCalendar = () => {
    downloadIcsEvent({
      title: `Bornfree Global Ministry — ${nextService.title}`,
      description: `${MINISTRY_IDENTITY.motto}. Join us in Lagos or online.`,
      location: MINISTRY_IDENTITY.address,
      startUtc: nextService.startUtc,
      endUtc: nextService.endUtc,
      filename: `bornfree-${nextService.type}-service.ics`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner: Clean White Surface on Warm Ivory Canvas */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1.5 border border-[#E5E7EB] flex items-center justify-center shrink-0">
            <img
              src={MINISTRY_IDENTITY.logoUrl}
              alt="Bornfree Global Ministry Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#26364A] tracking-wide">
              {isSignedIn && firstName
                ? `Welcome back, ${firstName}`
                : 'Global Digital Sanctuary · Lagos, Nigeria'}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#26364A] leading-tight">
              Welcome to Bornfree Global Ministry
            </h1>
            <p className="text-sm md:text-base text-[#68717D] italic font-display">
              “{MINISTRY_IDENTITY.motto}”
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/new-here"
            className="inline-flex items-center justify-center rounded-lg bg-[#26364A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1D2939] transition-colors min-h-[44px] whitespace-nowrap"
          >
            New Here? Start Here
          </Link>
          <div className="sm:hidden">
            <PWAInstallButton />
          </div>
        </div>
      </section>

      {/* Next Worship Experience: Deep Slate Blue Focal Anchor */}
      <section
        aria-labelledby="next-service-heading"
        className="rounded-2xl bg-[#26364A] text-white p-6 md:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#E5E7EB]/85 tracking-[0.01em]">
              <span>Next Worship Experience</span>
              <span aria-hidden="true">·</span>
              <span>Official Nigerian Time (WAT, UTC+1)</span>
            </div>

            <h2
              id="next-service-heading"
              className="text-2xl md:text-3xl font-bold text-white tracking-[0.01em]"
            >
              {nextService.title}
            </h2>

            {nextService.theme && (
              <p className="text-sm font-semibold text-[#E5E7EB]">
                Theme: {nextService.theme}
              </p>
            )}

            <div className="space-y-2 text-sm text-[#F4F2EC] pt-1">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B99A55] shrink-0" />
                <span className="tabular-nums font-medium">
                  {nextService.dateLabelLagos} · {nextService.startTimeLagos} – {nextService.endTimeLagos} (Nigerian Time)
                </span>
              </div>

              {nextService.localEquivalentLabel && (
                <p className="pl-6 text-xs text-[#E5E7EB]/80 tabular-nums">
                  Your local time: {nextService.localEquivalentLabel}
                </p>
              )}

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B99A55] shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-[#E5E7EB]/85">
                  {MINISTRY_IDENTITY.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasValidLivestream && (
              <a
                href={settings!.livestreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#B99A55] px-5 py-2.5 text-sm font-bold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[44px] whitespace-nowrap"
              >
                <Radio className="w-4 h-4" />
                <span>WATCH LIVE</span>
              </a>
            )}

            <Link
              to={nextService.routePath}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] whitespace-nowrap ${
                hasValidLivestream
                  ? 'bg-[#1D2939] border border-white/15 text-white hover:bg-[#1D2939]/80'
                  : 'bg-[#B99A55] text-[#1D2939] hover:bg-[#c5a764]'
              }`}
            >
              <span>View Programme</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleAddServiceToCalendar}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D2939] border border-white/15 px-4 py-2.5 text-sm font-medium text-[#F4F2EC] hover:bg-[#1D2939]/80 transition-colors min-h-[44px] whitespace-nowrap"
            >
              <CalendarPlus className="w-4 h-4 text-[#B99A55]" />
              <span>Add to Calendar</span>
            </button>

            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D2939] border border-white/15 px-4 py-2.5 text-sm font-medium text-[#F4F2EC] hover:bg-[#1D2939]/80 transition-colors min-h-[44px] whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-[#B99A55]" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>

      {/* Quick-Access Shortcuts: Crisp White Tiles with Warm Ivory Icon Wells */}
      <section aria-labelledby="shortcuts-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="shortcuts-heading" className="text-lg md:text-xl font-semibold text-[#26364A]">
            Quick Access
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#26364A]">
            <Link to="/services/wednesday" className="hover:text-[#1D2939] hover:underline">
              Wednesday Service
            </Link>
            <Link to="/services/sunday" className="hover:text-[#1D2939] hover:underline">
              Sunday Service
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              to: '/prayer',
              label: 'Submit a Prayer Request',
              icon: HeartHandshake,
            },
            {
              to: '/discover',
              label: 'Watch Sermons',
              icon: PlayCircle,
            },
            {
              to: '/discover?tab=daily-word',
              label: 'Daily Word',
              icon: BookOpen,
            },
            {
              to: '/events',
              label: 'Upcoming Events',
              icon: CalendarDays,
            },
            {
              to: '/new-here',
              label: 'First Time Here?',
              icon: UserPlus,
            },
            {
              to: '/connect?section=pastor',
              label: 'Contact a Pastor',
              icon: MessageSquareHeart,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="group rounded-xl bg-white border border-[#E5E7EB] p-4 flex flex-col items-start justify-between gap-3 hover:border-[#26364A]/40 transition-colors min-h-[112px]"
              >
                <span className="w-10 h-10 rounded-lg bg-[#F4F2EC] flex items-center justify-center text-[#26364A] group-hover:bg-[#26364A] group-hover:text-[#B99A55] transition-colors">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm font-semibold text-[#252B33] leading-snug">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Daily Scripture Card: Clean Editorial White & Soft Grey Contrast */}
      <section aria-labelledby="daily-scripture-heading">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="daily-scripture-heading"
                className="text-lg md:text-2xl font-semibold text-[#26364A] tracking-[0.01em]"
              >
                Daily Scripture & Devotional
              </h2>
              <Link
                to="/discover?tab=daily-word"
                className="text-xs font-semibold text-[#26364A] hover:text-[#1D2939] hover:underline whitespace-nowrap"
              >
                Daily Word & Programmes
              </Link>
            </div>

            {latestDevotional ? (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[#68717D] tabular-nums">
                  <span>{latestDevotional.publishDate}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="text-[#26364A]">{latestDevotional.scriptureReference}</span>
                </div>
                <blockquote className="font-display text-lg md:text-2xl text-[#252B33] leading-relaxed border-l-2 border-[#B99A55] pl-4">
                  “{latestDevotional.bibleVerse}”
                </blockquote>
                <p className="text-sm text-[#68717D] leading-relaxed">
                  {latestDevotional.reflection}
                </p>
              </div>
            ) : (
              <div className="py-2 text-sm text-[#68717D] leading-relaxed">
                {loading
                  ? 'Loading daily scripture...'
                  : 'No daily scripture has been published yet. Authorised ministry administrators can publish today’s scripture, reflection, and prayer point from the Administrative Dashboard.'}
              </div>
            )}
          </div>

          {latestDevotional && (
            <div className="px-6 md:px-8 py-4 bg-[#F4F2EC]/80 border-t border-[#E5E7EB]">
              <p className="text-xs font-semibold text-[#26364A] mb-1">Prayer Point</p>
              <p className="text-sm text-[#252B33]">{latestDevotional.prayerPoint}</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Ministry Content Grid */}
      <section aria-labelledby="featured-heading" className="space-y-4">
        <h2 id="featured-heading" className="text-lg md:text-xl font-semibold text-[#26364A]">
          Featured Ministry Content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Sermon */}
          <article className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-2.5">
              <p className="text-xs font-semibold text-[#26364A]">Latest Sermon</p>
              {latestSermon ? (
                <>
                  <h3 className="text-lg font-semibold text-[#252B33] leading-snug">
                    {latestSermon.title}
                  </h3>
                  <p className="text-xs text-[#68717D] tabular-nums">
                    {latestSermon.minister} · {latestSermon.date}
                  </p>
                  {latestSermon.description && (
                    <p className="text-sm text-[#68717D] line-clamp-2">
                      {latestSermon.description}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#68717D] leading-relaxed">
                  No sermons published yet. Media administrators can upload video or audio teachings in the dashboard.
                </p>
              )}
            </div>
            <Link
              to="/discover"
              className="px-5 py-3.5 bg-[#F4F2EC]/75 border-t border-[#E5E7EB] inline-flex items-center justify-between text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/50 transition-colors"
            >
              <span>Explore Teachings</span>
              <ChevronRight className="w-4 h-4 text-[#26364A]" />
            </Link>
          </article>

          {/* Upcoming Convention / Conference */}
          <article className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-2.5">
              <p className="text-xs font-semibold text-[#26364A]">Upcoming Programme</p>
              {nextEvent ? (
                <>
                  <h3 className="text-lg font-semibold text-[#252B33] leading-snug">
                    {nextEvent.title}
                  </h3>
                  <p className="text-xs text-[#68717D] tabular-nums">
                    {nextEvent.category} · {nextEvent.date}
                  </p>
                  <p className="text-sm text-[#68717D] line-clamp-2">
                    {nextEvent.venue}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#68717D] leading-relaxed">
                  No upcoming special events published yet. Check back for conventions, crusades, and conferences.
                </p>
              )}
            </div>
            <Link
              to="/events"
              className="px-5 py-3.5 bg-[#F4F2EC]/75 border-t border-[#E5E7EB] inline-flex items-center justify-between text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/50 transition-colors"
            >
              <span>View Events</span>
              <ChevronRight className="w-4 h-4 text-[#26364A]" />
            </Link>
          </article>

          {/* Latest Ministry Announcement */}
          <article className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26364A]">
                <Megaphone className="w-3.5 h-3.5 text-[#B99A55]" />
                <span>Ministry Announcement</span>
              </div>
              {latestAnnouncement ? (
                <>
                  <h3 className="text-lg font-semibold text-[#252B33] leading-snug">
                    {latestAnnouncement.title}
                  </h3>
                  <p className="text-xs text-[#68717D]">
                    {latestAnnouncement.category}
                  </p>
                  <p className="text-sm text-[#68717D] line-clamp-2">
                    {latestAnnouncement.summary}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#68717D] leading-relaxed">
                  No announcements published at this time. Official church notices appear here once published.
                </p>
              )}
            </div>
            <Link
              to="/notifications"
              className="px-5 py-3.5 bg-[#F4F2EC]/75 border-t border-[#E5E7EB] inline-flex items-center justify-between text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/50 transition-colors"
            >
              <span>View Updates</span>
              <ChevronRight className="w-4 h-4 text-[#26364A]" />
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
};
