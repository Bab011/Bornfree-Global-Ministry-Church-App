import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Check, Clock, MapPin, Share2 } from 'lucide-react';
import {
  MINISTRY_IDENTITY,
  SUNDAY_SERVICE_DEFAULTS,
  WEDNESDAY_SERVICE_DEFAULTS,
} from '@/src/constants/ministry';
import { subscribeServices } from '@/src/services/firestoreService';
import { ServiceConfig } from '@/src/types/ministry';
import { downloadIcsEvent, getDirectionsUrl, getNextWorshipService } from '@/src/utils/serviceSchedule';
import { BORNFREE_PHOTOS, HighlighterSwipe } from '@/src/components/EditorialUI';

export const ServiceDetailPage: React.FC = () => {
  const { type } = useParams<{ type: 'wednesday' | 'sunday' }>();
  const serviceType = type === 'wednesday' ? 'wednesday' : 'sunday';
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return subscribeServices(setConfigs);
  }, []);

  const dbConfig = configs.find((c) => c.type === serviceType);
  const nextInfo = useMemo(() => {
    const now = new Date();
    for (let offset = 0; offset < 8; offset++) {
      const candidate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
      const next = getNextWorshipService(candidate);
      if (next.type === serviceType) return next;
    }
    return getNextWorshipService(now);
  }, [serviceType]);

  const isWednesday = serviceType === 'wednesday';
  const defaults = isWednesday ? WEDNESDAY_SERVICE_DEFAULTS : SUNDAY_SERVICE_DEFAULTS;
  const venue = dbConfig?.venue || MINISTRY_IDENTITY.address;
  const servicePhoto = isWednesday
    ? BORNFREE_PHOTOS.pastorPreachingWide
    : BORNFREE_PHOTOS.choirWorship;

  const handleShare = async () => {
    const shareText = `${defaults.title}\n${defaults.timeRange} Nigerian Time (WAT)\nVenue: ${venue}\n${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: defaults.title,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#151515]/12 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#151515] hover:underline underline-offset-4 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center border border-[#151515]/15 bg-white p-1 rounded-[2px]">
          <Link
            to="/services/wednesday"
            className={`px-4 py-2 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap ${
              isWednesday ? 'bg-[#151515] text-white' : 'text-[#6B6A67] hover:text-[#151515]'
            }`}
          >
            Wednesday
          </Link>
          <Link
            to="/services/sunday"
            className={`px-4 py-2 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap ${
              !isWednesday ? 'bg-[#151515] text-white' : 'text-[#6B6A67] hover:text-[#151515]'
            }`}
          >
            Sunday
          </Link>
        </div>
      </div>

      {/* Editorial Service Header */}
      <section className="bg-[#151515] text-white overflow-hidden rounded-[2px]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5 bg-[#1F1D1C]">
            <img
              src={servicePhoto}
              alt={defaults.title}
              className="w-full h-56 md:h-full object-cover object-top"
            />
          </div>
          <div className="md:col-span-7 p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-normal text-[#A3A19D]">
                Official Weekly Worship Schedule · {MINISTRY_IDENTITY.timeZoneLabel}
              </p>
              <HighlighterSwipe
                highlight={isWednesday ? 'Wednesday' : 'Sunday'}
                rest={isWednesday ? 'Midweek Service' : 'Worship Service'}
                as="h1"
                onDark
                className="text-2xl sm:text-3xl"
              />
              {isWednesday && (
                <p className="text-sm font-medium text-[#FCDC00]">
                  Theme: {dbConfig?.theme || WEDNESDAY_SERVICE_DEFAULTS.theme}
                </p>
              )}
              <p className="text-sm font-light text-[#D4D3CE] leading-relaxed pt-1">
                {dbConfig?.description || defaults.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/12 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FCDC00] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-white tabular-nums">
                    {defaults.timeRange} (Nigerian Time)
                  </p>
                  <p className="text-xs text-[#A3A19D] mt-0.5">
                    Next: {nextInfo.dateLabelLagos}
                  </p>
                  {nextInfo.localEquivalentLabel && (
                    <p className="text-xs text-[#A3A19D] mt-1 tabular-nums">
                      Your local time: {nextInfo.localEquivalentLabel}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FCDC00] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-white">Venue</p>
                  <p className="text-xs text-[#A3A19D] mt-0.5 leading-relaxed">{venue}</p>
                </div>
              </div>
            </div>

            {dbConfig?.ministerName && (
              <div className="bg-[#1F1D1C] border border-white/12 p-4 text-sm rounded-[2px]">
                <span className="text-xs font-normal text-[#FCDC00] block">Announced Minister</span>
                <span className="font-medium text-white">
                  {dbConfig.ministerName}
                  {dbConfig.ministerRole ? ` · ${dbConfig.ministerRole}` : ''}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  downloadIcsEvent({
                    title: `Bornfree Global Ministry — ${defaults.title}`,
                    description: dbConfig?.description || defaults.description,
                    location: venue,
                    startUtc: nextInfo.startUtc,
                    endUtc: nextInfo.endUtc,
                    filename: `bornfree-${serviceType}.ics`,
                  })
                }
                className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#FCDC00] px-4 py-2.5 text-xs font-semibold text-[#151515] hover:bg-[#ffe32e] min-h-[44px]"
              >
                <CalendarPlus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add to Calendar</span>
              </button>

              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-[#1F1D1C] px-4 py-2.5 text-xs font-medium text-white hover:border-[#FCDC00] min-h-[44px]"
              >
                <MapPin className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
                <span>Get Directions</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="btn-press inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-[#1F1D1C] px-4 py-2.5 text-xs font-medium text-white hover:border-[#FCDC00] min-h-[44px]"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
                ) : (
                  <Share2 className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
                )}
                <span>{copied ? 'Details Copied' : 'Share Service Details'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Order of Service */}
      <section className="bg-white border border-[#151515]/12 p-6 md:p-8 space-y-5 rounded-[2px]">
        <div className="border-b border-[#151515]/12 pb-4">
          <h2 className="font-display font-light text-2xl text-[#151515]">Order of Service</h2>
          <p className="text-xs font-normal text-[#6B6A67] mt-1">
            Official sequence of ministry activities
          </p>
        </div>

        <ol className="divide-y divide-[#151515]/12">
          {defaults.orderOfService.map((item) => (
            <li key={item.step} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <span className="w-9 h-9 rounded-[2px] bg-[#E9DFC6] text-[#151515] font-medium text-sm flex items-center justify-center shrink-0 tabular-nums">
                {item.step}
              </span>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-[#151515]">{item.title}</h3>
                  {'time' in item && item.time && (
                    <span className="text-xs font-normal text-[#6B6A67] tabular-nums">
                      {item.time}
                    </span>
                  )}
                </div>
                <p className="text-sm font-normal text-[#6B6A67]">{item.note}</p>
              </div>
            </li>
          ))}
        </ol>

        {isWednesday && (
          <div className="bg-[#F0F0EE] border border-[#151515]/12 p-4 text-xs text-[#151515] space-y-1 rounded-[2px]">
            <p className="font-semibold">Word Ministration</p>
            <p className="text-[#6B6A67]">
              The Word may be ministered by the Senior Pastor, Resident Pastor, or Group Pastors heading cell groups within the ministry.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
