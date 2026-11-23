import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  deleteAnnouncement,
  deleteEvent,
  deleteSermon,
  fetchEventRegistrations,
  publishNotification,
  saveAnnouncement,
  saveAppSettings,
  saveDepartment,
  saveDevotional,
  saveEvent,
  savePrayerChallenge,
  saveSermon,
  saveServiceConfig,
  seedFictionalSampleContent,
} from '@/src/services/firestoreService';
import {
  Announcement,
  AppSettings,
  Department,
  Devotional,
  EventRegistration,
  MinistryEvent,
  Sermon,
  SermonContentType,
  ServiceConfig,
} from '@/src/types/ministry';
import {
  DEFAULT_NEWCOMER_JOURNEY,
  EVENT_CATEGORIES,
  MINISTRY_IDENTITY,
} from '@/src/constants/ministry';

const INPUT_CLASS =
  'rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[42px]';
const TEXTAREA_CLASS =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none';

export const AdminEventsTab: React.FC<{ events: MinistryEvent[] }> = ({ events }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState<string>(MINISTRY_IDENTITY.address);
  const [guestMinisters, setGuestMinisters] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regs, setRegs] = useState<{ eventTitle: string; items: EventRegistration[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveEvent({
        title,
        category,
        theme,
        description,
        bannerUrl,
        date,
        startTime,
        endTime,
        venue,
        guestMinisters,
        contactInfo,
        registrationEnabled,
        isPublished,
      });
      setTitle('');
      setTheme('');
      setDescription('');
      setBannerUrl('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setGuestMinisters('');
      setContactInfo('');
    } finally {
      setSaving(false);
    }
  };

  const handleViewRegistrations = async (ev: MinistryEvent) => {
    const items = await fetchEventRegistrations(ev.id);
    setRegs({ eventTitle: ev.title, items });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3.5"
      >
        <h2 className="text-lg font-semibold text-[#26364A]">Create Ministry Event</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Name *"
            className={INPUT_CLASS}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={INPUT_CLASS}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Theme (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="text"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start Time (e.g., 5:00 PM WAT) *"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End Time (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Venue *"
            className={`${INPUT_CLASS} sm:col-span-2`}
          />
          <input
            type="text"
            value={guestMinisters}
            onChange={(e) => setGuestMinisters(e.target.value)}
            placeholder="Guest Ministers (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="Banner Image URL (optional)"
            className={INPUT_CLASS}
          />
        </div>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event Description *"
          className={TEXTAREA_CLASS}
        />
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Official Event Contact Information (optional)"
          className={`w-full ${INPUT_CLASS}`}
        />
        <div className="flex flex-wrap gap-4 text-xs text-[#252B33]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(e) => setRegistrationEnabled(e.target.checked)}
              className="accent-[#26364A]"
            />
            <span>Enable Registration Form</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#26364A]"
            />
            <span>Publish Immediately</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
        >
          {saving ? 'Saving...' : 'Save Event'}
        </button>
      </form>

      {regs && (
        <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#26364A]">
              Registrations: {regs.eventTitle} ({regs.items.length})
            </h3>
            <button
              type="button"
              onClick={() => setRegs(null)}
              className="text-xs font-semibold text-[#26364A] hover:text-[#1D2939] underline"
            >
              Close
            </button>
          </div>
          {regs.items.length === 0 ? (
            <p className="text-xs text-[#68717D]">No registrations yet.</p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] text-xs text-[#252B33]">
              {regs.items.map((r) => (
                <li key={r.id} className="py-2">
                  <strong>{r.fullName}</strong> · {r.email} · {r.attendanceMode}
                  {r.city ? ` · ${r.city}, ${r.country || ''}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="rounded-xl bg-white border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="text-xs">
              <p className="text-sm font-semibold text-[#252B33]">{ev.title}</p>
              <p className="text-[#68717D]">
                {ev.category} · {ev.date} · {ev.isPublished ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleViewRegistrations(ev)}
                className="rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/60 px-3 py-1.5 text-xs font-semibold text-[#26364A] transition-colors"
              >
                Registrations
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(ev.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSermonsTab: React.FC<{ sermons: Sermon[] }> = ({ sermons }) => {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<SermonContentType>('sermon');
  const [minister, setMinister] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [scriptureReferences, setScriptureReferences] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSermon({
        title,
        contentType,
        minister,
        date,
        description,
        videoUrl,
        audioUrl,
        thumbnailUrl,
        scriptureReferences,
        isPublished,
      });
      setTitle('');
      setMinister('');
      setDate('');
      setDescription('');
      setVideoUrl('');
      setAudioUrl('');
      setThumbnailUrl('');
      setScriptureReferences('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3.5"
      >
        <h2 className="text-lg font-semibold text-[#26364A]">Publish Sermon or Teaching</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title *"
            className={INPUT_CLASS}
          />
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as SermonContentType)}
            className={INPUT_CLASS}
          >
            <option value="sermon">Sermon</option>
            <option value="video">Video Message</option>
            <option value="audio">Audio Message</option>
            <option value="bible_study">Bible Study</option>
            <option value="publication">Publication</option>
            <option value="teaching">Ministry Teaching</option>
          </select>
          <input
            type="text"
            required
            value={minister}
            onChange={(e) => setMinister(e.target.value)}
            placeholder="Minister *"
            className={INPUT_CLASS}
          />
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube / Video URL (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="url"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="Audio File URL (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            value={scriptureReferences}
            onChange={(e) => setScriptureReferences(e.target.value)}
            placeholder="Scripture References (optional)"
            className={INPUT_CLASS}
          />
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Thumbnail Image URL (optional)"
            className={INPUT_CLASS}
          />
        </div>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Message Summary / Notes"
          className={TEXTAREA_CLASS}
        />
        <label className="flex items-center gap-2 text-xs text-[#252B33]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-[#26364A]"
          />
          <span>Publish immediately</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
        >
          {saving ? 'Publishing...' : 'Save Teaching'}
        </button>
      </form>

      <div className="space-y-2.5">
        {sermons.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-white border border-[#E5E7EB] p-4 flex items-center justify-between gap-3"
          >
            <div className="text-xs">
              <p className="text-sm font-semibold text-[#252B33]">{s.title}</p>
              <p className="text-[#68717D]">
                {s.minister} · {s.date} · {s.contentType}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteSermon(s.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminAnnouncementsTab: React.FC<{ announcements: Announcement[] }> = ({
  announcements,
}) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('Ministry Update');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAnnouncement({
        title,
        summary,
        category,
        isPinned,
        isPublished: true,
      });
      setTitle('');
      setSummary('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
      >
        <h2 className="text-lg font-semibold text-[#26364A]">Publish Announcement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title *"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className={INPUT_CLASS}
          />
        </div>
        <textarea
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Announcement details *"
          className={TEXTAREA_CLASS}
        />
        <label className="flex items-center gap-2 text-xs text-[#252B33]">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="accent-[#26364A]"
          />
          <span>Pin to top of announcements</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
        >
          {saving ? 'Publishing...' : 'Publish Announcement'}
        </button>
      </form>

      <div className="space-y-2.5">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-xl bg-white border border-[#E5E7EB] p-4 flex items-center justify-between gap-3"
          >
            <div className="text-xs">
              <p className="text-sm font-semibold text-[#252B33]">{a.title}</p>
              <p className="text-[#68717D]">{a.summary}</p>
            </div>
            <button
              type="button"
              onClick={() => deleteAnnouncement(a.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDevotionalsTab: React.FC<{ devotionals: Devotional[] }> = ({ devotionals }) => {
  const [title, setTitle] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [reflection, setReflection] = useState('');
  const [prayerPoint, setPrayerPoint] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [readingPlan, setReadingPlan] = useState('');
  const [saving, setSaving] = useState(false);

  // Prayer Challenge builder
  const [chTitle, setChTitle] = useState('');
  const [chDays, setChDays] = useState<7 | 14 | 21>(7);
  const [chScripture, setChScripture] = useState('');
  const [chPoint, setChPoint] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveDevotional({
        title,
        bibleVerse,
        scriptureReference,
        reflection,
        prayerPoint,
        publishDate,
        readingPlan,
        isPublished: true,
      });
      setTitle('');
      setBibleVerse('');
      setScriptureReference('');
      setReflection('');
      setPrayerPoint('');
      setReadingPlan('');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = Array.from({ length: chDays }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} Focus`,
      scriptureReference: chScripture || 'Psalm 23',
      prayerPoint: chPoint,
    }));
    await savePrayerChallenge({
      title: chTitle,
      durationDays: chDays,
      days,
      isPublished: true,
    });
    setChTitle('');
    setChScripture('');
    setChPoint('');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
      >
        <h2 className="text-lg font-semibold text-[#26364A]">Publish Daily Devotional</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Devotional Title *"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            required
            value={scriptureReference}
            onChange={(e) => setScriptureReference(e.target.value)}
            placeholder="Scripture Reference (e.g., Romans 8:1) *"
            className={INPUT_CLASS}
          />
          <input
            type="date"
            required
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <textarea
          required
          rows={2}
          value={bibleVerse}
          onChange={(e) => setBibleVerse(e.target.value)}
          placeholder="Exact Bible Verse Text *"
          className={TEXTAREA_CLASS}
        />
        <textarea
          required
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Short Reflection *"
          className={TEXTAREA_CLASS}
        />
        <textarea
          required
          rows={2}
          value={prayerPoint}
          onChange={(e) => setPrayerPoint(e.target.value)}
          placeholder="Prayer Point *"
          className={TEXTAREA_CLASS}
        />
        <input
          type="text"
          value={readingPlan}
          onChange={(e) => setReadingPlan(e.target.value)}
          placeholder="Optional Bible Reading Plan"
          className={`w-full ${INPUT_CLASS}`}
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
        >
          {saving ? 'Publishing...' : 'Publish Daily Devotional'}
        </button>
      </form>

      <form
        onSubmit={handleCreateChallenge}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
      >
        <h3 className="text-base font-semibold text-[#26364A]">
          Create Special Prayer Programme (7 / 14 / 21 Days)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={chTitle}
            onChange={(e) => setChTitle(e.target.value)}
            placeholder="Programme Title *"
            className={INPUT_CLASS}
          />
          <select
            value={chDays}
            onChange={(e) => setChDays(Number(e.target.value) as 7 | 14 | 21)}
            className={INPUT_CLASS}
          >
            <option value={7}>7-Day Prayer Programme</option>
            <option value={14}>14-Day Prayer Programme</option>
            <option value={21}>21-Day Prayer Programme</option>
          </select>
          <input
            type="text"
            required
            value={chScripture}
            onChange={(e) => setChScripture(e.target.value)}
            placeholder="Anchor Scripture *"
            className={INPUT_CLASS}
          />
        </div>
        <textarea
          required
          rows={2}
          value={chPoint}
          onChange={(e) => setChPoint(e.target.value)}
          placeholder="Daily Prayer Focus *"
          className={TEXTAREA_CLASS}
        />
        <button
          type="submit"
          className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-5 py-2 text-xs font-semibold text-[#1D2939] transition-colors min-h-[40px]"
        >
          Publish Prayer Programme
        </button>
      </form>

      <div className="space-y-2">
        {devotionals.map((d) => (
          <div key={d.id} className="rounded-lg bg-white border border-[#E5E7EB] p-3.5 text-xs text-[#68717D]">
            <strong className="text-[#252B33]">{d.title}</strong> · {d.scriptureReference} ·{' '}
            {d.publishDate}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminNotificationsTab: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [linkPath, setLinkPath] = useState('/');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await publishNotification({ title, body, category, linkPath, targetUid: null });
    setTitle('');
    setBody('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
    >
      <h2 className="text-lg font-semibold text-[#26364A]">Send In-App Notification</h2>
      {sent && (
        <div className="rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] p-3 text-xs font-medium text-[#26364A]">
          Notification published to the in-app Notification Centre.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title *"
          className={INPUT_CLASS}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="Service Reminder">Service Reminder</option>
          <option value="Announcement">Announcement</option>
          <option value="New Sermon">New Sermon</option>
          <option value="Event">Event</option>
          <option value="Daily Devotional">Daily Devotional</option>
        </select>
        <input
          type="text"
          value={linkPath}
          onChange={(e) => setLinkPath(e.target.value)}
          placeholder="Route Path (e.g., /events)"
          className={INPUT_CLASS}
        />
      </div>
      <textarea
        required
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Notification message *"
        className={TEXTAREA_CLASS}
      />
      <button
        type="submit"
        className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
      >
        Publish Notification
      </button>
    </form>
  );
};

export const AdminSettingsTab: React.FC<{
  settings: AppSettings | null;
  services: ServiceConfig[];
  departments: Department[];
}> = ({ settings, services, departments }) => {
  const { isSeniorPastor } = useAuth();
  const wedDb = services.find((s) => s.type === 'wednesday');
  const [livestreamUrl, setLivestreamUrl] = useState(settings?.livestreamUrl || '');
  const [isLiveNow, setIsLiveNow] = useState(settings?.isLiveNow || false);
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState(settings?.welcomeVideoUrl || '');
  const [officialEmail, setOfficialEmail] = useState(settings?.officialEmail || '');
  const [officialPhone, setOfficialPhone] = useState(settings?.officialPhone || '');
  const [wedMinister, setWedMinister] = useState(wedDb?.ministerName || '');
  const [wedMinisterRole, setWedMinisterRole] = useState(wedDb?.ministerRole || 'Senior Pastor');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setLivestreamUrl(settings.livestreamUrl || '');
    setIsLiveNow(Boolean(settings.isLiveNow));
    setWelcomeVideoUrl(settings.welcomeVideoUrl || '');
    setOfficialEmail(settings.officialEmail || '');
    setOfficialPhone(settings.officialPhone || '');
  }, [settings]);

  useEffect(() => {
    if (!wedDb) return;
    setWedMinister(wedDb.ministerName || '');
    setWedMinisterRole(wedDb.ministerRole || 'Senior Pastor');
  }, [wedDb]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAppSettings({
      livestreamUrl,
      isLiveNow,
      welcomeVideoUrl,
      officialEmail,
      officialPhone,
      pushConfigured: false,
      newcomerJourney: settings?.newcomerJourney || DEFAULT_NEWCOMER_JOURNEY,
    });
    setNotice('Ministry settings updated.');
  };

  const handleSaveWednesdayMinister = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveServiceConfig({
      type: 'wednesday',
      title: 'WEDNESDAY MIDWEEK SERVICE',
      theme: 'THE WORD AND PRAYER',
      description: 'An evening dedicated to sharing the Word of God and corporate prayers.',
      ministerName: wedMinister,
      ministerRole: wedMinisterRole,
      venue: MINISTRY_IDENTITY.address,
    });
    setNotice('Wednesday Midweek Service minister updated.');
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDepartment({
      name: deptName,
      description: deptDesc,
      isOpenForVolunteers: true,
    });
    setDeptName('');
    setDeptDesc('');
    setNotice('Department added.');
  };

  const handleSeedDemo = async () => {
    await seedFictionalSampleContent();
    setNotice('Clearly labelled fictional demonstration records added.');
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs font-medium text-[#26364A]">
          {notice}
        </div>
      )}

      <form
        onSubmit={handleSaveSettings}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
      >
        <h2 className="text-lg font-semibold text-[#26364A]">
          Livestream, Media & Official Contact Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            value={livestreamUrl}
            onChange={(e) => setLivestreamUrl(e.target.value)}
            placeholder="Livestream URL (YouTube / Broadcast link)"
            className={INPUT_CLASS}
          />
          <input
            type="url"
            value={welcomeVideoUrl}
            onChange={(e) => setWelcomeVideoUrl(e.target.value)}
            placeholder="First-Time Visitor Welcome Video (YouTube URL)"
            className={INPUT_CLASS}
          />
          <input
            type="email"
            value={officialEmail}
            onChange={(e) => setOfficialEmail(e.target.value)}
            placeholder="Official Ministry Email"
            className={INPUT_CLASS}
          />
          <input
            type="tel"
            value={officialPhone}
            onChange={(e) => setOfficialPhone(e.target.value)}
            placeholder="Official Ministry Phone"
            className={INPUT_CLASS}
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-[#252B33]">
          <input
            type="checkbox"
            checked={isLiveNow}
            onChange={(e) => setIsLiveNow(e.target.checked)}
            className="accent-[#26364A]"
          />
          <span>Service is Currently Live (Displays WATCH LIVE button on Home when Livestream URL is valid)</span>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-5 py-2.5 text-xs font-semibold text-white transition-colors min-h-[42px]"
        >
          Save Settings
        </button>
      </form>

      <form
        onSubmit={handleSaveWednesdayMinister}
        className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
      >
        <h3 className="text-base font-semibold text-[#26364A]">
          Wednesday Midweek Service Minister
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={wedMinister}
            onChange={(e) => setWedMinister(e.target.value)}
            placeholder="Minister Name (when announced)"
            className={INPUT_CLASS}
          />
          <select
            value={wedMinisterRole}
            onChange={(e) => setWedMinisterRole(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="Senior Pastor">Senior Pastor</option>
            <option value="Resident Pastor">Resident Pastor</option>
            <option value="Group Pastor">Group Pastor (Cell Group)</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-4 py-2 text-xs font-semibold text-[#1D2939] transition-colors min-h-[40px]"
        >
          Update Wednesday Minister
        </button>
      </form>

      {isSeniorPastor && (
        <>
          <form
            onSubmit={handleAddDept}
            className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3"
          >
            <h3 className="text-base font-semibold text-[#26364A]">Ministry Departments</h3>
            {departments.length > 0 && (
              <ul className="divide-y divide-[#E5E7EB] text-xs">
                {departments.map((d) => (
                  <li key={d.id} className="py-2">
                    <span className="font-semibold text-[#252B33]">{d.name}</span>
                    <p className="text-[#68717D] mt-0.5">{d.description}</p>
                  </li>
                ))}
              </ul>
            )}
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="Department Name *"
              className={`w-full ${INPUT_CLASS}`}
            />
            <textarea
              required
              rows={2}
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              placeholder="Department Description *"
              className={TEXTAREA_CLASS}
            />
            <button
              type="submit"
              className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-4 py-2 text-xs font-semibold text-white transition-colors min-h-[40px]"
            >
              Add Department
            </button>
          </form>

          <div className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#26364A]">
              Demonstration Preview Data (Optional)
            </h3>
            <p className="text-xs text-[#68717D]">
              Load clearly labelled fictional sample devotionals, announcements, and departments to preview populated screens. You can delete them anytime.
            </p>
            <button
              type="button"
              onClick={handleSeedDemo}
              className="rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/60 px-4 py-2 text-xs font-semibold text-[#26364A] transition-colors"
            >
              Load Fictional Sample Content (Demo)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
