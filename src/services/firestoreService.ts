import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import {
  Announcement,
  AppSettings,
  Department,
  Devotional,
  EventRegistration,
  MinistryEvent,
  NotificationItem,
  PastoralRequest,
  PrayerAssignment,
  PrayerChallenge,
  PrayerRequest,
  PrayerResponse,
  PrayerStatus,
  PrayerWallEntry,
  RoleAssignment,
  Sermon,
  ServiceConfig,
  Testimony,
  UserProfile,
  UserRole,
  Visitor,
  VisitorFollowUp,
  VisitorStatus,
} from '@/src/types/ministry';

function toMillis(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof ts === 'string') return Date.parse(ts) || 0;
  return 0;
}

function sortByCreatedDesc<T extends { createdAt?: unknown }>(items: T[]): T[] {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

// ---------------------------------------------------------------------------
// Public & Member Read Streams
// ---------------------------------------------------------------------------
export function subscribePublishedSermons(cb: (items: Sermon[]) => void) {
  const q = query(collection(db, 'sermons'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sermon, 'id'>) }));
      cb(rows.sort((a, b) => b.date.localeCompare(a.date)));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'sermons')
  );
}

export function subscribeAllSermons(cb: (items: Sermon[]) => void) {
  return onSnapshot(
    collection(db, 'sermons'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sermon, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'sermons')
  );
}

export function subscribePublishedDevotionals(cb: (items: Devotional[]) => void) {
  const q = query(collection(db, 'devotionals'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Devotional, 'id'>) }));
      cb(rows.sort((a, b) => b.publishDate.localeCompare(a.publishDate)));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'devotionals')
  );
}

export function subscribeAllDevotionals(cb: (items: Devotional[]) => void) {
  return onSnapshot(
    collection(db, 'devotionals'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Devotional, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'devotionals')
  );
}

export function subscribePublishedChallenges(cb: (items: PrayerChallenge[]) => void) {
  const q = query(collection(db, 'prayerChallenges'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerChallenge, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerChallenges')
  );
}

export function subscribeUserChallengeProgress(
  uid: string,
  cb: (progressMap: Record<string, number[]>) => void
) {
  const q = query(collection(db, 'users', uid, 'challengeProgress'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, number[]> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[d.id] = Array.isArray(data.completedDays) ? data.completedDays : [];
      });
      cb(map);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/challengeProgress`)
  );
}

export async function toggleChallengeDay(uid: string, challengeId: string, day: number, currentlyDone: number[]) {
  const next = currentlyDone.includes(day)
    ? currentlyDone.filter((d) => d !== day)
    : [...currentlyDone, day].sort((a, b) => a - b);
  try {
    await setDoc(doc(db, 'users', uid, 'challengeProgress', challengeId), {
      userId: uid,
      challengeId,
      completedDays: next,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}/challengeProgress/${challengeId}`);
  }
}

export function subscribePublishedEvents(cb: (items: MinistryEvent[]) => void) {
  const q = query(collection(db, 'events'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MinistryEvent, 'id'>) }));
      cb(rows.sort((a, b) => a.date.localeCompare(b.date)));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'events')
  );
}

export function subscribeAllEvents(cb: (items: MinistryEvent[]) => void) {
  return onSnapshot(
    collection(db, 'events'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MinistryEvent, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'events')
  );
}

export function subscribePublishedAnnouncements(cb: (items: Announcement[]) => void) {
  const q = query(collection(db, 'announcements'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) }));
      cb(
        sortByCreatedDesc(rows).sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'announcements')
  );
}

export function subscribeAllAnnouncements(cb: (items: Announcement[]) => void) {
  return onSnapshot(
    collection(db, 'announcements'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'announcements')
  );
}

export function subscribeServices(cb: (items: ServiceConfig[]) => void) {
  return onSnapshot(
    collection(db, 'services'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceConfig, 'id'>) }));
      cb(rows);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'services')
  );
}

export function subscribeDepartments(cb: (items: Department[]) => void) {
  return onSnapshot(
    collection(db, 'departments'),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Department, 'id'>) }));
      cb(rows.sort((a, b) => a.name.localeCompare(b.name)));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'departments')
  );
}

export function subscribeAppSettings(cb: (settings: AppSettings | null) => void) {
  return onSnapshot(
    doc(db, 'appSettings', 'public'),
    (snap) => {
      cb(snap.exists() ? (snap.data() as AppSettings) : null);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'appSettings/public')
  );
}

export function subscribePublicNotifications(uid: string | null, cb: (items: NotificationItem[]) => void) {
  const qBroadcast = query(
    collection(db, 'notifications'),
    where('isPublished', '==', true),
    where('targetUid', '==', null)
  );
  let broadcastRows: NotificationItem[] = [];
  let userRows: NotificationItem[] = [];

  const emit = () => {
    const merged = [...broadcastRows, ...userRows];
    const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());
    cb(sortByCreatedDesc(unique));
  };

  const unsubBroadcast = onSnapshot(
    qBroadcast,
    (snap) => {
      broadcastRows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
      emit();
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
  );

  let unsubUser = () => {};
  if (uid) {
    const qUser = query(collection(db, 'notifications'), where('targetUid', '==', uid));
    unsubUser = onSnapshot(
      qUser,
      (snap) => {
        userRows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
        emit();
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );
  }

  return () => {
    unsubBroadcast();
    unsubUser();
  };
}

// ---------------------------------------------------------------------------
// Prayer Centre Operations
// ---------------------------------------------------------------------------
export async function submitPrayerRequest(input: {
  name?: string;
  email?: string;
  phone?: string;
  category: PrayerRequest['category'];
  description: string;
  preferredContact: PrayerRequest['preferredContact'];
  privacy: PrayerRequest['privacy'];
}): Promise<string> {
  const uid = auth.currentUser?.uid ?? null;
  const payload: Record<string, unknown> = {
    category: input.category,
    description: input.description.trim().slice(0, 3000),
    preferredContact: input.preferredContact,
    privacy: input.privacy,
    status: 'Received',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (uid) payload.userId = uid;
  if (input.name?.trim()) payload.name = input.name.trim().slice(0, 100);
  if (input.email?.trim()) payload.email = input.email.trim().slice(0, 200);
  if (input.phone?.trim()) payload.phone = input.phone.trim().slice(0, 40);

  try {
    const ref = await addDoc(collection(db, 'prayerRequests'), payload);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'prayerRequests');
  }
}

export function subscribeMyPrayerRequests(uid: string, cb: (items: PrayerRequest[]) => void) {
  const q = query(collection(db, 'prayerRequests'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerRequest, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerRequests')
  );
}

export function subscribeApprovedPrayerWall(cb: (items: PrayerWallEntry[]) => void) {
  const q = query(collection(db, 'prayerWall'), where('isApproved', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerWallEntry, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerWall')
  );
}

export function subscribeApprovedPrayerResponses(cb: (items: PrayerResponse[]) => void) {
  const q = query(collection(db, 'prayerResponses'), where('isApproved', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerResponse, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerResponses')
  );
}

export async function prayForWallEntry(wallId: string, authorName: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in to record your prayer.');
  const batch = writeBatch(db);
  const wallRef = doc(db, 'prayerWall', wallId);
  const responseRef = doc(collection(db, 'prayerResponses'));
  batch.update(wallRef, {
    prayingCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  batch.set(responseRef, {
    wallId,
    userId: uid,
    authorName: authorName.trim().slice(0, 80) || 'Believer',
    type: 'praying',
    isApproved: true,
    createdAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `prayerWall/${wallId}`);
  }
}

export async function sendEncouragement(wallId: string, authorName: string, message: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in to send encouragement.');
  try {
    await addDoc(collection(db, 'prayerResponses'), {
      wallId,
      userId: uid,
      authorName: authorName.trim().slice(0, 80) || 'Member',
      type: 'encouragement',
      message: message.trim().slice(0, 500),
      isApproved: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'prayerResponses');
  }
}

export function subscribeApprovedTestimonies(cb: (items: Testimony[]) => void) {
  const q = query(
    collection(db, 'testimonies'),
    where('status', '==', 'approved'),
    where('permissionToPublish', '==', true)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimony, 'id'>) }));
      cb(sortByCreatedDesc(rows));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'testimonies')
  );
}

export async function submitTestimony(input: {
  authorName: string;
  isAnonymous: boolean;
  category: string;
  description: string;
  photoUrl?: string;
  permissionToPublish: boolean;
}) {
  const uid = auth.currentUser?.uid ?? null;
  const payload: Record<string, unknown> = {
    authorName: input.isAnonymous ? 'Anonymous' : input.authorName.trim().slice(0, 100) || 'Member',
    isAnonymous: input.isAnonymous,
    category: input.category.trim().slice(0, 80),
    description: input.description.trim().slice(0, 4000),
    permissionToPublish: input.permissionToPublish,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (uid) payload.userId = uid;
  if (input.photoUrl?.trim()) payload.photoUrl = input.photoUrl.trim().slice(0, 500);

  try {
    await addDoc(collection(db, 'testimonies'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'testimonies');
  }
}

// ---------------------------------------------------------------------------
// First-Time Visitor, Event Registration & Contact a Pastor
// ---------------------------------------------------------------------------
export async function submitVisitorRegistration(input: {
  fullName: string;
  email?: string;
  phone?: string;
  country: string;
  city: string;
  discoverySource?: string;
  visitedBefore: boolean;
  wantsContact: boolean;
  consentGiven: boolean;
}) {
  const uid = auth.currentUser?.uid ?? null;
  const payload: Record<string, unknown> = {
    fullName: input.fullName.trim().slice(0, 120),
    country: input.country.trim().slice(0, 100),
    city: input.city.trim().slice(0, 100),
    visitedBefore: input.visitedBefore,
    wantsContact: input.wantsContact,
    consentGiven: input.consentGiven,
    status: 'New Visitor',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (uid) payload.userId = uid;
  if (input.email?.trim()) payload.email = input.email.trim().slice(0, 200);
  if (input.phone?.trim()) payload.phone = input.phone.trim().slice(0, 40);
  if (input.discoverySource?.trim()) payload.discoverySource = input.discoverySource.trim().slice(0, 120);

  try {
    const ref = await addDoc(collection(db, 'visitors'), payload);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'visitors');
  }
}

export async function submitEventRegistration(input: {
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  attendanceMode: 'In Person' | 'Online';
  consentGiven: boolean;
}) {
  const uid = auth.currentUser?.uid ?? null;
  const payload: Record<string, unknown> = {
    eventId: input.eventId,
    fullName: input.fullName.trim().slice(0, 120),
    email: input.email.trim().slice(0, 200),
    attendanceMode: input.attendanceMode,
    consentGiven: input.consentGiven,
    createdAt: serverTimestamp(),
  };
  if (uid) payload.userId = uid;
  if (input.phone?.trim()) payload.phone = input.phone.trim().slice(0, 40);
  if (input.country?.trim()) payload.country = input.country.trim().slice(0, 100);
  if (input.city?.trim()) payload.city = input.city.trim().slice(0, 100);

  try {
    const ref = await addDoc(collection(db, 'eventRegistrations'), payload);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'eventRegistrations');
  }
}

export async function submitPastoralRequest(input: {
  fullName: string;
  email?: string;
  phone?: string;
  requestType: PastoralRequest['requestType'];
  message: string;
  preferredContact: string;
  consentGiven: boolean;
}) {
  const uid = auth.currentUser?.uid ?? null;
  const payload: Record<string, unknown> = {
    fullName: input.fullName.trim().slice(0, 120),
    requestType: input.requestType,
    message: input.message.trim().slice(0, 3000),
    preferredContact: input.preferredContact.slice(0, 40),
    consentGiven: input.consentGiven,
    status: 'Received',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (uid) payload.userId = uid;
  if (input.email?.trim()) payload.email = input.email.trim().slice(0, 200);
  if (input.phone?.trim()) payload.phone = input.phone.trim().slice(0, 40);

  try {
    const ref = await addDoc(collection(db, 'pastoralRequests'), payload);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'pastoralRequests');
  }
}

// ---------------------------------------------------------------------------
// Admin & Pastoral Staff Subscriptions / Mutations
// ---------------------------------------------------------------------------
export function subscribeAllPrayerRequests(cb: (items: PrayerRequest[]) => void) {
  return onSnapshot(
    collection(db, 'prayerRequests'),
    (snap) => {
      cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerRequest, 'id'>) }))));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerRequests')
  );
}

export function subscribeAllPrayerAssignments(cb: (items: PrayerAssignment[]) => void) {
  return onSnapshot(
    collection(db, 'prayerAssignments'),
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerAssignment, 'id'>) })));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerAssignments')
  );
}

export async function savePrayerAssignment(params: {
  requestId: string;
  status: PrayerStatus;
  assignedPastorId?: string;
  assignedPastorName?: string;
  followUpDate?: string;
  pastoralNotes?: string;
  existingAssignmentId?: string;
  existingHistory?: Array<{ status: string; updatedAt: string; by: string }>;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');

  try {
    const reqUpdate: Record<string, unknown> = {
      status: params.status,
      updatedAt: serverTimestamp(),
    };
    if (params.assignedPastorId) reqUpdate.assignedPastorId = params.assignedPastorId.slice(0, 128);
    if (params.assignedPastorName) reqUpdate.assignedPastorName = params.assignedPastorName.slice(0, 100);
    if (params.followUpDate !== undefined) reqUpdate.followUpDate = params.followUpDate.slice(0, 40);

    await updateDoc(doc(db, 'prayerRequests', params.requestId), reqUpdate);

    const nextHistory = [
      ...(params.existingHistory || []),
      {
        status: params.status,
        updatedAt: new Date().toISOString(),
        by: auth.currentUser?.displayName || auth.currentUser?.email || uid,
      },
    ].slice(-50);

    if (params.existingAssignmentId) {
      const assignUpdate: Record<string, unknown> = {
        statusHistory: nextHistory,
        updatedAt: serverTimestamp(),
      };
      if (params.assignedPastorId) assignUpdate.assignedToUid = params.assignedPastorId.slice(0, 128);
      if (params.assignedPastorName) assignUpdate.assignedToName = params.assignedPastorName.slice(0, 100);
      if (params.followUpDate !== undefined) assignUpdate.followUpDate = params.followUpDate.slice(0, 40);
      if (params.pastoralNotes !== undefined) assignUpdate.pastoralNotes = params.pastoralNotes.slice(0, 4000);
      await updateDoc(doc(db, 'prayerAssignments', params.existingAssignmentId), assignUpdate);
    } else {
      await addDoc(collection(db, 'prayerAssignments'), {
        requestId: params.requestId,
        assignedByUid: uid,
        ...(params.assignedPastorId ? { assignedToUid: params.assignedPastorId.slice(0, 128) } : {}),
        ...(params.assignedPastorName ? { assignedToName: params.assignedPastorName.slice(0, 100) } : {}),
        ...(params.followUpDate ? { followUpDate: params.followUpDate.slice(0, 40) } : {}),
        ...(params.pastoralNotes ? { pastoralNotes: params.pastoralNotes.slice(0, 4000) } : {}),
        statusHistory: nextHistory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `prayerRequests/${params.requestId}`);
  }
}

export async function publishToPrayerWall(params: {
  sourceRequestId?: string;
  displayName: string;
  category: string;
  requestSummary: string;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  try {
    await addDoc(collection(db, 'prayerWall'), {
      ...(params.sourceRequestId ? { sourceRequestId: params.sourceRequestId.slice(0, 128) } : {}),
      displayName: params.displayName.trim().slice(0, 80) || 'Member',
      category: params.category.trim().slice(0, 80),
      requestSummary: params.requestSummary.trim().slice(0, 1500),
      prayingCount: 0,
      isApproved: true,
      approvedBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'prayerWall');
  }
}

export function subscribeAllPrayerWall(cb: (items: PrayerWallEntry[]) => void) {
  return onSnapshot(
    collection(db, 'prayerWall'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerWallEntry, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerWall')
  );
}

export function subscribeAllPrayerResponses(cb: (items: PrayerResponse[]) => void) {
  return onSnapshot(
    collection(db, 'prayerResponses'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PrayerResponse, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'prayerResponses')
  );
}

export async function moderatePrayerResponse(responseId: string, isApproved: boolean) {
  try {
    await updateDoc(doc(db, 'prayerResponses', responseId), { isApproved });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `prayerResponses/${responseId}`);
  }
}

export function subscribeAllTestimonies(cb: (items: Testimony[]) => void) {
  return onSnapshot(
    collection(db, 'testimonies'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimony, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'testimonies')
  );
}

export async function reviewTestimony(testimonyId: string, status: 'approved' | 'rejected') {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  try {
    await updateDoc(doc(db, 'testimonies', testimonyId), {
      status,
      reviewedBy: uid,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `testimonies/${testimonyId}`);
  }
}

export function subscribeAllVisitors(cb: (items: Visitor[]) => void) {
  return onSnapshot(
    collection(db, 'visitors'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Visitor, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'visitors')
  );
}

export function subscribeVisitorFollowUps(cb: (items: VisitorFollowUp[]) => void) {
  return onSnapshot(
    collection(db, 'visitorFollowUps'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VisitorFollowUp, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'visitorFollowUps')
  );
}

export async function updateVisitorStatusAndLog(params: {
  visitorId: string;
  status: VisitorStatus;
  assignedToUid?: string;
  assignedToName?: string;
  channel?: string;
  outcome?: string;
  nextFollowUpDate?: string;
  journeyDay?: number;
  internalNotes?: string;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  try {
    const update: Record<string, unknown> = {
      status: params.status,
      updatedAt: serverTimestamp(),
    };
    if (params.assignedToUid) update.assignedToUid = params.assignedToUid.slice(0, 128);
    if (params.assignedToName) update.assignedToName = params.assignedToName.slice(0, 100);
    await updateDoc(doc(db, 'visitors', params.visitorId), update);

    if (params.outcome?.trim()) {
      await addDoc(collection(db, 'visitorFollowUps'), {
        visitorId: params.visitorId,
        staffUid: uid,
        staffName: (auth.currentUser?.displayName || auth.currentUser?.email || 'Team Member').slice(0, 100),
        ...(params.channel ? { channel: params.channel.slice(0, 40) } : {}),
        outcome: params.outcome.trim().slice(0, 500),
        ...(params.nextFollowUpDate ? { nextFollowUpDate: params.nextFollowUpDate.slice(0, 40) } : {}),
        ...(params.journeyDay ? { journeyDay: params.journeyDay } : {}),
        ...(params.internalNotes ? { internalNotes: params.internalNotes.trim().slice(0, 2000) } : {}),
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `visitors/${params.visitorId}`);
  }
}

export function subscribeAllPastoralRequests(cb: (items: PastoralRequest[]) => void) {
  return onSnapshot(
    collection(db, 'pastoralRequests'),
    (snap) => cb(sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PastoralRequest, 'id'>) })))),
    (err) => handleFirestoreError(err, OperationType.LIST, 'pastoralRequests')
  );
}

export async function updatePastoralRequestStatus(params: {
  requestId: string;
  status: PastoralRequest['status'];
  assignedPastorUid?: string;
  assignedPastorName?: string;
}) {
  try {
    const update: Record<string, unknown> = {
      status: params.status,
      updatedAt: serverTimestamp(),
    };
    if (params.assignedPastorUid) update.assignedPastorUid = params.assignedPastorUid.slice(0, 128);
    if (params.assignedPastorName) update.assignedPastorName = params.assignedPastorName.slice(0, 100);
    await updateDoc(doc(db, 'pastoralRequests', params.requestId), update);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `pastoralRequests/${params.requestId}`);
  }
}

// ---------------------------------------------------------------------------
// Content Publishing & Settings Mutations
// ---------------------------------------------------------------------------
export async function saveSermon(input: Omit<Sermon, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>, existingId?: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  const payload: Record<string, unknown> = {
    title: input.title.trim().slice(0, 180),
    contentType: input.contentType,
    minister: input.minister.trim().slice(0, 120),
    date: input.date.trim().slice(0, 40),
    isPublished: input.isPublished,
    updatedAt: serverTimestamp(),
  };
  if (input.description?.trim()) payload.description = input.description.trim().slice(0, 5000);
  if (input.thumbnailUrl?.trim()) payload.thumbnailUrl = input.thumbnailUrl.trim().slice(0, 600);
  if (input.videoUrl?.trim()) payload.videoUrl = input.videoUrl.trim().slice(0, 600);
  if (input.audioUrl?.trim()) payload.audioUrl = input.audioUrl.trim().slice(0, 600);
  if (input.scriptureReferences?.trim()) payload.scriptureReferences = input.scriptureReferences.trim().slice(0, 300);
  if (input.topics && input.topics.length > 0) payload.topics = input.topics.slice(0, 10);

  try {
    if (existingId) {
      await updateDoc(doc(db, 'sermons', existingId), payload);
    } else {
      await addDoc(collection(db, 'sermons'), {
        ...payload,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, 'sermons');
  }
}

export async function deleteSermon(id: string) {
  try {
    await deleteDoc(doc(db, 'sermons', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `sermons/${id}`);
  }
}

export async function saveDevotional(
  input: Omit<Devotional, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  const payload: Record<string, unknown> = {
    title: input.title.trim().slice(0, 160),
    bibleVerse: input.bibleVerse.trim().slice(0, 1500),
    scriptureReference: input.scriptureReference.trim().slice(0, 100),
    reflection: input.reflection.trim().slice(0, 5000),
    prayerPoint: input.prayerPoint.trim().slice(0, 2000),
    publishDate: input.publishDate.trim().slice(0, 40),
    isPublished: input.isPublished,
    updatedAt: serverTimestamp(),
  };
  if (input.readingPlan?.trim()) payload.readingPlan = input.readingPlan.trim().slice(0, 200);

  try {
    if (existingId) {
      await updateDoc(doc(db, 'devotionals', existingId), payload);
    } else {
      await addDoc(collection(db, 'devotionals'), {
        ...payload,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, 'devotionals');
  }
}

export async function savePrayerChallenge(input: {
  title: string;
  description?: string;
  durationDays: number;
  days: PrayerChallenge['days'];
  isPublished: boolean;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  try {
    await addDoc(collection(db, 'prayerChallenges'), {
      title: input.title.trim().slice(0, 160),
      ...(input.description?.trim() ? { description: input.description.trim().slice(0, 2000) } : {}),
      durationDays: input.durationDays,
      days: input.days.slice(0, 40),
      isPublished: input.isPublished,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'prayerChallenges');
  }
}

export async function saveEvent(
  input: Omit<MinistryEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  const payload: Record<string, unknown> = {
    title: input.title.trim().slice(0, 160),
    category: input.category.trim().slice(0, 80),
    description: input.description.trim().slice(0, 5000),
    date: input.date.trim().slice(0, 40),
    startTime: input.startTime.trim().slice(0, 40),
    venue: input.venue.trim().slice(0, 300),
    registrationEnabled: input.registrationEnabled,
    isPublished: input.isPublished,
    updatedAt: serverTimestamp(),
  };
  if (input.theme?.trim()) payload.theme = input.theme.trim().slice(0, 200);
  if (input.bannerUrl?.trim()) payload.bannerUrl = input.bannerUrl.trim().slice(0, 600);
  if (input.endTime?.trim()) payload.endTime = input.endTime.trim().slice(0, 40);
  if (input.guestMinisters?.trim()) payload.guestMinisters = input.guestMinisters.trim().slice(0, 400);
  if (input.contactInfo?.trim()) payload.contactInfo = input.contactInfo.trim().slice(0, 300);

  try {
    if (existingId) {
      await updateDoc(doc(db, 'events', existingId), payload);
    } else {
      await addDoc(collection(db, 'events'), {
        ...payload,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, 'events');
  }
}

export async function deleteEvent(id: string) {
  try {
    await deleteDoc(doc(db, 'events', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
  }
}

export async function fetchEventRegistrations(eventId?: string): Promise<EventRegistration[]> {
  try {
    const q = eventId
      ? query(collection(db, 'eventRegistrations'), where('eventId', '==', eventId))
      : collection(db, 'eventRegistrations');
    const snap = await getDocs(q);
    return sortByCreatedDesc(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRegistration, 'id'>) })));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'eventRegistrations');
  }
}

export async function saveAnnouncement(
  input: Omit<Announcement, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  const payload: Record<string, unknown> = {
    title: input.title.trim().slice(0, 160),
    summary: input.summary.trim().slice(0, 500),
    category: input.category.trim().slice(0, 60),
    isPinned: input.isPinned,
    isPublished: input.isPublished,
    updatedAt: serverTimestamp(),
  };
  if (input.body?.trim()) payload.body = input.body.trim().slice(0, 4000);

  try {
    if (existingId) {
      await updateDoc(doc(db, 'announcements', existingId), payload);
    } else {
      await addDoc(collection(db, 'announcements'), {
        ...payload,
        createdBy: uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, 'announcements');
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
  }
}

export async function publishNotification(input: {
  title: string;
  body: string;
  category: string;
  linkPath?: string;
  targetUid?: string | null;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  try {
    await addDoc(collection(db, 'notifications'), {
      title: input.title.trim().slice(0, 160),
      body: input.body.trim().slice(0, 1000),
      category: input.category.trim().slice(0, 60),
      targetUid: input.targetUid ?? null,
      ...(input.linkPath?.trim() ? { linkPath: input.linkPath.trim().slice(0, 200) } : {}),
      isPublished: true,
      createdBy: uid,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'notifications');
  }
}

export async function saveServiceConfig(config: Omit<ServiceConfig, 'id' | 'updatedAt'>) {
  try {
    await setDoc(doc(db, 'services', config.type), {
      type: config.type,
      title: config.title.trim().slice(0, 120),
      ...(config.theme?.trim() ? { theme: config.theme.trim().slice(0, 120) } : {}),
      ...(config.description?.trim() ? { description: config.description.trim().slice(0, 1000) } : {}),
      ...(config.ministerName?.trim() ? { ministerName: config.ministerName.trim().slice(0, 120) } : {}),
      ...(config.ministerRole?.trim() ? { ministerRole: config.ministerRole.trim().slice(0, 80) } : {}),
      venue: config.venue.trim().slice(0, 300),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `services/${config.type}`);
  }
}

export async function saveAppSettings(settings: Omit<AppSettings, 'updatedAt'>) {
  try {
    await setDoc(doc(db, 'appSettings', 'public'), {
      ...(settings.livestreamUrl?.trim() ? { livestreamUrl: settings.livestreamUrl.trim().slice(0, 500) } : {}),
      isLiveNow: settings.isLiveNow,
      ...(settings.welcomeVideoUrl?.trim() ? { welcomeVideoUrl: settings.welcomeVideoUrl.trim().slice(0, 500) } : {}),
      ...(settings.officialEmail?.trim() ? { officialEmail: settings.officialEmail.trim().slice(0, 200) } : {}),
      ...(settings.officialPhone?.trim() ? { officialPhone: settings.officialPhone.trim().slice(0, 60) } : {}),
      ...(settings.mapEmbedUrl?.trim() ? { mapEmbedUrl: settings.mapEmbedUrl.trim().slice(0, 600) } : {}),
      pushConfigured: settings.pushConfigured,
      ...(settings.newcomerJourney ? { newcomerJourney: settings.newcomerJourney.slice(0, 20) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'appSettings/public');
  }
}

export async function saveDepartment(input: Omit<Department, 'id' | 'updatedAt'>, existingId?: string) {
  try {
    const payload = {
      name: input.name.trim().slice(0, 120),
      description: input.description.trim().slice(0, 1500),
      ...(input.meetingInfo?.trim() ? { meetingInfo: input.meetingInfo.trim().slice(0, 200) } : {}),
      isOpenForVolunteers: input.isOpenForVolunteers,
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await setDoc(doc(db, 'departments', existingId), payload);
    } else {
      await addDoc(collection(db, 'departments'), payload);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'departments');
  }
}

// ---------------------------------------------------------------------------
// Member & Role Management (Super Admin / Senior Pastor)
// ---------------------------------------------------------------------------
export function subscribeAllUsers(cb: (items: UserProfile[]) => void) {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => cb(snap.docs.map((d) => d.data() as UserProfile)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'users')
  );
}

export function subscribeAllRoles(cb: (items: RoleAssignment[]) => void) {
  return onSnapshot(
    collection(db, 'roles'),
    (snap) => cb(snap.docs.map((d) => d.data() as RoleAssignment)),
    (err) => handleFirestoreError(err, OperationType.LIST, 'roles')
  );
}

export async function assignUserRole(params: {
  targetUid: string;
  email?: string;
  displayName?: string;
  role: Exclude<UserRole, 'GUEST'>;
}) {
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Authentication required.');
  try {
    const roleRef = doc(db, 'roles', params.targetUid);
    const existing = await getDoc(roleRef);
    if (existing.exists()) {
      await updateDoc(roleRef, {
        role: params.role,
        assignedBy: adminUid,
        ...(params.email ? { email: params.email.slice(0, 200) } : {}),
        ...(params.displayName ? { displayName: params.displayName.slice(0, 100) } : {}),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(roleRef, {
        uid: params.targetUid,
        role: params.role,
        assignedBy: adminUid,
        ...(params.email ? { email: params.email.slice(0, 200) } : {}),
        ...(params.displayName ? { displayName: params.displayName.slice(0, 100) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `roles/${params.targetUid}`);
  }
}

// ---------------------------------------------------------------------------
// Fictional Sample Content Loader (Admin Demonstration Tool Only)
// ---------------------------------------------------------------------------
export async function seedFictionalSampleContent() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Admin authentication required.');
  const today = new Date().toISOString().slice(0, 10);

  try {
    await addDoc(collection(db, 'devotionals'), {
      title: '[Sample Demonstration] Living in Total Freedom',
      bibleVerse: 'So if the Son sets you free, you will be free indeed.',
      scriptureReference: 'John 8:36',
      reflection:
        'Fictional demonstration devotional showing how daily reflections appear once published by an authorised administrator.',
      prayerPoint:
        'Lord, thank You for the freedom we have in Christ. Strengthen our faith to walk in Your truth today.',
      publishDate: today,
      readingPlan: 'John 8 (Sample)',
      isPublished: true,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'announcements'), {
      title: '[Sample Demonstration] Welcome to the Digital Ministry App',
      summary:
        'This is a clearly labelled fictional sample announcement demonstrating how ministry updates appear.',
      body: 'Administrators can edit or delete this demonstration entry anytime from the Administrative Dashboard.',
      category: 'Ministry Update',
      isPinned: true,
      isPublished: true,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'departments'), {
      name: 'Media & Digital Evangelism (Sample)',
      description: 'Supporting audio, video broadcasts, and online community outreach.',
      meetingInfo: 'Schedules announced by department coordinator',
      isOpenForVolunteers: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'sample-seed');
  }
}
