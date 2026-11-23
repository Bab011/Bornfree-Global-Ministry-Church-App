import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HeartHandshake, Mail, MapPin, Phone, Shield, Users } from 'lucide-react';
import { MINISTRY_IDENTITY, PASTORAL_REQUEST_TYPES } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  submitPastoralRequest,
  subscribeAppSettings,
  subscribeDepartments,
} from '@/src/services/firestoreService';
import { AppSettings, Department, PastoralRequestType } from '@/src/types/ministry';
import { getDirectionsUrl } from '@/src/utils/serviceSchedule';
import { isSafeHttpUrl } from '@/src/utils/media';

export const ConnectPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Contact a Pastor form
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [requestType, setRequestType] = useState<PastoralRequestType>('General spiritual question');
  const [preferredContact, setPreferredContact] = useState('Email');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pastoralSuccess, setPastoralSuccess] = useState<string | null>(null);
  const [pastoralError, setPastoralError] = useState<string | null>(null);

  useEffect(() => {
    const unsubs = [subscribeDepartments(setDepartments), subscribeAppSettings(setSettings)];
    return () => unsubs.forEach((u) => u());
  }, []);

  const handlePastoralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPastoralError(null);
    if (!consentGiven) {
      setPastoralError('Please confirm your consent so our pastoral team can respond confidentially.');
      return;
    }
    if (message.trim().length < 5) {
      setPastoralError('Please provide details for your pastoral request.');
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitPastoralRequest({
        fullName,
        email,
        phone,
        requestType,
        message,
        preferredContact,
        consentGiven,
      });
      setPastoralSuccess(id);
      setMessage('');
    } catch (err) {
      setPastoralError(err instanceof Error ? err.message : 'Unable to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#26364A]">
          Fellowship & Pastoral Care
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">Connect With Us</h1>
        <p className="text-sm text-[#68717D]">
          Learn about Bornfree Global Ministry, connect with a pastor, explore departments, or plan your visit in Lagos.
        </p>
      </header>

      {/* About, Mission & Vision */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-1.5 border border-[#E5E7EB] shrink-0 flex items-center justify-center">
            <img
              src={MINISTRY_IDENTITY.logoUrl}
              alt="Bornfree Global Ministry Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#26364A]">{MINISTRY_IDENTITY.name}</h2>
            <p className="text-sm italic font-display text-[#68717D]">
              “{MINISTRY_IDENTITY.motto}”
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-5 space-y-1.5">
            <h3 className="text-sm font-semibold text-[#26364A]">Mission Statement</h3>
            <p className="text-sm text-[#252B33] leading-relaxed">
              {MINISTRY_IDENTITY.mission}
            </p>
          </div>
          <div className="rounded-xl bg-[#26364A] text-white p-5 space-y-1.5">
            <h3 className="text-sm font-semibold text-[#B99A55]">Vision Statement</h3>
            <p className="text-sm text-[#F4F2EC] leading-relaxed">
              {MINISTRY_IDENTITY.vision}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/new-here"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] px-4 py-2.5 text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/60 transition-colors min-h-[44px]"
          >
            <Users className="w-4 h-4 text-[#26364A]" />
            <span>First-Time Visitors</span>
          </Link>
          <Link
            to="/prayer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] px-4 py-2.5 text-xs font-semibold text-[#26364A] hover:bg-[#E5E7EB]/60 transition-colors min-h-[44px]"
          >
            <HeartHandshake className="w-4 h-4 text-[#26364A]" />
            <span>Prayer Centre</span>
          </Link>
        </div>
      </section>

      {/* Contact a Pastor */}
      <section
        id="contact-pastor"
        className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-5"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#26364A]">Contact a Pastor</h2>
          <p className="text-sm text-[#68717D]">
            Confidential requests for spiritual guidance, pastoral or family counselling, or hospital/home visits. Accessible only to authorised pastoral leadership.
          </p>
        </div>

        {pastoralSuccess ? (
          <div className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-6 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#26364A]">
              <CheckCircle2 className="w-5 h-5 text-[#B99A55]" />
              <span>Pastoral Request Submitted</span>
            </div>
            <p className="text-xs text-[#68717D]">
              Reference: <span className="font-mono font-medium text-[#252B33]">{pastoralSuccess}</span>. An authorised pastor will attend to your request confidentially.
            </p>
            <button
              type="button"
              onClick={() => setPastoralSuccess(null)}
              className="text-xs font-semibold text-[#26364A] hover:text-[#1D2939] underline pt-1"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handlePastoralSubmit} className="space-y-4">
            {pastoralError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                {pastoralError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">
                  Request Category *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as PastoralRequestType)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                >
                  {PASTORAL_REQUEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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
                  Phone Number & Preferred Contact
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                    placeholder="Optional phone"
                  />
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your question or counselling request..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none"
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
                I consent to authorised Bornfree pastoral personnel accessing this request solely to provide pastoral care, per our{' '}
                <Link to="/privacy" className="underline font-medium text-[#26364A]">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-6 py-2.5 text-sm font-semibold text-[#1D2939] transition-colors min-h-[44px] disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send to Pastoral Team'}
            </button>
          </form>
        )}
      </section>

      {/* Location & Official Contact */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#26364A]">
            <MapPin className="w-5 h-5 text-[#B99A55]" />
            <h2 className="text-lg font-semibold text-[#26364A]">Church Location</h2>
          </div>
          <p className="text-sm text-[#252B33] leading-relaxed">
            {MINISTRY_IDENTITY.address}
          </p>
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#26364A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D2939] transition-colors min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-[#B99A55]" />
            <span>Open Directions</span>
          </a>

          {settings?.mapEmbedUrl && isSafeHttpUrl(settings.mapEmbedUrl) ? (
            <iframe
              src={settings.mapEmbedUrl}
              title="Bornfree Global Ministry Location Map"
              className="w-full h-48 rounded-xl border border-[#E5E7EB]"
              loading="lazy"
            />
          ) : (
            <p className="text-xs text-[#68717D]">
              Interactive embedded map awaits administrator map URL configuration. Use “Open Directions” above for navigation.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#26364A]">Contact the Ministry</h2>
          <div className="space-y-3 text-sm text-[#252B33]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#26364A]" />
              </div>
              <span>
                {settings?.officialEmail || 'Official ministry email awaiting configuration'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F4F2EC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#26364A]" />
              </div>
              <span>
                {settings?.officialPhone || 'Official ministry phone awaiting configuration'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#26364A]">
              Governance & Legal
            </h3>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <Link to="/privacy" className="inline-flex items-center gap-1.5 text-[#252B33] hover:text-[#26364A] hover:underline">
                <Shield className="w-3.5 h-3.5 text-[#B99A55]" />
                <span>Privacy Policy (NDPA 2023)</span>
              </Link>
              <Link to="/terms" className="text-[#252B33] hover:text-[#26364A] hover:underline">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Departments & Volunteer Opportunities */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#26364A]">
            Ministry Departments & Volunteer Opportunities
          </h2>
          <p className="text-sm text-[#68717D] mt-1">
            Serve the body of Christ through our local and digital ministry teams.
          </p>
        </div>

        {departments.length === 0 ? (
          <p className="text-sm text-[#68717D]">
            Ministry departments will appear here once published by leadership. You may express interest in serving using the Contact a Pastor form above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <article
                key={dept.id}
                className="rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[#252B33]">{dept.name}</h3>
                  <span className="text-xs font-semibold text-[#26364A]">
                    {dept.isOpenForVolunteers ? 'Open to Volunteers' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-[#252B33]">{dept.description}</p>
                {dept.meetingInfo && (
                  <p className="text-xs text-[#68717D]">{dept.meetingInfo}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
