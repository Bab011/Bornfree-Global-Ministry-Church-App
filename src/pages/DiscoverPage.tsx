import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, Circle, Headphones, Play, Search, X } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  subscribePublishedChallenges,
  subscribePublishedDevotionals,
  subscribePublishedSermons,
  subscribeUserChallengeProgress,
  toggleChallengeDay,
} from '@/src/services/firestoreService';
import { Devotional, PrayerChallenge, Sermon, SermonContentType } from '@/src/types/ministry';
import { getYouTubeEmbedUrl, isSafeHttpUrl } from '@/src/utils/media';
import { AuthModal } from '@/src/components/AuthModal';

type FilterTab = 'all' | SermonContentType | 'daily-word';

const CONTENT_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'all', label: 'All Media' },
  { id: 'sermon', label: 'Latest Sermons' },
  { id: 'video', label: 'Video Messages' },
  { id: 'audio', label: 'Audio Messages' },
  { id: 'bible_study', label: 'Bible Studies' },
  { id: 'daily-word', label: 'Daily Word & Prayer' },
  { id: 'publication', label: 'Publications' },
  { id: 'teaching', label: 'Ministry Teachings' },
];

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as FilterTab) || 'all';
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [challenges, setChallenges] = useState<PrayerChallenge[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number[]>>({});
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isSignedIn } = useAuth();

  useEffect(() => {
    const t = (searchParams.get('tab') as FilterTab) || 'all';
    setActiveTab(t);
  }, [searchParams]);

  useEffect(() => {
    const unsubs = [
      subscribePublishedSermons(setSermons),
      subscribePublishedDevotionals(setDevotionals),
      subscribePublishedChallenges(setChallenges),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProgressMap({});
      return;
    }
    return subscribeUserChallengeProgress(user.uid, setProgressMap);
  }, [user?.uid]);

  const filteredSermons = useMemo(() => {
    return sermons.filter((item) => {
      const matchesTab = activeTab === 'all' || item.contentType === activeTab;
      if (!matchesTab) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.minister.toLowerCase().includes(q) ||
        (item.scriptureReferences || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    });
  }, [sermons, activeTab, searchTerm]);

  const handleSelectTab = (id: FilterTab) => {
    setActiveTab(id);
    if (id === 'all') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', id);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#26364A]">Teaching, Scripture & Publications</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">Discover</h1>
          <p className="text-sm text-[#68717D] max-w-2xl">
            Explore sermons, video and audio messages, Bible studies, publications, and daily spiritual nourishment.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-[#68717D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sermons, ministers, or scriptures..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-[#F4F2EC]/60 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-[#26364A] min-h-[44px]"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CONTENT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTab(t.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                activeTab === t.id
                  ? 'bg-[#26364A] text-white'
                  : 'bg-[#F4F2EC] text-[#252B33] hover:bg-[#E5E7EB]/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Daily Word & Spiritual Growth Section */}
      {activeTab === 'daily-word' ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#26364A]">Daily Devotionals & Scripture</h2>
            {devotionals.length === 0 ? (
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 text-sm text-[#68717D]">
                No devotionals have been published yet. Authorised ministry administrators can publish daily scriptures and reflections in the dashboard.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devotionals.map((dev) => (
                  <article
                    key={dev.id}
                    className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-3">
                      <div className="text-xs text-[#26364A] font-semibold tabular-nums">
                        {dev.publishDate} · {dev.scriptureReference}
                      </div>
                      <h3 className="text-lg font-semibold text-[#252B33]">{dev.title}</h3>
                      <blockquote className="rounded-lg bg-[#F4F2EC] border-l-2 border-[#B99A55] p-3.5 text-sm italic text-[#252B33] font-display">
                        “{dev.bibleVerse}”
                      </blockquote>
                      <p className="text-sm text-[#68717D] leading-relaxed">{dev.reflection}</p>
                    </div>
                    <div className="p-5 bg-[#26364A] text-white space-y-1">
                      <p className="text-xs font-semibold text-[#B99A55]">Prayer Point</p>
                      <p className="text-sm text-[#F4F2EC]">{dev.prayerPoint}</p>
                      {dev.readingPlan && (
                        <p className="text-xs text-[#E5E7EB]/80 pt-1">
                          Bible Reading Plan: {dev.readingPlan}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Private Prayer Challenge Tracker */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[#26364A]">
                Special Prayer Programmes
              </h2>
              <p className="text-xs text-[#68717D] mt-0.5">
                Personal, private participation tracker for 7, 14, or 21-day guided prayer programmes.
              </p>
            </div>

            {challenges.length === 0 ? (
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 text-sm text-[#68717D]">
                No special prayer programmes are currently active.
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((ch) => {
                  const completed = progressMap[ch.id] || [];
                  return (
                    <article
                      key={ch.id}
                      className="rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-[#26364A]">{ch.title}</h3>
                          {ch.description && (
                            <p className="text-xs text-[#68717D] mt-1">{ch.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#26364A] tabular-nums">
                          {completed.length} / {ch.durationDays} days completed
                        </span>
                      </div>

                      {!isSignedIn && (
                        <div className="rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] p-3 flex items-center justify-between gap-3 text-xs text-[#252B33]">
                          <span>Sign in to privately track your completed days.</span>
                          <button
                            type="button"
                            onClick={() => setAuthOpen(true)}
                            className="font-semibold text-[#26364A] underline shrink-0"
                          >
                            Sign In
                          </button>
                        </div>
                      )}

                      <div className="divide-y divide-[#E5E7EB]">
                        {ch.days.map((d) => {
                          const isDone = completed.includes(d.day);
                          return (
                            <div key={d.day} className="py-3 flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!user?.uid) {
                                    setAuthOpen(true);
                                    return;
                                  }
                                  void toggleChallengeDay(user.uid, ch.id, d.day, completed);
                                }}
                                aria-label={`Mark Day ${d.day} completed`}
                                className="mt-0.5 text-[#B99A55] min-h-[40px] min-w-[40px] flex items-center justify-center -m-2"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-[#B99A55]" />
                                ) : (
                                  <Circle className="w-5 h-5 text-[#68717D]/50" />
                                )}
                              </button>
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-[#252B33]">
                                  Day {d.day}: {d.title}
                                </p>
                                <p className="text-xs text-[#26364A] font-medium">
                                  {d.scriptureReference}
                                </p>
                                <p className="text-xs text-[#68717D]">{d.prayerPoint}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Sermons & Media Grid */
        <section className="space-y-4">
          {filteredSermons.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#E5E7EB] p-8 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-[#26364A] mx-auto" />
              <p className="text-sm font-medium text-[#252B33]">No teachings found</p>
              <p className="text-xs text-[#68717D]">
                {sermons.length === 0
                  ? 'Media administrators have not yet published sermons or teachings.'
                  : 'Try adjusting your search or category filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSermons.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedSermon(item)}
                  className="cursor-pointer rounded-xl bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#26364A]/45 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {item.thumbnailUrl && isSafeHttpUrl(item.thumbnailUrl) ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-[#26364A] flex flex-col items-center justify-center gap-2 text-[#E5E7EB] px-4">
                        <span className="w-11 h-11 rounded-full bg-[#1D2939] border border-white/15 flex items-center justify-center text-[#B99A55]">
                          {item.audioUrl && !item.videoUrl ? (
                            <Headphones className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </span>
                        <span className="text-[11px] font-medium text-[#E5E7EB]/85 capitalize">
                          {item.contentType.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    <div className="p-5 space-y-1.5">
                      <p className="text-xs font-semibold text-[#26364A] capitalize tabular-nums">
                        {item.contentType.replace('_', ' ')} · {item.date}
                      </p>
                      <h2 className="text-base font-semibold text-[#252B33] leading-snug">
                        {item.title}
                      </h2>
                      <p className="text-xs text-[#68717D]">{item.minister}</p>
                      {item.scriptureReferences && (
                        <p className="text-xs text-[#68717D]">{item.scriptureReferences}</p>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-[#F4F2EC]/80 border-t border-[#E5E7EB] text-xs font-semibold text-[#26364A]">
                    Open Teaching →
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sermon Detail / Player Modal */}
      {selectedSermon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2939]/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden shadow-lg my-8">
            <div className="bg-[#26364A] text-white px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#E5E7EB]/85 capitalize tabular-nums">
                  {selectedSermon.contentType.replace('_', ' ')} · {selectedSermon.date}
                </p>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedSermon.title}
                </h2>
                <p className="text-xs text-[#E5E7EB]/85 mt-0.5">
                  Minister: {selectedSermon.minister}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSermon(null)}
                aria-label="Close player"
                className="p-2 text-[#E5E7EB]/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {getYouTubeEmbedUrl(selectedSermon.videoUrl) ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-[#1D2939]">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedSermon.videoUrl)!}
                    title={selectedSermon.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                selectedSermon.videoUrl &&
                isSafeHttpUrl(selectedSermon.videoUrl) && (
                  <a
                    href={selectedSermon.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#B99A55] px-4 py-2.5 text-xs font-semibold text-[#1D2939] hover:bg-[#c5a764]"
                  >
                    <Play className="w-4 h-4" />
                    <span>Open Video Message</span>
                  </a>
                )
              )}

              {selectedSermon.audioUrl && isSafeHttpUrl(selectedSermon.audioUrl) && (
                <div className="rounded-xl bg-[#F4F2EC] p-3.5 border border-[#E5E7EB] space-y-2">
                  <p className="text-xs font-semibold text-[#26364A]">Audio Message</p>
                  <audio controls className="w-full" src={selectedSermon.audioUrl}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {selectedSermon.scriptureReferences && (
                <p className="text-xs font-semibold text-[#26364A]">
                  Scripture References: {selectedSermon.scriptureReferences}
                </p>
              )}

              {selectedSermon.description && (
                <p className="text-sm text-[#252B33] leading-relaxed whitespace-pre-line">
                  {selectedSermon.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};
