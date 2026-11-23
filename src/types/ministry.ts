export type UserRole =
  | 'SUPER_ADMIN'
  | 'SENIOR_PASTOR'
  | 'PASTOR'
  | 'PRAYER_COORDINATOR'
  | 'FOLLOW_UP_TEAM'
  | 'MEDIA_ADMINISTRATOR'
  | 'EVENT_ADMINISTRATOR'
  | 'MEMBER'
  | 'GUEST';

export interface NotificationPreferences {
  upcomingServices: boolean;
  announcements: boolean;
  newSermons: boolean;
  prayerUpdates: boolean;
  events: boolean;
  dailyDevotional: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  consentGiven?: boolean;
  notificationPrefs?: NotificationPreferences;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RoleAssignment {
  uid: string;
  email?: string;
  displayName?: string;
  role: Exclude<UserRole, 'GUEST'>;
  assignedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type PrayerCategory =
  | 'Family and Marriage'
  | 'Health and Healing'
  | 'Career and Employment'
  | 'Financial Needs'
  | 'Spiritual Growth'
  | 'Children and Relationships'
  | 'Thanksgiving'
  | 'Other';

export type PrayerPrivacy = 'private' | 'prayer_team' | 'public_wall';
export type PrayerStatus = 'Received' | 'Assigned' | 'Follow-up' | 'Closed';
export type PreferredContact = 'Email' | 'Phone' | 'WhatsApp' | 'In-App Only' | 'No Contact Needed';

export interface PrayerRequest {
  id: string;
  userId?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  category: PrayerCategory;
  description: string;
  preferredContact: PreferredContact;
  privacy: PrayerPrivacy;
  status: PrayerStatus;
  assignedPastorId?: string;
  assignedPastorName?: string;
  followUpDate?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PrayerAssignment {
  id: string;
  requestId: string;
  assignedToUid?: string;
  assignedToName?: string;
  assignedByUid: string;
  pastoralNotes?: string;
  followUpDate?: string;
  statusHistory?: Array<{ status: string; updatedAt: string; by: string }>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PrayerWallEntry {
  id: string;
  sourceRequestId?: string;
  displayName: string;
  category: string;
  requestSummary: string;
  prayingCount: number;
  isApproved: boolean;
  approvedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PrayerResponse {
  id: string;
  wallId: string;
  userId: string;
  authorName: string;
  type: 'praying' | 'encouragement';
  message?: string;
  isApproved: boolean;
  createdAt?: unknown;
}

export interface Testimony {
  id: string;
  userId?: string | null;
  authorName: string;
  isAnonymous: boolean;
  category: string;
  description: string;
  photoUrl?: string;
  permissionToPublish: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type VisitorStatus =
  | 'New Visitor'
  | 'Assigned'
  | 'Contacted'
  | 'Engaging'
  | 'Connected'
  | 'Completed';

export interface Visitor {
  id: string;
  userId?: string | null;
  fullName: string;
  email?: string;
  phone?: string;
  country: string;
  city: string;
  discoverySource?: string;
  visitedBefore: boolean;
  wantsContact: boolean;
  consentGiven: boolean;
  status: VisitorStatus;
  assignedToUid?: string;
  assignedToName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VisitorFollowUp {
  id: string;
  visitorId: string;
  staffUid: string;
  staffName: string;
  channel?: string;
  outcome: string;
  nextFollowUpDate?: string;
  journeyDay?: number;
  internalNotes?: string;
  createdAt?: unknown;
}

export interface ServiceConfig {
  id: string;
  type: 'wednesday' | 'sunday';
  title: string;
  theme?: string;
  description?: string;
  ministerName?: string;
  ministerRole?: string;
  venue: string;
  updatedAt?: unknown;
}

export interface MinistryEvent {
  id: string;
  title: string;
  category: string;
  theme?: string;
  description: string;
  bannerUrl?: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  guestMinisters?: string;
  registrationEnabled: boolean;
  contactInfo?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId?: string | null;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  attendanceMode: 'In Person' | 'Online';
  consentGiven: boolean;
  createdAt?: unknown;
}

export type SermonContentType =
  | 'sermon'
  | 'video'
  | 'audio'
  | 'bible_study'
  | 'publication'
  | 'teaching';

export interface Sermon {
  id: string;
  title: string;
  contentType: SermonContentType;
  minister: string;
  date: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  scriptureReferences?: string;
  topics?: string[];
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Devotional {
  id: string;
  title: string;
  bibleVerse: string;
  scriptureReference: string;
  reflection: string;
  prayerPoint: string;
  publishDate: string;
  readingPlan?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PrayerChallengeDay {
  day: number;
  title: string;
  scriptureReference: string;
  prayerPoint: string;
}

export interface PrayerChallenge {
  id: string;
  title: string;
  description?: string;
  durationDays: number;
  days: PrayerChallengeDay[];
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  body?: string;
  category: string;
  isPinned: boolean;
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: string;
  targetUid?: string | null;
  linkPath?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: unknown;
}

export type PastoralRequestType =
  | 'General spiritual question'
  | 'Pastoral counselling request'
  | 'Family and marriage counselling request'
  | 'Hospital or home visit request'
  | 'Other pastoral assistance';

export interface PastoralRequest {
  id: string;
  userId?: string | null;
  fullName: string;
  email?: string;
  phone?: string;
  requestType: PastoralRequestType;
  message: string;
  preferredContact: string;
  consentGiven: boolean;
  status: 'Received' | 'Assigned' | 'In Progress' | 'Closed';
  assignedPastorUid?: string;
  assignedPastorName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  meetingInfo?: string;
  isOpenForVolunteers: boolean;
  updatedAt?: unknown;
}

export interface NewcomerJourneyStep {
  day: number;
  title: string;
  description: string;
}

export interface AppSettings {
  livestreamUrl?: string;
  isLiveNow: boolean;
  welcomeVideoUrl?: string;
  officialEmail?: string;
  officialPhone?: string;
  mapEmbedUrl?: string;
  pushConfigured: boolean;
  newcomerJourney?: NewcomerJourneyStep[];
  updatedAt?: unknown;
}
