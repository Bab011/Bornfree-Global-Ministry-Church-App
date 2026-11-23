import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Clock,
  MapPin,
  Megaphone,
  Radio,
} from 'lucide-react';
import {
  MINISTRY_IDENTITY,
  SUNDAY_SERVICE_DEFAULTS,
  WEDNESDAY_SERVICE_DEFAULTS,
} from '@/src/constants/ministry';
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
import {
  BORNFREE_PHOTOS,
  CommunityAvatarCue,
  EditorialReveal,
  ExploreMoreRow,
  HighlighterSwipe,
  SquareDateTile,
} from '@/src/components/EditorialUI';

function formatLagosDayMonth(date: Date): { day: string; month: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MINISTRY_IDENTITY.timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date);
  return {
    day: parts.find((p) => p.type === 'day')?.value || '',
    month: parts.find((p) => p.type === 'month')?.value || '',
  };
}

function getNextServiceOfType(target: 'wednesday' | 'sunday') {
  const now = new Date();
  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const next = getNextWorshipService(candidate);
    if (next.type === target) return next;
  }
  return getNextWorshipService(now);
}

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
  const nextWednesday = useMemo(() => getNextServiceOfType('wednesday'), []);
  const nextSunday = useMemo(() => getNextServiceOfType('sunday'), []);

  const nextServiceTile = useMemo(() => formatLagosDayMonth(nextService.startUtc), [nextService]);
  const wedTile = useMemo(() => formatLagosDayMonth(nextWednesday.startUtc), [nextWednesday]);
  const sunTile = useMemo(() => formatLagosDayMonth(nextSunday.startUtc), [nextSunday]);

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
    <div className="w-full">
      {/* BAND 1: Full-Bleed Hero Photograph + Flat Dark Text Container */}
      <section
        aria-label="Welcome to Bornfree Global Ministry"
        className="relative w-full min-h-[78vh] md:min-h-[84vh] bg-[#151515] text-white flex flex-col justify-end overflow-hidden"
      >
        <img
          src={BORNFREE_PHOTOS.heroSanctuary}
          alt="Bornfree Global Ministry congregation in worship"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Flat dark wash for top header contrast (no gradient) */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-[#151515]/45" />
        {/* Flat dark overlay behind bottom editorial text */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-full md:h-[62%] bg-[#151515]/55" />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 md:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-5">
              <p className="text-xs font-normal tracking-wide text-[#E5E5E2]">
                {isSignedIn && firstName
                  ? `Welcome back, ${firstName}`
                  : 'Global Digital Sanctuary · Lagos, Nigeria'}
              </p>

              <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-[-0.02em]">
                Welcome to Bornfree Global Ministry
              </h1>

              <p className="text-base sm:text-lg font-light text-[#E5E5E2] max-w-xl">
                “{MINISTRY_IDENTITY.motto}”
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {hasValidLivestream && (
                  <a
                    href={settings!.livestreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#FCDC00] px-5 py-3 text-sm font-semibold text-[#151515] hover:bg-[#ffe32e] min-h-[44px] whitespace-nowrap"
                  >
                    <Radio className="w-4 h-4" strokeWidth={1.75} />
                    <span>WATCH LIVE</span>
                  </a>
                )}

                <Link
                  to={nextService.routePath}
                  className={`btn-press inline-flex items-center gap-2 rounded-[2px] px-5 py-3 text-sm font-semibold min-h-[44px] whitespace-nowrap ${
                    hasValidLivestream
                      ? 'bg-white text-[#151515] hover:bg-[#F0F0EE]'
                      : 'bg-[#FCDC00] text-[#151515] hover:bg-[#ffe32e]'
                  }`}
                >
                  <span>View Programme</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>

                <Link
                  to="/new-here"
                  className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#151515]/85 border border-white/25 px-5 py-3 text-sm font-normal text-white hover:bg-[#151515] min-h-[44px] whitespace-nowrap"
                >
                  <span>New Here? Start Here</span>
                </Link>

                <div className="sm:hidden">
                  <PWAInstallButton />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col lg:items-end justify-end gap-4">
              <div className="bg-[#151515]/85 border border-white/15 p-4 w-full lg:max-w-xs space-y-1.5 rounded-[2px]">
                <p className="text-[11px] font-normal text-[#A3A19D]">
                  Next Worship Experience · {MINISTRY_IDENTITY.timeZoneLabel}
                </p>
                <p className="text-sm font-medium text-white">{nextService.title}</p>
                <p className="text-xs font-normal text-[#E5E5E2] tabular-nums">
                  {nextService.dateLabelLagos} · {nextService.startTimeLagos} – {nextService.endTimeLagos}
                </p>
                {nextService.localEquivalentLabel && (
                  <p className="text-[11px] font-normal text-[#A3A19D] tabular-nums">
                    Your local time: {nextService.localEquivalentLabel}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <CommunityAvatarCue to="/new-here" label="First Time Here? Join Bornfree" />
                <span className="text-xs font-normal text-[#E5E5E2]">First Time Here?</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: Solid Ink Statement Block + Official Logo with Clear Space */}
      <section
        aria-label="Ministry Mission Statement"
        className="w-full bg-[#151515] text-white border-t border-white/10"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <EditorialReveal>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
              <div className="md:col-span-3 flex items-center gap-4">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-[#151515] p-2 shrink-0 flex items-center justify-center">
                  <img
                    src={MINISTRY_IDENTITY.logoUrl}
                    alt="Bornfree Global Ministry Official Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="md:col-span-9 space-y-4">
                <p className="text-xs font-normal text-[#A3A19D]">
                  {MINISTRY_IDENTITY.name} · Official Mission
                </p>
                <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-white leading-[1.08] tracking-[-0.02em]">
                  {MINISTRY_IDENTITY.motto}
                </h2>
                <p className="text-base sm:text-lg font-light text-[#D4D3CE] max-w-2xl leading-relaxed">
                  {MINISTRY_IDENTITY.mission}
                </p>
              </div>
            </div>
          </EditorialReveal>
        </div>
      </section>

      {/* BAND 3: Light Paper Editorial List — Featured Ministry Content & Quick Access */}
      <section
        aria-labelledby="featured-heading"
        className="w-full bg-[#F0F0EE] text-[#151515]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-10">
          <EditorialReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#151515]/12 pb-6">
              <div className="space-y-2">
                <p className="text-xs font-normal text-[#6B6A67]">
                  Sermons, Programmes & Notices
                </p>
                <HighlighterSwipe
                  highlight="Featured"
                  rest="Ministry Content"
                  as="h2"
                  className="text-3xl sm:text-4xl"
                />
              </div>
              <div className="flex items-center gap-5 text-xs font-medium text-[#151515]">
                <Link to="/services/wednesday" className="hover:underline underline-offset-4">
                  Wednesday Service
                </Link>
                <Link to="/services/sunday" className="hover:underline underline-offset-4">
                  Sunday Service
                </Link>
              </div>
            </div>
          </EditorialReveal>

          {/* Signature Element 4 (Light Variant): Thumbnail | Title + Metadata | Circular Sand Arrow */}
          <div className="divide-y divide-[#151515]/12 border-b border-[#151515]/12">
            {/* Row 1: Latest Sermon */}
            <Link
              to="/discover"
              className="group py-5 flex items-center gap-4 sm:gap-6 hover:bg-white/60 transition-colors px-2 -mx-2"
            >
              <img
                src={
                  latestSermon?.thumbnailUrl && isSafeHttpUrl(latestSermon.thumbnailUrl)
                    ? latestSermon.thumbnailUrl
                    : BORNFREE_PHOTOS.pastorPreachingWide
                }
                alt="Latest sermon ministration"
                loading="lazy"
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover object-top rounded-[2px] bg-[#1F1D1C]"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-normal text-[#6B6A67]">Latest Sermon</p>
                <h3 className="text-lg sm:text-xl font-normal text-[#151515] leading-snug truncate">
                  {latestSermon ? latestSermon.title : 'Explore Teachings & Media Archive'}
                </h3>
                <p className="text-xs font-normal text-[#6B6A67] tabular-nums">
                  {latestSermon
                    ? `${latestSermon.minister} · ${latestSermon.date}`
                    : 'No sermons published yet. Media administrators can upload video or audio teachings in the dashboard.'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="btn-press w-11 h-11 shrink-0 rounded-full bg-[#E9DFC6] text-[#151515] flex items-center justify-center group-hover:bg-[#FCDC00]"
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>

            {/* Row 2: Upcoming Programme */}
            <Link
              to="/events"
              className="group py-5 flex items-center gap-4 sm:gap-6 hover:bg-white/60 transition-colors px-2 -mx-2"
            >
              <img
                src={
                  nextEvent?.bannerUrl && isSafeHttpUrl(nextEvent.bannerUrl)
                    ? nextEvent.bannerUrl
                    : BORNFREE_PHOTOS.convention2026
                }
                alt="Upcoming ministry programme"
                loading="lazy"
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover object-center rounded-[2px] bg-[#1F1D1C]"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-normal text-[#6B6A67]">Upcoming Programme</p>
                <h3 className="text-lg sm:text-xl font-normal text-[#151515] leading-snug truncate">
                  {nextEvent ? nextEvent.title : 'View Upcoming Events & Gatherings'}
                </h3>
                <p className="text-xs font-normal text-[#6B6A67] tabular-nums">
                  {nextEvent
                    ? `${nextEvent.category} · ${nextEvent.date} · ${nextEvent.venue}`
                    : 'No upcoming special events published yet. Check back for conventions, crusades, and conferences.'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="btn-press w-11 h-11 shrink-0 rounded-full bg-[#E9DFC6] text-[#151515] flex items-center justify-center group-hover:bg-[#FCDC00]"
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>

            {/* Row 3: Latest Ministry Announcement */}
            <Link
              to="/notifications"
              className="group py-5 flex items-center gap-4 sm:gap-6 hover:bg-white/60 transition-colors px-2 -mx-2"
            >
              <img
                src={BORNFREE_PHOTOS.wordStudy}
                alt="Ministry announcement"
                loading="lazy"
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover object-center rounded-[2px] bg-[#1F1D1C]"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-normal text-[#6B6A67] inline-flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-[#151515]" strokeWidth={1.5} />
                  <span>Ministry Announcement</span>
                </p>
                <h3 className="text-lg sm:text-xl font-normal text-[#151515] leading-snug truncate">
                  {latestAnnouncement ? latestAnnouncement.title : 'Official Ministry Notices'}
                </h3>
                <p className="text-xs font-normal text-[#6B6A67] line-clamp-2">
                  {latestAnnouncement
                    ? `${latestAnnouncement.category} · ${latestAnnouncement.summary}`
                    : 'No announcements published at this time. Official church notices appear here once published.'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="btn-press w-11 h-11 shrink-0 rounded-full bg-[#E9DFC6] text-[#151515] flex items-center justify-center group-hover:bg-[#FCDC00]"
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* BAND 4: Dark Ink Upcoming Worship & Weekly Schedule with Square Date Tiles */}
      <section
        aria-labelledby="next-service-heading"
        className="w-full bg-[#151515] text-white"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-8">
          <EditorialReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-normal text-[#A3A19D]">
                  {MINISTRY_IDENTITY.timeZoneLabel} · Lagos & Online
                </p>
                <HighlighterSwipe
                  highlight="Upcoming"
                  rest="Worship"
                  as="h2"
                  onDark
                  className="text-3xl sm:text-4xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddServiceToCalendar}
                  className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#1F1D1C] border border-white/15 px-4 py-2.5 text-xs font-medium text-white hover:border-[#FCDC00] min-h-[44px] whitespace-nowrap"
                >
                  <CalendarPlus className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
                  <span>Add to Calendar</span>
                </button>
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#1F1D1C] border border-white/15 px-4 py-2.5 text-xs font-medium text-white hover:border-[#FCDC00] min-h-[44px] whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </EditorialReveal>

          <div className="divide-y divide-white/12 border-t border-b border-white/12">
            {/* Next Worship Service Focal Row */}
            <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-5">
                <SquareDateTile
                  day={nextServiceTile.day}
                  month={nextServiceTile.month}
                  variant="white"
                />
                <div className="space-y-1">
                  <p className="text-xs font-normal text-[#FCDC00]">Next Worship Experience</p>
                  <h3
                    id="next-service-heading"
                    className="text-xl sm:text-2xl font-light text-white tracking-[-0.01em]"
                  >
                    {nextService.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-normal text-[#A3A19D] tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {nextService.dateLabelLagos} · {nextService.startTimeLagos} – {nextService.endTimeLagos}
                    </span>
                    {nextService.theme && <span>Theme: {nextService.theme}</span>}
                  </div>
                  {nextService.localEquivalentLabel && (
                    <p className="text-[11px] font-normal text-[#A3A19D] tabular-nums">
                      Your local time: {nextService.localEquivalentLabel}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={nextService.routePath}
                className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#FCDC00] px-4 py-2.5 text-xs font-semibold text-[#151515] hover:bg-[#ffe32e] min-h-[42px] whitespace-nowrap self-start sm:self-center"
              >
                <span>View Programme</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Link>
            </div>

            {/* Wednesday Midweek Service */}
            <Link
              to="/services/wednesday"
              className="group py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1F1D1C] transition-colors px-3 -mx-3"
            >
              <div className="flex items-center gap-5">
                <SquareDateTile day={wedTile.day} month={wedTile.month} variant="sand" />
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-light text-white">
                    {WEDNESDAY_SERVICE_DEFAULTS.title}
                  </h3>
                  <p className="text-xs font-normal text-[#A3A19D] tabular-nums">
                    {WEDNESDAY_SERVICE_DEFAULTS.timeRange} (WAT) · {WEDNESDAY_SERVICE_DEFAULTS.theme}
                  </p>
                </div>
              </div>
              <span className="w-10 h-10 rounded-[2px] bg-white text-[#151515] flex items-center justify-center group-hover:bg-[#FCDC00] transition-colors self-end sm:self-center">
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>

            {/* Sunday Worship Service */}
            <Link
              to="/services/sunday"
              className="group py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1F1D1C] transition-colors px-3 -mx-3"
            >
              <div className="flex items-center gap-5">
                <SquareDateTile day={sunTile.day} month={sunTile.month} variant="sand" />
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-light text-white">
                    {SUNDAY_SERVICE_DEFAULTS.title}
                  </h3>
                  <p className="text-xs font-normal text-[#A3A19D] tabular-nums">
                    {SUNDAY_SERVICE_DEFAULTS.timeRange} (WAT) · {MINISTRY_IDENTITY.address}
                  </p>
                </div>
              </div>
              <span className="w-10 h-10 rounded-[2px] bg-white text-[#151515] flex items-center justify-center group-hover:bg-[#FCDC00] transition-colors self-end sm:self-center">
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* BAND 5: Light Paper Editorial Split — Pastoral Spotlight & Daily Scripture + Explore More */}
      <section className="w-full bg-[#F0F0EE] text-[#151515]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Signature Element 6 — Tall Portrait Photo + Vertical Label */}
            <EditorialReveal className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-normal text-[#6B6A67]">Ministry Leadership & Vision</p>
                <HighlighterSwipe
                  highlight="Pastoral"
                  rest="Spotlight"
                  as="h2"
                  className="text-3xl"
                />
              </div>

              <div className="flex items-stretch gap-3">
                <div className="flex-1 overflow-hidden bg-[#1F1D1C] rounded-[2px]">
                  <img
                    src={BORNFREE_PHOTOS.pastorSpotlight}
                    alt="Prophet Philip Osung, Senior Pastor of Bornfree Global Ministry"
                    loading="lazy"
                    className="w-full aspect-[3/4] object-cover object-[50%_18%]"
                  />
                </div>
                <div className="shrink-0 flex items-center justify-center py-2">
                  <p className="vertical-label text-xs font-normal tracking-wide text-[#6B6A67] whitespace-nowrap">
                    Prophet Philip Osung · Senior Pastor
                  </p>
                </div>
              </div>

              <p className="text-sm font-normal text-[#151515] leading-relaxed">
                {MINISTRY_IDENTITY.vision}
              </p>
            </EditorialReveal>

            {/* Right Column: Daily Scripture & Devotional + Signature Element 8 Explore More Rows */}
            <div className="lg:col-span-7 space-y-12">
              {/* Daily Scripture & Devotional */}
              <EditorialReveal>
                <div
                  aria-labelledby="daily-scripture-heading"
                  className="bg-white border border-[#151515]/12 p-6 sm:p-8 space-y-5 rounded-[2px]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#151515]/12 pb-4">
                    <h2
                      id="daily-scripture-heading"
                      className="font-display font-light text-2xl sm:text-3xl text-[#151515]"
                    >
                      Daily Scripture & Devotional
                    </h2>
                    <Link
                      to="/discover?tab=daily-word"
                      className="text-xs font-medium text-[#151515] hover:underline underline-offset-4 whitespace-nowrap"
                    >
                      Daily Word & Programmes
                    </Link>
                  </div>

                  {latestDevotional ? (
                    <div className="space-y-4">
                      <div className="text-xs font-normal text-[#6B6A67] tabular-nums">
                        <span>{latestDevotional.publishDate}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-medium text-[#151515]">
                          {latestDevotional.scriptureReference}
                        </span>
                      </div>
                      <blockquote className="font-display font-light text-xl sm:text-2xl text-[#151515] leading-snug border-l-2 border-[#FCDC00] pl-4">
                        “{latestDevotional.bibleVerse}”
                      </blockquote>
                      <p className="text-sm font-normal text-[#6B6A67] leading-relaxed">
                        {latestDevotional.reflection}
                      </p>
                      <div className="bg-[#F0F0EE] border border-[#151515]/10 p-4 space-y-1 rounded-[2px]">
                        <p className="text-xs font-semibold text-[#151515]">Prayer Point</p>
                        <p className="text-sm font-normal text-[#151515]">
                          {latestDevotional.prayerPoint}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-sm font-normal text-[#6B6A67] leading-relaxed">
                      {loading
                        ? 'Loading daily scripture...'
                        : 'No daily scripture has been published yet. Authorised ministry administrators can publish today’s scripture, reflection, and prayer point from the Administrative Dashboard.'}
                    </div>
                  )}
                </div>
              </EditorialReveal>

              {/* Signature Element 8: Full-width Explore More Rows (Quick Access Shortcuts) */}
              <EditorialReveal>
                <div aria-labelledby="shortcuts-heading" className="space-y-2">
                  <div className="pb-2 border-b border-[#151515]/12 flex items-baseline justify-between">
                    <h2
                      id="shortcuts-heading"
                      className="font-display font-light text-2xl sm:text-3xl text-[#151515]"
                    >
                      Explore More
                    </h2>
                    <span className="text-xs font-normal text-[#6B6A67]">Quick Access</span>
                  </div>

                  <div>
                    <ExploreMoreRow
                      to="/prayer"
                      label="Submit a Prayer Request"
                      subtitle="Confidential pastoral care & Prayer Wall"
                    />
                    <ExploreMoreRow
                      to="/discover"
                      label="Watch Sermons"
                      subtitle="Video & audio teachings"
                    />
                    <ExploreMoreRow
                      to="/discover?tab=daily-word"
                      label="Daily Word"
                      subtitle="Scriptures & prayer programmes"
                    />
                    <ExploreMoreRow
                      to="/events"
                      label="Upcoming Events"
                      subtitle="Conventions, conferences & outreaches"
                    />
                    <ExploreMoreRow
                      to="/new-here"
                      label="First Time Here?"
                      subtitle="Welcome guide & newcomer journey"
                    />
                    <ExploreMoreRow
                      to="/connect?section=pastor"
                      label="Contact a Pastor"
                      subtitle="Pastoral counselling & visits"
                    />
                  </div>
                </div>
              </EditorialReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
