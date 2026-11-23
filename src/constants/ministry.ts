import { NewcomerJourneyStep, PastoralRequestType, PrayerCategory, PreferredContact, UserRole } from '@/src/types/ministry';

export const MINISTRY_IDENTITY = {
  name: 'BORNFREE GLOBAL MINISTRY',
  shortName: 'Bornfree Global Ministry',
  motto: 'Preaching Christ in Totality',
  mission:
    'Preaching the total gospel of Christ to the total man for the total freedom and making men live for God.',
  vision:
    'Reaching the unreached with the total gospel of Christ building the largest Christian community on earth today through media, crusade, outreach, evangelism and publications.',
  address:
    'No. 1, Bornfree Avenue, Off Saheed Hasan Street, Greenville Estate, Badore-Ajah, Lagos State, Nigeria.',
  timeZone: 'Africa/Lagos',
  timeZoneLabel: 'Nigerian Time (WAT, UTC+1)',
  logoUrl: '/assets/aistudio/BORNFREE_Design_LOGO_8d027548.png',
} as const;

export const WEDNESDAY_SERVICE_DEFAULTS = {
  id: 'wednesday',
  type: 'wednesday' as const,
  title: 'WEDNESDAY MIDWEEK SERVICE',
  timeRange: '6:00 PM – 8:00 PM',
  theme: 'THE WORD AND PRAYER',
  description: 'An evening dedicated to sharing the Word of God and corporate prayers.',
  venue: MINISTRY_IDENTITY.address,
  orderOfService: [
    { step: 1, title: 'Praise and Worship', note: 'Corporate praise and worship' },
    { step: 2, title: 'Word Ministration', note: 'Ministered by Senior Pastor, Resident Pastor, or Group Pastors' },
    { step: 3, title: 'Prayer Session', note: 'Corporate prayers and intercession' },
  ],
  eligibleMinisters: ['Senior Pastor', 'Resident Pastor', 'Group Pastors heading cell groups'],
};

export const SUNDAY_SERVICE_DEFAULTS = {
  id: 'sunday',
  type: 'sunday' as const,
  title: 'SUNDAY WORSHIP SERVICE',
  timeRange: '8:00 AM – 11:00 AM',
  description: 'Weekly gathering for worship, teaching, and fellowship in Lagos and online worldwide.',
  venue: MINISTRY_IDENTITY.address,
  orderOfService: [
    { step: 1, title: "Workers' Prayer", time: 'Before 8:00 AM Sunday School', note: 'Preparation and intercession before Sunday School' },
    { step: 2, title: 'Sunday School', time: '8:00 AM – 8:35 AM', note: 'Interactive study of the Scriptures' },
    { step: 3, title: 'Praise and Worship', note: 'Congregational worship' },
    { step: 4, title: 'Choir Ministration', note: 'Ministry in sacred song' },
    { step: 5, title: 'WORD ENCOUNTER', note: 'Main Word ministration by the Senior Pastor. Service concludes at 11:00 AM.' },
  ],
};

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  'Family and Marriage',
  'Health and Healing',
  'Career and Employment',
  'Financial Needs',
  'Spiritual Growth',
  'Children and Relationships',
  'Thanksgiving',
  'Other',
];

export const PREFERRED_CONTACT_METHODS: PreferredContact[] = [
  'Email',
  'Phone',
  'WhatsApp',
  'In-App Only',
  'No Contact Needed',
];

export const PASTORAL_REQUEST_TYPES: PastoralRequestType[] = [
  'General spiritual question',
  'Pastoral counselling request',
  'Family and marriage counselling request',
  'Hospital or home visit request',
  'Other pastoral assistance',
];

export const EVENT_CATEGORIES = [
  'Annual Convention',
  'Conference',
  'Crusade',
  'Outreach Programme',
  'Evangelism',
  'Special Prayer Programme',
  'Church Celebration',
  'Other Ministry Event',
];

export const DEFAULT_NEWCOMER_JOURNEY: NewcomerJourneyStep[] = [
  { day: 1, title: 'Welcome to Bornfree Global Ministry', description: 'Warm greeting and introduction to our global Christian family.' },
  { day: 2, title: "Introduction to the Ministry's Mission and Vision", description: 'Discover how we preach Christ in totality across communities.' },
  { day: 3, title: "Introduction to the Ministry's Weekly Services", description: 'Learn about Wednesday Midweek Service and Sunday Worship Service.' },
  { day: 5, title: 'Share a Selected Sermon or Devotional', description: 'Receive spiritual nourishment curated for your journey.' },
  { day: 7, title: 'Personal Follow-Up by an Assigned Representative', description: 'Connect personally with a caring ministry team member (with your consent).' },
  { day: 14, title: 'Invitation to an Appropriate Ministry Programme', description: 'Explore cell groups, prayer fellowships, and upcoming programmes.' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  SENIOR_PASTOR: 'Senior Pastor',
  PASTOR: 'Pastor',
  PRAYER_COORDINATOR: 'Prayer Coordinator',
  FOLLOW_UP_TEAM: 'Follow-Up Team',
  MEDIA_ADMINISTRATOR: 'Media Administrator',
  EVENT_ADMINISTRATOR: 'Event Administrator',
  MEMBER: 'Member',
  GUEST: 'Guest',
};

export const STAFF_ROLES: Exclude<UserRole, 'GUEST' | 'MEMBER'>[] = [
  'SUPER_ADMIN',
  'SENIOR_PASTOR',
  'PASTOR',
  'PRAYER_COORDINATOR',
  'FOLLOW_UP_TEAM',
  'MEDIA_ADMINISTRATOR',
  'EVENT_ADMINISTRATOR',
];
