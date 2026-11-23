import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

/**
 * Curated authentic Bornfree Global Ministry photographs mapped to editorial slots.
 */
export const BORNFREE_PHOTOS = {
  heroSanctuary: '/assets/aistudio/Bornfree_Global_1_bf2e266d.jpg',
  pastorPreachingWide: '/assets/aistudio/BORNFREE_SENIOR_PASTOR_2_1a76c8ae.jpg',
  pastorSpotlight: '/assets/aistudio/BORNFREE_SENIOR_PASTOR_1f456a80.jpg',
  convention2026: '/assets/aistudio/BORNFREE_CONVENTION_2026_FLYER_17f89f1a.jpg',
  wordStudy: '/assets/aistudio/BORNFREE_PASTORS_7f593a2b.jpg',
  prayerFocus: '/assets/aistudio/BORNFREE_2_2df9151e.jpg',
  choirWorship: '/assets/aistudio/BORNFREE_CHOIR_f1ee0268.jpg',
  choirStudy: '/assets/aistudio/BORNFREE_CHOIR_2_87a1f587.jpg',
  membersRow: '/assets/aistudio/BORNFREE_MEMBERS_2_acdd3c27.jpg',
  celebration: '/assets/aistudio/BORNFREE_SPECIAL_BIRTHDAY_f107a1c1.jpg',
  membersFellowship: '/assets/aistudio/BORNFREE_MEMBERS_137cf89f.jpg',
} as const;

/**
 * Signature Element 1: Hand-painted highlighter swipe behind the first 1-2 words
 * of main section titles, slightly rotated (-2deg), bleeding slightly left.
 */
export const HighlighterSwipe: React.FC<{
  highlight: string;
  rest?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  onDark?: boolean;
}> = ({ highlight, rest, as: Tag = 'h2', className = '', onDark = false }) => {
  return (
    <Tag
      className={`font-display font-light tracking-[-0.02em] leading-[1.1] ${
        onDark ? 'text-white' : 'text-[#151515]'
      } ${className}`}
    >
      <span className="relative inline-block mr-[0.22em]">
        <svg
          aria-hidden="true"
          viewBox="0 0 220 44"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -left-2.5 -right-1.5 -bottom-0.5 top-0.5 w-[calc(100%+16px)] h-[calc(100%-2px)] -rotate-2 z-0"
        >
          <path
            d="M8,9 C48,3 145,4 206,7 C216,8 219,17 215,27 C212,35 198,38 175,37 C115,36 44,39 10,36 C2,35 1,24 4,15 C5,11 6,9 8,9 Z"
            fill="#FCDC00"
          />
        </svg>
        <span className="relative z-10 text-[#151515] font-normal">{highlight}</span>
      </span>
      {rest && <span>{rest}</span>}
    </Tag>
  );
};

/**
 * Signature Element 4 (Dark variant): Square white or sand date tile.
 */
export const SquareDateTile: React.FC<{
  day: string;
  month: string;
  variant?: 'white' | 'sand';
}> = ({ day, month, variant = 'white' }) => (
  <div
    className={`w-16 h-16 shrink-0 flex flex-col items-center justify-center rounded-[2px] ${
      variant === 'sand'
        ? 'bg-[#E9DFC6] text-[#151515]'
        : 'bg-white text-[#151515]'
    }`}
  >
    <span className="text-2xl font-normal leading-none tabular-nums">{day}</span>
    <span className="text-[11px] font-normal text-[#6B6A67] mt-1 leading-none">{month}</span>
  </div>
);

/**
 * Signature Element 7: Overlapping stack of circular member avatars next to a circular white "+" button.
 */
export const CommunityAvatarCue: React.FC<{
  to?: string;
  label?: string;
  ringColorClass?: string;
}> = ({ to = '/new-here', label = 'Join Bornfree community', ringColorClass = 'ring-[#151515]' }) => {
  const avatars = [
    { src: BORNFREE_PHOTOS.membersFellowship, alt: 'Bornfree Global Ministry member' },
    { src: BORNFREE_PHOTOS.choirStudy, alt: 'Bornfree choir member in study' },
    { src: BORNFREE_PHOTOS.membersRow, alt: 'Bornfree congregation member' },
  ];

  return (
    <div className="inline-flex items-center">
      <div className="flex items-center -space-x-2.5">
        {avatars.map((av, idx) => (
          <img
            key={idx}
            src={av.src}
            alt={av.alt}
            loading="lazy"
            className={`w-10 h-10 rounded-full object-cover object-top ring-2 ${ringColorClass}`}
          />
        ))}
      </div>
      <Link
        to={to}
        aria-label={label}
        title={label}
        className={`btn-press -ml-2 relative z-10 w-10 h-10 rounded-full bg-white text-[#151515] flex items-center justify-center ring-2 ${ringColorClass} hover:bg-[#FCDC00]`}
      >
        <Plus className="w-4 h-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
};

/**
 * Signature Element 8: Full-width "Explore more" row with square white arrow button at right.
 */
export const ExploreMoreRow: React.FC<{
  to: string;
  label: string;
  subtitle?: string;
  onDark?: boolean;
}> = ({ to, label, subtitle, onDark = false }) => (
  <Link
    to={to}
    className={`group flex items-center justify-between gap-4 py-4 border-b transition-colors ${
      onDark
        ? 'border-white/15 text-white hover:border-white/35'
        : 'border-[#151515]/15 text-[#151515] hover:border-[#151515]/40'
    }`}
  >
    <div className="min-w-0">
      <span className="text-base font-normal tracking-[-0.01em] block">{label}</span>
      {subtitle && (
        <span
          className={`text-xs font-normal mt-0.5 block ${
            onDark ? 'text-[#A3A19D]' : 'text-[#6B6A67]'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
    <span
      className={`btn-press w-11 h-11 shrink-0 rounded-[2px] flex items-center justify-center transition-colors ${
        onDark
          ? 'bg-white text-[#151515] group-hover:bg-[#FCDC00]'
          : 'bg-white border border-[#151515]/15 text-[#151515] group-hover:bg-[#FCDC00] group-hover:border-[#FCDC00]'
      }`}
    >
      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
    </span>
  </Link>
);

/**
 * Subtle scroll fade-up container respecting prefers-reduced-motion.
 */
export const EditorialReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
