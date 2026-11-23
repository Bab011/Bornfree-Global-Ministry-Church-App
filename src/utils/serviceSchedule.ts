import { MINISTRY_IDENTITY, SUNDAY_SERVICE_DEFAULTS, WEDNESDAY_SERVICE_DEFAULTS } from '@/src/constants/ministry';

export interface NextServiceInfo {
  type: 'wednesday' | 'sunday';
  title: string;
  theme?: string;
  dateLabelLagos: string;
  startTimeLagos: string;
  endTimeLagos: string;
  localEquivalentLabel: string | null;
  visitorTimeZone: string | null;
  isLiveWindow: boolean;
  startUtc: Date;
  endUtc: Date;
  routePath: string;
}

function getLagosParts(now: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: MINISTRY_IDENTITY.timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    weekday: weekdayMap[parts.weekday] ?? 0,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/**
 * Africa/Lagos is always UTC+1 (no DST).
 * Converts a Lagos wall-clock date+time to an exact UTC Date object.
 */
function lagosWallClockToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 1, minute, 0, 0));
}

export function getNextWorshipService(now: Date = new Date()): NextServiceInfo {
  const lagos = getLagosParts(now);
  const currentMinutes = lagos.hour * 60 + lagos.minute;

  // Wednesday = 3 (18:00 - 20:00 WAT), Sunday = 0 (08:00 - 11:00 WAT)
  let daysUntilWed = (3 - lagos.weekday + 7) % 7;
  if (daysUntilWed === 0 && currentMinutes >= 20 * 60) {
    daysUntilWed = 7;
  }

  let daysUntilSun = (0 - lagos.weekday + 7) % 7;
  if (daysUntilSun === 0 && currentMinutes >= 11 * 60) {
    daysUntilSun = 7;
  }

  const wedStart = lagosWallClockToUtc(lagos.year, lagos.month, lagos.day + daysUntilWed, 18, 0);
  const wedEnd = lagosWallClockToUtc(lagos.year, lagos.month, lagos.day + daysUntilWed, 20, 0);

  const sunStart = lagosWallClockToUtc(lagos.year, lagos.month, lagos.day + daysUntilSun, 8, 0);
  const sunEnd = lagosWallClockToUtc(lagos.year, lagos.month, lagos.day + daysUntilSun, 11, 0);

  const isWednesdayNext = wedStart.getTime() <= sunStart.getTime();
  const type = isWednesdayNext ? 'wednesday' : 'sunday';
  const startUtc = isWednesdayNext ? wedStart : sunStart;
  const endUtc = isWednesdayNext ? wedEnd : sunEnd;

  const isLiveWindow = now.getTime() >= startUtc.getTime() && now.getTime() <= endUtc.getTime();

  const dateLabelLagos = new Intl.DateTimeFormat('en-NG', {
    timeZone: MINISTRY_IDENTITY.timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(startUtc);

  let visitorTimeZone: string | null = null;
  let localEquivalentLabel: string | null = null;
  try {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTz && detectedTz !== MINISTRY_IDENTITY.timeZone && detectedTz !== 'Africa/Lagos') {
      visitorTimeZone = detectedTz;
      const timeFmt = new Intl.DateTimeFormat(undefined, {
        timeZone: detectedTz,
        hour: 'numeric',
        minute: '2-digit',
      });
      const dateFmt = new Intl.DateTimeFormat(undefined, {
        timeZone: detectedTz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      localEquivalentLabel = `${dateFmt.format(startUtc)} · ${timeFmt.format(startUtc)} – ${timeFmt.format(endUtc)} (${detectedTz.replace(/_/g, ' ')})`;
    }
  } catch {
    visitorTimeZone = null;
  }

  return {
    type,
    title: isWednesdayNext ? WEDNESDAY_SERVICE_DEFAULTS.title : SUNDAY_SERVICE_DEFAULTS.title,
    theme: isWednesdayNext ? WEDNESDAY_SERVICE_DEFAULTS.theme : undefined,
    dateLabelLagos,
    startTimeLagos: isWednesdayNext ? '6:00 PM' : '8:00 AM',
    endTimeLagos: isWednesdayNext ? '8:00 PM' : '11:00 AM',
    localEquivalentLabel,
    visitorTimeZone,
    isLiveWindow,
    startUtc,
    endUtc,
    routePath: isWednesdayNext ? '/services/wednesday' : '/services/sunday',
  };
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function downloadIcsEvent(params: {
  title: string;
  description: string;
  location: string;
  startUtc: Date;
  endUtc: Date;
  filename: string;
}) {
  const escapeIcs = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bornfree Global Ministry//Digital Ministry App//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@bornfreeglobalministry`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(params.startUtc)}`,
    `DTEND:${formatIcsDate(params.endUtc)}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `DESCRIPTION:${escapeIcs(params.description)}`,
    `LOCATION:${escapeIcs(params.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = params.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getDirectionsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MINISTRY_IDENTITY.address)}`;
}
