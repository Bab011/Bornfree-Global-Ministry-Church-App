import React, { useEffect, useState } from 'react';
import { CheckCircle2, PlayCircle, ArrowRight } from 'lucide-react';
import { DEFAULT_NEWCOMER_JOURNEY, MINISTRY_IDENTITY } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { submitVisitorRegistration, subscribeAppSettings } from '@/src/services/firestoreService';
import { AppSettings } from '@/src/types/ministry';
import { getYouTubeEmbedUrl } from '@/src/utils/media';
import { Link } from 'react-router-dom';

export const FirstTimeVisitorPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [discoverySource, setDiscoverySource] = useState('');
  const [visitedBefore, setVisitedBefore] = useState(false);
  const [wantsContact, setWantsContact] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAppSettings(setSettings);
  }, []);

  const welcomeVideoEmbed = getYouTubeEmbedUrl(settings?.welcomeVideoUrl);
  const journeySteps =
    settings?.newcomerJourney && settings.newcomerJourney.length > 0
      ? settings.newcomerJourney
      : DEFAULT_NEWCOMER_JOURNEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consentGiven) {
      setError('Please provide your consent so our follow-up team can care for your registration.');
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitVisitorRegistration({
        fullName,
        email,
        phone,
        country,
        city,
        discoverySource,
        visitedBefore,
        wantsContact,
        consentGiven,
      });
      setSubmittedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome to Bornfree */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-white p-2 border border-[#E5E7EB] shrink-0 flex items-center justify-center">
            <img
              src={MINISTRY_IDENTITY.logoUrl}
              alt="Bornfree Global Ministry Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#26364A]">
              First-Time Visitors & International Guests
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">
              NEW HERE? WE ARE GLAD YOU CAME.
            </h1>
            <p className="text-sm text-[#68717D] italic font-display">
              “{MINISTRY_IDENTITY.motto}”
            </p>
          </div>
        </div>

        <p className="text-sm md:text-base text-[#252B33] leading-relaxed">
          Whether you are joining us in Lagos, Nigeria or connecting from anywhere across the world, you are warmly welcome at Bornfree Global Ministry. We are a Christ-centred community committed to sound biblical teaching, fervent prayer, and loving fellowship.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-1.5">
            <h2 className="text-sm font-semibold text-[#26364A]">Our Mission</h2>
            <p className="text-sm text-[#252B33] leading-relaxed">
              {MINISTRY_IDENTITY.mission}
            </p>
          </div>
          <div className="rounded-xl bg-[#26364A] text-white p-5 space-y-1.5">
            <h2 className="text-sm font-semibold text-[#B99A55]">Our Vision</h2>
            <p className="text-sm text-[#F4F2EC] leading-relaxed">
              {MINISTRY_IDENTITY.vision}
            </p>
          </div>
        </div>

        {welcomeVideoEmbed ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#26364A]">Welcome Message</h2>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#1D2939]">
              <iframe
                src={welcomeVideoEmbed}
                title="Welcome to Bornfree Global Ministry"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-4 flex items-center gap-3 text-xs text-[#68717D]">
            <PlayCircle className="w-5 h-5 text-[#26364A] shrink-0" />
            <span>
              Welcome video message is awaiting configuration by a ministry administrator.
            </span>
          </div>
        )}
      </section>

      {/* Registration Form */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#26364A]">
            First-Time Visitor Registration
          </h2>
          <p className="text-sm text-[#68717D] mt-1">
            Let us know you visited so our welcome team can greet you and answer any questions.
          </p>
        </div>

        {submittedId ? (
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-[#26364A]">
              <CheckCircle2 className="w-5 h-5 text-[#B99A55]" />
              <h3 className="text-base font-semibold">Thank You for Connecting With Us</h3>
            </div>
            <p className="text-sm text-[#252B33]">
              Your registration has been received securely. If you requested follow-up, an authorised member of our Welcome & Follow-Up team will reach out respectfully.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/services/sunday"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26364A] hover:text-[#1D2939] hover:underline"
              >
                <span>View Sunday Worship Programme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26364A] hover:text-[#1D2939] hover:underline"
              >
                <span>Explore Sermons & Devotionals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  placeholder="+234 ..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  How Did You Discover Bornfree?
                </label>
                <select
                  value={discoverySource}
                  onChange={(e) => setDiscoverySource(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                >
                  <option value="">Select an option</option>
                  <option value="Friend or Family">Friend or Family</option>
                  <option value="Outreach / Crusade">Outreach or Crusade</option>
                  <option value="Online Search">Online Search</option>
                  <option value="Social Media / YouTube">Social Media or YouTube</option>
                  <option value="Lagos Neighbourhood">Lagos / Local Community</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  placeholder="e.g., Nigeria, United Kingdom, Canada"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  placeholder="e.g., Lagos, London, Toronto"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="flex items-center gap-2.5 text-sm text-[#252B33] cursor-pointer">
                <input
                  type="checkbox"
                  checked={visitedBefore}
                  onChange={(e) => setVisitedBefore(e.target.checked)}
                  className="rounded border-[#E5E7EB] accent-[#26364A]"
                />
                <span>I have visited a Bornfree service before</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm text-[#252B33] cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsContact}
                  onChange={(e) => setWantsContact(e.target.checked)}
                  className="rounded border-[#E5E7EB] accent-[#26364A]"
                />
                <span>I would like a member of the ministry team to contact me</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#68717D] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-[#E5E7EB] accent-[#26364A]"
                />
                <span>
                  I consent to Bornfree Global Ministry collecting and securely processing my contact information for pastoral welcome and follow-up in accordance with the Nigeria Data Protection Act 2023 and our{' '}
                  <Link to="/privacy" className="underline font-medium text-[#26364A]">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-6 py-3 text-sm font-semibold text-[#1D2939] transition-colors min-h-[44px] disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Visitor Registration'}
            </button>
          </form>
        )}
      </section>

      {/* Newcomer Engagement Journey */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#26364A]">
            Newcomer Engagement Journey
          </h2>
          <p className="text-sm text-[#68717D] mt-1">
            A gentle, optional 14-day introduction to our ministry community (with your consent).
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {journeySteps.map((step) => (
            <li
              key={step.day}
              className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-4 space-y-1"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[#26364A] tabular-nums">
                Day {step.day}
              </span>
              <h3 className="text-sm font-semibold text-[#252B33]">{step.title}</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
