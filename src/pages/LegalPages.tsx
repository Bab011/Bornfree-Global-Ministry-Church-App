import React from 'react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <article className="max-w-3xl mx-auto rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
      <header className="space-y-2 bg-[#F4F2EC]/80 border-b border-[#E5E7EB] p-6 md:px-10 md:py-7">
        <p className="text-xs font-semibold text-[#26364A]">Nigeria Data Protection Act 2023</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">Privacy Policy</h1>
        <p className="text-xs text-[#68717D]">{MINISTRY_IDENTITY.name}</p>
      </header>

      <section className="p-6 md:p-10 space-y-4 text-sm text-[#252B33] leading-relaxed">
        <h2 className="text-lg font-semibold text-[#26364A]">1. Purpose and Scope</h2>
        <p>
          {MINISTRY_IDENTITY.name} (“the Ministry”), located at {MINISTRY_IDENTITY.address}, respects your privacy and handles personal data in compliance with the Nigeria Data Protection Act (NDPA) 2023 and applicable international privacy principles.
        </p>

        <h2 className="text-lg font-semibold text-[#26364A] pt-2">2. Sensitive Pastoral & Prayer Data</h2>
        <p>
          Prayer requests, pastoral counselling inquiries, and first-time visitor contact information are treated as sensitive personal data. Private prayer requests and pastoral notes are strictly restricted by role-based Firestore security rules to authorised pastoral personnel and are never published automatically.
        </p>

        <h2 className="text-lg font-semibold text-[#26364A] pt-2">3. Consent & Lawful Basis</h2>
        <p>
          We collect personal information only with your explicit consent when you register as a member, submit a first-time visitor form, register for an event, or request pastoral follow-up. Public browsing of sermons, devotionals, service schedules, and public events requires no registration.
        </p>

        <h2 className="text-lg font-semibold text-[#26364A] pt-2">4. Data Retention & Your Rights</h2>
        <p>
          You have the right to access, rectify, or request deletion of your personal data at any time. Signed-in members can update their profile details directly from their Profile screen or contact Ministry leadership to request full record erasure.
        </p>
      </section>
    </article>
  );
};

export const TermsOfUsePage: React.FC = () => {
  return (
    <article className="max-w-3xl mx-auto rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
      <header className="space-y-2 bg-[#F4F2EC]/80 border-b border-[#E5E7EB] p-6 md:px-10 md:py-7">
        <p className="text-xs font-semibold text-[#26364A]">{MINISTRY_IDENTITY.name}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">Terms of Use</h1>
      </header>

      <section className="p-6 md:p-10 space-y-4 text-sm text-[#252B33] leading-relaxed">
        <h2 className="text-lg font-semibold text-[#26364A]">1. Acceptance of Terms</h2>
        <p>
          By accessing the {MINISTRY_IDENTITY.name} digital application, you agree to use its community features, prayer wall, and ministry resources respectfully and lawfully.
        </p>

        <h2 className="text-lg font-semibold text-[#26364A] pt-2">2. Community Moderation</h2>
        <p>
          Submissions intended for the Public Prayer Wall or Testimonies are reviewed by authorised ministry administrators before publication to protect member privacy and uphold biblical standards.
        </p>

        <h2 className="text-lg font-semibold text-[#26364A] pt-2">3. Spiritual Content</h2>
        <p>
          Sermons, devotionals, publications, and teachings published in this application remain the intellectual and spiritual property of {MINISTRY_IDENTITY.name} unless otherwise noted.
        </p>
      </section>
    </article>
  );
};
