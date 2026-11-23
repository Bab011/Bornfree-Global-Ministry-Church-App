import React from 'react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';
import { HighlighterSwipe } from '@/src/components/EditorialUI';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <article className="max-w-3xl mx-auto bg-white border border-[#151515]/12 overflow-hidden rounded-[2px]">
      <header className="space-y-2 bg-[#151515] text-white p-6 md:px-10 md:py-8">
        <p className="text-xs font-normal text-[#A3A19D]">Nigeria Data Protection Act 2023</p>
        <HighlighterSwipe
          highlight="Privacy"
          rest="Policy"
          as="h1"
          onDark
          className="text-3xl sm:text-4xl"
        />
        <p className="text-xs text-[#A3A19D] pt-1">{MINISTRY_IDENTITY.name}</p>
      </header>

      <section className="p-6 md:p-10 space-y-4 text-sm text-[#151515] leading-relaxed">
        <h2 className="font-display font-normal text-xl text-[#151515]">
          1. Purpose and Scope
        </h2>
        <p className="text-[#6B6A67]">
          {MINISTRY_IDENTITY.name} (“the Ministry”), located at {MINISTRY_IDENTITY.address}, respects your privacy and handles personal data in compliance with the Nigeria Data Protection Act (NDPA) 2023 and applicable international privacy principles.
        </p>

        <h2 className="font-display font-normal text-xl text-[#151515] pt-2">
          2. Sensitive Pastoral & Prayer Data
        </h2>
        <p className="text-[#6B6A67]">
          Prayer requests, pastoral counselling inquiries, and first-time visitor contact information are treated as sensitive personal data. Private prayer requests and pastoral notes are strictly restricted by role-based Firestore security rules to authorised pastoral personnel and are never published automatically.
        </p>

        <h2 className="font-display font-normal text-xl text-[#151515] pt-2">
          3. Consent & Lawful Basis
        </h2>
        <p className="text-[#6B6A67]">
          We collect personal information only with your explicit consent when you register as a member, submit a first-time visitor form, register for an event, or request pastoral follow-up. Public browsing of sermons, devotionals, service schedules, and public events requires no registration.
        </p>

        <h2 className="font-display font-normal text-xl text-[#151515] pt-2">
          4. Data Retention & Your Rights
        </h2>
        <p className="text-[#6B6A67]">
          You have the right to access, rectify, or request deletion of your personal data at any time. Signed-in members can update their profile details directly from their Profile screen or contact Ministry leadership to request full record erasure.
        </p>
      </section>
    </article>
  );
};

export const TermsOfUsePage: React.FC = () => {
  return (
    <article className="max-w-3xl mx-auto bg-white border border-[#151515]/12 overflow-hidden rounded-[2px]">
      <header className="space-y-2 bg-[#151515] text-white p-6 md:px-10 md:py-8">
        <p className="text-xs font-normal text-[#A3A19D]">{MINISTRY_IDENTITY.name}</p>
        <HighlighterSwipe
          highlight="Terms"
          rest="of Use"
          as="h1"
          onDark
          className="text-3xl sm:text-4xl"
        />
      </header>

      <section className="p-6 md:p-10 space-y-4 text-sm text-[#151515] leading-relaxed">
        <h2 className="font-display font-normal text-xl text-[#151515]">
          1. Acceptance of Terms
        </h2>
        <p className="text-[#6B6A67]">
          By accessing the {MINISTRY_IDENTITY.name} digital application, you agree to use its community features, prayer wall, and ministry resources respectfully and lawfully.
        </p>

        <h2 className="font-display font-normal text-xl text-[#151515] pt-2">
          2. Community Moderation
        </h2>
        <p className="text-[#6B6A67]">
          Submissions intended for the Public Prayer Wall or Testimonies are reviewed by authorised ministry administrators before publication to protect member privacy and uphold biblical standards.
        </p>

        <h2 className="font-display font-normal text-xl text-[#151515] pt-2">
          3. Spiritual Content
        </h2>
        <p className="text-[#6B6A67]">
          Sermons, devotionals, publications, and teachings published in this application remain the intellectual and spiritual property of {MINISTRY_IDENTITY.name} unless otherwise noted.
        </p>
      </section>
    </article>
  );
};
