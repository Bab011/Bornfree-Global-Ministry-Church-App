import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Clock, MapPin, Share2, Check } from 'lucide-react';
import {
  MINISTRY_IDENTITY,
  SUNDAY_SERVICE_DEFAULTS,
  WEDNESDAY_SERVICE_DEFAULTS,
} from '@/src/constants/ministry';
import { subscribeServices } from '@/src/services/firestoreService';
import { ServiceConfig } from '@/src/types/ministry';
import { downloadIcsEvent, getDirectionsUrl, getNextWorshipService } from '@/src/utils/serviceSchedule';

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#26364A] hover:text-[#1D2939] min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#E5E7EB]/80">
          <Link
            to="/services/wednesday"
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              isWednesday ? 'bg-[#26364A] text-white' : 'text-[#68717D] hover:text-[#252B33]'
            }`}
          >
            Wednesday
          </Link>
          <Link
            to="/services/sunday"
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              !isWednesday ? 'bg-[#26364A] text-white' : 'text-[#68717D] hover:text-[#252B33]'
            }`}
          >
            Sunday
          </Link>
        </div>
      </div>

      {/* Header Card: Deep Slate Blue Sanctuary Focus */}
      <section className="rounded-2xl bg-[#26364A] text-white p-6 md:p-8 space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#E5E7EB]/85">
            Official Weekly Worship Schedule · Nigerian Time (WAT, UTC+1)
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-[0.01em]">
            {defaults.title}
          </h1>
          {isWednesday && (
            <p className="text-base font-semibold text-[#E5E7EB]">
              Theme: {dbConfig?.theme || WEDNESDAY_SERVICE_DEFAULTS.theme}
            </p>
          )}
          <p className="text-sm md:text-base text-[#E5E7EB]/85 leading-relaxed pt-1">
            {dbConfig?.description || defaults.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/15 text-sm">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#B99A55] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white tabular-nums">
                {defaults.timeRange} (Nigerian Time)
              </p>
              <p className="text-xs text-[#E5E7EB]/85 mt-0.5">
                Next: {nextInfo.dateLabelLagos}
              </p>
              {nextInfo.localEquivalentLabel && (
                <p className="text-xs text-[#E5E7EB]/75 mt-1 tabular-nums">
                  Your local time: {nextInfo.localEquivalentLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#B99A55] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Venue</p>
              <p className="text-xs text-[#E5E7EB]/80 mt-0.5 leading-relaxed">{venue}</p>
            </div>
          </div>
        </div>

        {dbConfig?.ministerName && (
          <div className="rounded-xl bg-[#1D2939] border border-white/10 p-4 text-sm">
            <span className="text-xs font-medium text-[#B99A55] block">Announced Minister</span>
            <span className="font-semibold text-white">
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
            className="inline-flex items-center gap-2 rounded-lg bg-[#B99A55] px-4 py-2.5 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[44px]"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Add to Calendar</span>
          </button>

          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#1D2939] px-4 py-2.5 text-sm font-medium text-[#F4F2EC] hover:bg-[#1D2939]/80 transition-colors min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-[#B99A55]" />
            <span>Get Directions</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#1D2939] px-4 py-2.5 text-sm font-medium text-[#F4F2EC] hover:bg-[#1D2939]/80 transition-colors min-h-[44px]"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#B99A55]" />
            ) : (
              <Share2 className="w-4 h-4 text-[#B99A55]" />
            )}
            <span>{copied ? 'Details Copied' : 'Share Service Details'}</span>
          </button>
        </div>
      </section>

      {/* Order of Service */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#26364A]">Order of Service</h2>
          <p className="text-xs text-[#68717D] mt-1">
            Official sequence of ministry activities
          </p>
        </div>

        <ol className="divide-y divide-[#E5E7EB]">
          {defaults.orderOfService.map((item) => (
            <li key={item.step} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] text-[#26364A] font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                {item.step}
              </span>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-[#252B33]">
                    {item.title}
                  </h3>
                  {'time' in item && item.time && (
                    <span className="text-xs font-semibold text-[#26364A] tabular-nums">
                      {item.time}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#68717D]">{item.note}</p>
              </div>
            </li>
          ))}
        </ol>

        {isWednesday && (
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-4 text-xs text-[#252B33] space-y-1">
            <p className="font-semibold text-[#26364A]">Word Ministration</p>
            <p className="text-[#68717D]">
              The Word may be ministered by the Senior Pastor, Resident Pastor, or Group Pastors heading cell groups within the ministry.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
