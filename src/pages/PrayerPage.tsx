import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  Lock,
  MessageCircleHeart,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { PRAYER_CATEGORIES, PREFERRED_CONTACT_METHODS } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  prayForWallEntry,
  sendEncouragement,
  submitPrayerRequest,
  submitTestimony,
  subscribeApprovedPrayerResponses,
  subscribeApprovedPrayerWall,
  subscribeApprovedTestimonies,
  subscribeMyPrayerRequests,
} from '@/src/services/firestoreService';
import {
  PrayerCategory,
  PrayerPrivacy,
  PrayerRequest,
  PrayerResponse,
  PrayerWallEntry,
  PreferredContact,
  Testimony,
} from '@/src/types/ministry';
import { AuthModal } from '@/src/components/AuthModal';

type PrayerTab = 'submit' | 'my-requests' | 'prayer-wall' | 'testimonies';

export const PrayerPage: React.FC = () => {
  const { user, profile, isSignedIn } = useAuth();
  const [tab, setTab] = useState<PrayerTab>('submit');
  const [authOpen, setAuthOpen] = useState(false);

  // Submit Prayer Request state
  const [name, setName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Spiritual Growth');
  const [description, setDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('In-App Only');
  const [privacy, setPrivacy] = useState<PrayerPrivacy>('private');
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [prayerSuccessId, setPrayerSuccessId] = useState<string | null>(null);
  const [prayerError, setPrayerError] = useState<string | null>(null);

  // My Requests
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);

  // Prayer Wall
  const [wallEntries, setWallEntries] = useState<PrayerWallEntry[]>([]);
  const [responses, setResponses] = useState<PrayerResponse[]>([]);
  const [prayedIds, setPrayedIds] = useState<Record<string, boolean>>({});
  const [encourageTarget, setEncourageTarget] = useState<string | null>(null);
  const [encourageMsg, setEncourageMsg] = useState('');
  const [encourageStatus, setEncourageStatus] = useState<string | null>(null);

  // Testimonies
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [testimonyName, setTestimonyName] = useState(profile?.displayName || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [testimonyCategory, setTestimonyCategory] = useState('Thanksgiving');
  const [testimonyDesc, setTestimonyDesc] = useState('');
  const [testimonyPhotoUrl, setTestimonyPhotoUrl] = useState('');
  const [permissionToPublish, setPermissionToPublish] = useState(true);
  const [submittingTestimony, setSubmittingTestimony] = useState(false);
  const [testimonyDone, setTestimonyDone] = useState(false);
  const [testimonyError, setTestimonyError] = useState<string | null>(null);

  useEffect(() => {
    const unsubs = [
      subscribeApprovedPrayerWall(setWallEntries),
      subscribeApprovedPrayerResponses(setResponses),
      subscribeApprovedTestimonies(setTestimonies),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setMyRequests([]);
      return;
    }
    return subscribeMyPrayerRequests(user.uid, setMyRequests);
  }, [user?.uid]);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerError(null);
    if (description.trim().length < 5) {
      setPrayerError('Please enter your prayer request (at least 5 characters).');
      return;
    }
    setSubmittingPrayer(true);
    try {
      const id = await submitPrayerRequest({
        name,
        email,
        phone,
        category,
        description,
        preferredContact,
        privacy,
      });
      setPrayerSuccessId(id);
      setDescription('');
    } catch (err) {
      setPrayerError(err instanceof Error ? err.message : 'Unable to submit prayer request.');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handlePrayAction = async (wallId: string) => {
    if (!isSignedIn) {
      setAuthOpen(true);
      return;
    }
    if (prayedIds[wallId]) return;
    setPrayedIds((prev) => ({ ...prev, [wallId]: true }));
    try {
      await prayForWallEntry(wallId, profile?.displayName || user?.displayName || 'Believer');
    } catch {
      setPrayedIds((prev) => ({ ...prev, [wallId]: false }));
    }
  };

  const handleSendEncouragement = async (wallId: string) => {
    if (!isSignedIn) {
      setAuthOpen(true);
      return;
    }
    if (!encourageMsg.trim()) return;
    try {
      await sendEncouragement(
        wallId,
        profile?.displayName || user?.displayName || 'Member',
        encourageMsg
      );
      setEncourageMsg('');
      setEncourageTarget(null);
      setEncourageStatus('Your encouragement has been submitted for moderation.');
      setTimeout(() => setEncourageStatus(null), 4000);
    } catch (err) {
      setEncourageStatus(err instanceof Error ? err.message : 'Failed to send encouragement.');
    }
  };

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonyError(null);
    if (testimonyDesc.trim().length < 10) {
      setTestimonyError('Please share at least 10 characters for your testimony.');
      return;
    }
    setSubmittingTestimony(true);
    try {
      await submitTestimony({
        authorName: testimonyName,
        isAnonymous,
        category: testimonyCategory,
        description: testimonyDesc,
        photoUrl: testimonyPhotoUrl,
        permissionToPublish,
      });
      setTestimonyDone(true);
      setTestimonyDesc('');
      setTestimonyPhotoUrl('');
    } catch (err) {
      setTestimonyError(err instanceof Error ? err.message : 'Unable to submit testimony.');
    } finally {
      setSubmittingTestimony(false);
    }
  };

  const statusSteps = ['Received', 'Assigned', 'Follow-up', 'Closed'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-2">
        <p className="text-xs font-semibold text-[#26364A]">Sanctuary of Intercession & Care</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">Prayer Centre</h1>
        <p className="text-sm text-[#68717D] max-w-2xl leading-relaxed">
          Submit confidential prayer requests for pastoral care, join our moderated community Prayer Wall, or share a testimony of God’s faithfulness.
        </p>
      </header>

      {/* Segmented Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Prayer Centre sections"
        className="flex items-center gap-1 p-1 rounded-xl bg-[#E5E7EB]/75 overflow-x-auto"
      >
        {[
          { id: 'submit', label: 'Submit Request' },
          { id: 'my-requests', label: 'My Requests' },
          { id: 'prayer-wall', label: 'Prayer Wall' },
          { id: 'testimonies', label: 'Testimonies' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id as PrayerTab)}
            className={`flex-1 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
              tab === item.id
                ? 'bg-[#26364A] text-white'
                : 'text-[#68717D] hover:text-[#252B33]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Submit Prayer Request */}
      {tab === 'submit' && (
        <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-4 text-xs text-[#252B33] leading-relaxed">
            <Lock className="w-4 h-4 text-[#26364A] shrink-0 mt-0.5" />
            <p>
              <strong>Confidentiality Guarantee:</strong> Private prayer requests are strictly accessible only to authorised assigned pastoral personnel. Nothing is ever published to the Prayer Wall without your explicit selection and leadership moderation.
            </p>
          </div>

          {prayerSuccessId ? (
            <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#26364A]">
                <CheckCircle2 className="w-5 h-5 text-[#B99A55]" />
                <h2 className="text-base font-semibold">Prayer Request Received</h2>
              </div>
              <p className="text-sm text-[#68717D]">
                Reference: <span className="font-mono text-xs text-[#252B33]">{prayerSuccessId}</span>. Our pastoral and prayer team is standing with you in prayer.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPrayerSuccessId(null)}
                  className="rounded-lg bg-[#B99A55] px-4 py-2 text-xs font-semibold text-[#1D2939] hover:bg-[#c5a764] min-h-[40px]"
                >
                  Submit Another Request
                </button>
                {isSignedIn && (
                  <button
                    type="button"
                    onClick={() => setTab('my-requests')}
                    className="rounded-lg bg-white border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/40 min-h-[40px]"
                  >
                    Track My Requests
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handlePrayerSubmit} className="space-y-4">
              {prayerError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                  {prayerError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Prayer Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  >
                    {PRAYER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Preferred Contact Method *
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value as PreferredContact)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  >
                    {PREFERRED_CONTACT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Prayer Request Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share how we can pray with you..."
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#252B33]">
                  Privacy Preference *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      val: 'private' as const,
                      title: 'Private',
                      desc: 'Only authorised assigned pastoral personnel can access it.',
                    },
                    {
                      val: 'prayer_team' as const,
                      title: 'Prayer Team',
                      desc: 'Accessible to authorised prayer team members.',
                    },
                    {
                      val: 'public_wall' as const,
                      title: 'Public Prayer Wall',
                      desc: 'Shared with congregation only after moderation (no contact info).',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setPrivacy(opt.val)}
                      className={`text-left rounded-xl border p-3.5 transition-colors ${
                        privacy === opt.val
                          ? 'border-[#26364A] bg-[#F4F2EC]'
                          : 'border-[#E5E7EB] bg-white hover:bg-[#F4F2EC]/50'
                      }`}
                    >
                      <span className="block text-xs font-semibold text-[#26364A]">
                        {opt.title}
                      </span>
                      <span className="block text-[11px] text-[#68717D] mt-1 leading-snug">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPrayer}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B99A55] px-6 py-3 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[44px] disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-[#1D2939]" />
                <span>{submittingPrayer ? 'Submitting...' : 'Submit Prayer Request'}</span>
              </button>
            </form>
          )}
        </section>
      )}

      {/* TAB 2: My Requests Tracking */}
      {tab === 'my-requests' && (
        <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
          {!isSignedIn ? (
            <div className="py-8 text-center space-y-4">
              <Shield className="w-10 h-10 text-[#26364A] mx-auto" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[#26364A]">
                  Sign In to Track Your Prayer Requests
                </h2>
                <p className="text-sm text-[#68717D] max-w-md mx-auto">
                  For your privacy, only signed-in users can view the status history of their submitted prayer requests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-lg bg-[#B99A55] px-5 py-2.5 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] min-h-[44px]"
              >
                Sign In / Create Account
              </button>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="py-8 text-center space-y-2 text-sm text-[#68717D]">
              <p>You have not submitted any prayer requests while signed in.</p>
              <button
                type="button"
                onClick={() => setTab('submit')}
                className="text-xs font-semibold text-[#26364A] underline"
              >
                Submit a Prayer Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#26364A]">Your Prayer Requests</h2>
              <div className="space-y-4">
                {myRequests.map((req) => {
                  const activeIndex = Math.max(0, statusSteps.indexOf(req.status));
                  return (
                    <article
                      key={req.id}
                      className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#68717D]">
                        <span className="font-semibold text-[#26364A]">{req.category}</span>
                        <span>
                          Privacy: {req.privacy.replace('_', ' ')} · Status:{' '}
                          <strong className="text-[#252B33]">{req.status}</strong>
                        </span>
                      </div>
                      <p className="text-sm text-[#252B33] leading-relaxed">{req.description}</p>
                      {req.assignedPastorName && (
                        <p className="text-xs text-[#68717D]">
                          Assigned Pastor:{' '}
                          <span className="font-semibold text-[#252B33]">{req.assignedPastorName}</span>
                        </p>
                      )}
                      {req.followUpDate && (
                        <p className="text-xs text-[#68717D] tabular-nums">
                          Scheduled Follow-up: {req.followUpDate}
                        </p>
                      )}

                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {statusSteps.map((step, idx) => (
                          <div key={step} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                idx <= activeIndex ? 'bg-[#B99A55]' : 'bg-[#E5E7EB]'
                              }`}
                            />
                            <span
                              className={`block text-[11px] ${
                                idx <= activeIndex
                                  ? 'font-semibold text-[#26364A]'
                                  : 'text-[#68717D]'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Moderated Prayer Wall */}
      {tab === 'prayer-wall' && (
        <section className="space-y-4">
          {encourageStatus && (
            <div className="rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs font-medium text-[#26364A]">
              {encourageStatus}
            </div>
          )}

          {wallEntries.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#E5E7EB] p-8 text-center text-sm text-[#68717D]">
              No moderated prayer requests are currently on the public Prayer Wall. You can submit a request with “Public Prayer Wall” selected, and a Prayer Coordinator will review it before posting.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallEntries.map((entry) => {
                const entryResponses = responses.filter(
                  (r) => r.wallId === entry.id && r.type === 'encouragement' && r.message
                );
                return (
                  <article
                    key={entry.id}
                    className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#68717D]">
                        <span className="font-semibold text-[#26364A]">{entry.category}</span>
                        <span>{entry.displayName}</span>
                      </div>
                      <p className="text-sm text-[#252B33] leading-relaxed">
                        {entry.requestSummary}
                      </p>

                      {entryResponses.length > 0 && (
                        <div className="pt-2.5 space-y-1.5 border-t border-[#E5E7EB]">
                          {entryResponses.slice(0, 3).map((r) => (
                            <p key={r.id} className="text-xs text-[#68717D]">
                              <strong className="text-[#252B33]">{r.authorName}:</strong> {r.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 p-4 bg-[#F4F2EC]/80 border-t border-[#E5E7EB]">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrayAction(entry.id)}
                          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
                            prayedIds[entry.id]
                              ? 'bg-[#B99A55] text-[#1D2939]'
                              : 'bg-white border border-[#E5E7EB] text-[#252B33] hover:bg-[#E5E7EB]/50'
                          }`}
                        >
                          <HeartHandshake className="w-4 h-4" />
                          <span>
                            {prayedIds[entry.id] ? 'Praying' : 'I am praying'} ·{' '}
                            <span className="tabular-nums">{entry.prayingCount}</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEncourageTarget(encourageTarget === entry.id ? null : entry.id)
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26364A] hover:text-[#1D2939] hover:underline min-h-[40px]"
                        >
                          <MessageCircleHeart className="w-4 h-4" />
                          <span>Send Encouragement</span>
                        </button>
                      </div>

                      {encourageTarget === entry.id && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={encourageMsg}
                            onChange={(e) => setEncourageMsg(e.target.value)}
                            placeholder="Write an encouraging note..."
                            className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs focus:border-[#26364A] focus:outline-none min-h-[40px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendEncouragement(entry.id)}
                            className="rounded-lg bg-[#26364A] hover:bg-[#1D2939] px-3.5 py-2 text-xs font-semibold text-white min-h-[40px]"
                          >
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: Testimonies */}
      {tab === 'testimonies' && (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B99A55]" />
              <h2 className="text-lg font-semibold text-[#26364A]">Share Your Testimony</h2>
            </div>
            <p className="text-xs text-[#68717D]">
              All testimonies are reviewed by an authorised ministry administrator prior to publication.
            </p>

            {testimonyDone ? (
              <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-2">
                <p className="text-sm font-semibold text-[#26364A]">
                  Thank you for sharing your testimony!
                </p>
                <p className="text-xs text-[#68717D]">
                  It has been submitted for administrative review before publication.
                </p>
                <button
                  type="button"
                  onClick={() => setTestimonyDone(false)}
                  className="text-xs font-semibold text-[#26364A] underline"
                >
                  Submit another testimony
                </button>
              </div>
            ) : (
              <form onSubmit={handleTestimonySubmit} className="space-y-4">
                {testimonyError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                    {testimonyError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#252B33] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={isAnonymous ? 'Anonymous' : testimonyName}
                      onChange={(e) => setTestimonyName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px] disabled:opacity-60 disabled:bg-[#F4F2EC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#252B33] mb-1">
                      Testimony Category
                    </label>
                    <select
                      value={testimonyCategory}
                      onChange={(e) => setTestimonyCategory(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                    >
                      {PRAYER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Testimony Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={testimonyDesc}
                    onChange={(e) => setTestimonyDesc(e.target.value)}
                    placeholder="Share what God has done..."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252B33] mb-1">
                    Optional Photograph URL
                  </label>
                  <input
                    type="url"
                    value={testimonyPhotoUrl}
                    onChange={(e) => setTestimonyPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-[#252B33] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="accent-[#26364A]"
                    />
                    <span>Submit anonymously</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#252B33] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionToPublish}
                      onChange={(e) => setPermissionToPublish(e.target.checked)}
                      className="accent-[#26364A]"
                    />
                    <span>I grant permission to publish this testimony after review</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingTestimony}
                  className="rounded-lg bg-[#B99A55] px-5 py-2.5 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] min-h-[44px] disabled:opacity-60"
                >
                  {submittingTestimony ? 'Submitting...' : 'Submit Testimony'}
                </button>
              </form>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#26364A]">Published Testimonies</h2>
            {testimonies.length === 0 ? (
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 text-sm text-[#68717D]">
                No approved testimonies have been published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonies.map((t) => (
                  <article
                    key={t.id}
                    className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-[#68717D]">
                      <span className="font-semibold text-[#26364A]">{t.category}</span>
                      <span>{t.isAnonymous ? 'Anonymous' : t.authorName}</span>
                    </div>
                    <p className="text-sm text-[#252B33] leading-relaxed">{t.description}</p>
                    {t.photoUrl && (
                      <img
                        src={t.photoUrl}
                        alt="Testimony attachment"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover rounded-lg"
                      />
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};
