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
import { BORNFREE_PHOTOS, CommunityAvatarCue, HighlighterSwipe } from '@/src/components/EditorialUI';

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
      <header className="bg-white border border-[#151515]/12 overflow-hidden rounded-[2px]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8 p-6 md:p-8 space-y-3 flex flex-col justify-center">
            <p className="text-xs font-normal text-[#6B6A67]">Fellowship & Pastoral Care</p>
            <HighlighterSwipe
              highlight="Connect"
              rest="With Us"
              as="h1"
              className="text-3xl sm:text-4xl"
            />
            <p className="text-sm text-[#6B6A67] max-w-xl">
              Learn about Bornfree Global Ministry, connect with a pastor, explore departments, or plan your visit in Lagos.
            </p>
            <div className="pt-2">
              <CommunityAvatarCue to="/new-here" ringColorClass="ring-white" />
            </div>
          </div>
          <div className="md:col-span-4 bg-[#151515]">
            <img
              src={BORNFREE_PHOTOS.celebration}
              alt="Bornfree Global Ministry church fellowship"
              className="w-full h-48 md:h-full object-cover object-center"
            />
          </div>
        </div>
      </header>

      {/* About, Mission & Vision */}
      <section className="bg-white border border-[#151515]/12 p-6 md:p-8 space-y-6 rounded-[2px]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#F0F0EE] p-2 shrink-0 flex items-center justify-center rounded-[2px]">
            <img
              src={MINISTRY_IDENTITY.logoUrl}
              alt="Bornfree Global Ministry Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-display font-normal text-2xl text-[#151515]">
              {MINISTRY_IDENTITY.name}
            </h2>
            <p className="text-sm italic font-semibold text-[#6B6A67]">
              “{MINISTRY_IDENTITY.motto}”
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F0F0EE] border border-[#151515]/12 p-5 space-y-1.5 rounded-[2px]">
            <h3 className="text-sm font-semibold text-[#151515]">Mission Statement</h3>
            <p className="text-sm text-[#151515] leading-relaxed">
              {MINISTRY_IDENTITY.mission}
            </p>
          </div>
          <div className="bg-[#151515] text-white p-5 space-y-1.5 rounded-[2px]">
            <h3 className="text-sm font-semibold text-[#FCDC00]">Vision Statement</h3>
            <p className="text-sm text-[#E5E5E2] leading-relaxed">
              {MINISTRY_IDENTITY.vision}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/new-here"
            className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#F0F0EE] border border-[#151515]/15 px-4 py-2.5 text-xs font-medium text-[#151515] hover:bg-[#E9DFC6] min-h-[44px]"
          >
            <Users className="w-4 h-4 text-[#151515]" strokeWidth={1.5} />
            <span>First-Time Visitors</span>
          </Link>
          <Link
            to="/prayer"
            className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#F0F0EE] border border-[#151515]/15 px-4 py-2.5 text-xs font-medium text-[#151515] hover:bg-[#E9DFC6] min-h-[44px]"
          >
            <HeartHandshake className="w-4 h-4 text-[#151515]" strokeWidth={1.5} />
            <span>Prayer Centre</span>
          </Link>
        </div>
      </section>

      {/* Contact a Pastor */}
      <section
        id="contact-pastor"
        className="bg-white border border-[#151515]/12 p-6 md:p-8 space-y-5 rounded-[2px]"
      >
        <div className="space-y-1 border-b border-[#151515]/12 pb-4">
          <h2 className="font-display font-light text-2xl sm:text-3xl text-[#151515]">
            Contact a Pastor
          </h2>
          <p className="text-sm text-[#6B6A67]">
            Confidential requests for spiritual guidance, pastoral or family counselling, or hospital/home visits. Accessible only to authorised pastoral leadership.
          </p>
        </div>

        {pastoralSuccess ? (
          <div className="bg-[#F0F0EE] border border-[#151515]/12 p-6 space-y-2 rounded-[2px]">
            <div className="flex items-center gap-2 font-medium text-[#151515]">
              <CheckCircle2 className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
              <span>Pastoral Request Submitted</span>
            </div>
            <p className="text-xs text-[#6B6A67]">
              Reference: <span className="font-mono font-medium text-[#151515]">{pastoralSuccess}</span>. An authorised pastor will attend to your request confidentially.
            </p>
            <button
              type="button"
              onClick={() => setPastoralSuccess(null)}
              className="text-xs font-semibold text-[#151515] underline pt-1"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handlePastoralSubmit} className="space-y-4">
            {pastoralError && (
              <div className="rounded-[2px] bg-red-50 border border-red-300 p-3 text-xs text-red-800">
                {pastoralError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#151515] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#151515] mb-1">
                  Request Category *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as PastoralRequestType)}
                  className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
                >
                  {PASTORAL_REQUEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#151515] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#151515] mb-1">
                  Phone Number & Preferred Contact
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
                    placeholder="Optional phone"
                  />
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    className="rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2.5 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your question or counselling request..."
                className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-[#6B6A67] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-[#151515]"
              />
              <span>
                I consent to authorised Bornfree pastoral personnel accessing this request solely to provide pastoral care, per our{' '}
                <Link to="/privacy" className="underline font-medium text-[#151515]">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-6 py-2.5 text-sm font-semibold text-[#151515] min-h-[44px] disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send to Pastoral Team'}
            </button>
          </form>
        )}
      </section>

      {/* Location & Official Contact */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#151515]/12 p-6 space-y-4 rounded-[2px]">
          <div className="flex items-center gap-2 text-[#151515]">
            <MapPin className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
            <h2 className="font-display font-normal text-xl text-[#151515]">Church Location</h2>
          </div>
          <p className="text-sm text-[#151515] leading-relaxed">
            {MINISTRY_IDENTITY.address}
          </p>
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex items-center gap-2 rounded-[2px] bg-[#151515] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1F1D1C] min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-[#FCDC00]" strokeWidth={1.5} />
            <span>Open Directions</span>
          </a>

          {settings?.mapEmbedUrl && isSafeHttpUrl(settings.mapEmbedUrl) ? (
            <iframe
              src={settings.mapEmbedUrl}
              title="Bornfree Global Ministry Location Map"
              className="w-full h-48 rounded-[2px] border border-[#151515]/12"
              loading="lazy"
            />
          ) : (
            <p className="text-xs text-[#6B6A67]">
              Interactive embedded map awaits administrator map URL configuration. Use “Open Directions” above for navigation.
            </p>
          )}
        </div>

        <div className="bg-white border border-[#151515]/12 p-6 space-y-4 rounded-[2px]">
          <h2 className="font-display font-normal text-xl text-[#151515]">Contact the Ministry</h2>
          <div className="space-y-3 text-sm text-[#151515]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[2px] bg-[#F0F0EE] border border-[#151515]/12 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#151515]" strokeWidth={1.5} />
              </div>
              <span>
                {settings?.officialEmail || 'Official ministry email awaiting configuration'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[2px] bg-[#F0F0EE] border border-[#151515]/12 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#151515]" strokeWidth={1.5} />
              </div>
              <span>
                {settings?.officialPhone || 'Official ministry phone awaiting configuration'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#151515]/12 space-y-2">
            <h3 className="text-xs font-semibold text-[#151515]">Governance & Legal</h3>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-1.5 text-[#151515] hover:underline"
              >
                <Shield className="w-3.5 h-3.5 text-[#151515]" strokeWidth={1.5} />
                <span>Privacy Policy (NDPA 2023)</span>
              </Link>
              <Link to="/terms" className="text-[#151515] hover:underline">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Departments & Volunteer Opportunities */}
      <section className="bg-white border border-[#151515]/12 p-6 md:p-8 space-y-4 rounded-[2px]">
        <div className="border-b border-[#151515]/12 pb-4">
          <h2 className="font-display font-light text-2xl sm:text-3xl text-[#151515]">
            Ministry Departments & Volunteer Opportunities
          </h2>
          <p className="text-sm text-[#6B6A67] mt-1">
            Serve the body of Christ through our local and digital ministry teams.
          </p>
        </div>

        {departments.length === 0 ? (
          <p className="text-sm text-[#6B6A67]">
            Ministry departments will appear here once published by leadership. You may express interest in serving using the Contact a Pastor form above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <article
                key={dept.id}
                className="bg-[#F0F0EE] border border-[#151515]/12 p-4 space-y-1.5 rounded-[2px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-medium text-[#151515]">{dept.name}</h3>
                  <span className="text-xs font-semibold text-[#151515]">
                    {dept.isOpenForVolunteers ? 'Open to Volunteers' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-[#151515]">{dept.description}</p>
                {dept.meetingInfo && (
                  <p className="text-xs text-[#6B6A67]">{dept.meetingInfo}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
