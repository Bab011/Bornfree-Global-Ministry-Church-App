import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ROLE_LABELS } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  subscribeAllAnnouncements,
  subscribeAllDevotionals,
  subscribeAllEvents,
  subscribeAllPastoralRequests,
  subscribeAllPrayerAssignments,
  subscribeAllPrayerRequests,
  subscribeAllPrayerResponses,
  subscribeAllRoles,
  subscribeAllSermons,
  subscribeAllTestimonies,
  subscribeAllUsers,
  subscribeAllVisitors,
  subscribeAppSettings,
  subscribeDepartments,
  subscribeServices,
  subscribeVisitorFollowUps,
} from '@/src/services/firestoreService';
import {
  Announcement,
  AppSettings,
  Department,
  Devotional,
  MinistryEvent,
  PastoralRequest,
  PrayerAssignment,
  PrayerRequest,
  PrayerResponse,
  RoleAssignment,
  Sermon,
  ServiceConfig,
  Testimony,
  UserProfile,
  Visitor,
  VisitorFollowUp,
} from '@/src/types/ministry';
import {
  AdminMembersTab,
  AdminPastoralFollowUpTab,
  AdminPrayerTab,
  AdminTestimoniesTab,
  AdminVisitorsTab,
} from '@/src/components/admin/AdminCareTabs';
import {
  AdminAnnouncementsTab,
  AdminDevotionalsTab,
  AdminEventsTab,
  AdminNotificationsTab,
  AdminSermonsTab,
  AdminSettingsTab,
} from '@/src/components/admin/AdminContentTabs';
import { HighlighterSwipe } from '@/src/components/EditorialUI';

type AdminModule =
  | 'overview'
  | 'prayer'
  | 'visitors'
  | 'events'
  | 'sermons'
  | 'announcements'
  | 'devotionals'
  | 'testimonies'
  | 'members'
  | 'pastoral'
  | 'notifications'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const {
    role,
    isSignedIn,
    isAnyStaff,
    isSuperAdmin,
    isSeniorPastor,
    isPastor,
    isPrayerStaff,
    isFollowUpStaff,
    isMediaStaff,
    isEventStaff,
    loading,
  } = useAuth();

  const [module, setModule] = useState<AdminModule>('overview');
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [prayerAssignments, setPrayerAssignments] = useState<PrayerAssignment[]>([]);
  const [prayerResponses, setPrayerResponses] = useState<PrayerResponse[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [followUps, setFollowUps] = useState<VisitorFollowUp[]>([]);
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [pastoralRequests, setPastoralRequests] = useState<PastoralRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!isAnyStaff) return;
    const unsubs: Array<() => void> = [
      subscribeAppSettings(setSettings),
      subscribeServices(setServices),
      subscribeDepartments(setDepartments),
    ];

    if (isPrayerStaff) {
      unsubs.push(
        subscribeAllPrayerRequests(setPrayerRequests),
        subscribeAllPrayerAssignments(setPrayerAssignments),
        subscribeAllPrayerResponses(setPrayerResponses),
        subscribeAllTestimonies(setTestimonies)
      );
    }
    if (isFollowUpStaff) {
      unsubs.push(
        subscribeAllVisitors(setVisitors),
        subscribeVisitorFollowUps(setFollowUps)
      );
    }
    if (isEventStaff) {
      unsubs.push(subscribeAllEvents(setEvents));
    }
    if (isMediaStaff || isPrayerStaff) {
      unsubs.push(subscribeAllDevotionals(setDevotionals));
    }
    if (isMediaStaff) {
      unsubs.push(
        subscribeAllSermons(setSermons),
        subscribeAllAnnouncements(setAnnouncements)
      );
    }
    if (isPastor) {
      unsubs.push(subscribeAllPastoralRequests(setPastoralRequests));
    }
    if (isSeniorPastor || isSuperAdmin) {
      unsubs.push(subscribeAllUsers(setUsers), subscribeAllRoles(setRoles));
    }

    return () => unsubs.forEach((u) => u());
  }, [
    isAnyStaff,
    isPrayerStaff,
    isFollowUpStaff,
    isEventStaff,
    isMediaStaff,
    isPastor,
    isSeniorPastor,
    isSuperAdmin,
  ]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-[#151515]">
        Verifying administrative permissions...
      </div>
    );
  }

  if (!isSignedIn || !isAnyStaff) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-[#151515]/12 overflow-hidden text-center rounded-[2px]">
        <div className="bg-[#151515] p-6 text-white">
          <div className="w-12 h-12 rounded-[2px] bg-[#1F1D1C] border border-white/15 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6 text-[#FCDC00]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-light text-2xl text-white mt-3">
            Restricted Administrative Area
          </h1>
        </div>
        <div className="p-8">
          <p className="text-sm text-[#6B6A67] leading-relaxed">
            This dashboard is reserved for authorised pastors and ministry administrators. Your current role is{' '}
            <strong className="text-[#151515]">{ROLE_LABELS[role]}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const allModules: Array<{ id: AdminModule; label: string; show: boolean }> = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'prayer', label: 'Prayer Requests', show: isPrayerStaff },
    { id: 'visitors', label: 'First-Time Visitors', show: isFollowUpStaff },
    { id: 'events', label: 'Events', show: isEventStaff },
    { id: 'sermons', label: 'Sermons & Media', show: isMediaStaff },
    { id: 'announcements', label: 'Announcements', show: isMediaStaff },
    { id: 'devotionals', label: 'Daily Devotionals', show: isMediaStaff || isPrayerStaff },
    { id: 'testimonies', label: 'Testimonies', show: isPrayerStaff },
    { id: 'pastoral', label: 'Pastoral Follow-Up', show: isPastor },
    { id: 'members', label: 'Member Management', show: isSeniorPastor || isSuperAdmin },
    { id: 'notifications', label: 'Notifications', show: isAnyStaff },
    { id: 'settings', label: 'Settings', show: isSeniorPastor || isMediaStaff },
  ];
  const availableModules = allModules.filter((m) => m.show);

  const newPrayers = prayerRequests.filter((p) => p.status === 'Received').length;
  const unassignedPrayers = prayerRequests.filter((p) => !p.assignedPastorId).length;
  const visitorsAwaiting = visitors.filter((v) => v.status === 'New Visitor' || v.status === 'Assigned').length;

  return (
    <div className="space-y-6">
      <header className="bg-[#151515] text-white p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-[2px]">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[#FCDC00]">{ROLE_LABELS[role]}</p>
          <HighlighterSwipe
            highlight="Ministry"
            rest="Administrative Dashboard"
            as="h1"
            onDark
            className="text-2xl sm:text-3xl"
          />
        </div>
      </header>

      {/* Module Navigation */}
      <nav
        className="flex flex-wrap gap-1.5 bg-white border border-[#151515]/12 p-1.5 rounded-[2px]"
        aria-label="Administrative modules"
      >
        {availableModules.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModule(m.id)}
            className={`btn-press px-3.5 py-2 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap min-h-[40px] ${
              module === m.id
                ? 'bg-[#151515] text-white'
                : 'text-[#6B6A67] hover:bg-[#F0F0EE] hover:text-[#151515]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Module 1: Overview */}
      {module === 'overview' && (
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'New Prayer Requests', value: newPrayers, show: isPrayerStaff },
            { label: 'Unassigned Prayer Requests', value: unassignedPrayers, show: isPrayerStaff },
            { label: 'Visitors Awaiting Follow-Up', value: visitorsAwaiting, show: isFollowUpStaff },
            { label: 'Upcoming Events', value: events.length, show: isEventStaff },
            { label: 'Published Sermons', value: sermons.filter((s) => s.isPublished).length, show: isMediaStaff },
            { label: 'Recent Announcements', value: announcements.length, show: isMediaStaff },
          ]
            .filter((s) => s.show)
            .map((stat, idx) => (
              <div
                key={stat.label}
                className={`p-5 space-y-1.5 border rounded-[2px] ${
                  idx === 0
                    ? 'bg-[#151515] text-white border-[#151515]'
                    : 'bg-white border-[#151515]/12 text-[#151515]'
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    idx === 0 ? 'text-[#FCDC00]' : 'text-[#6B6A67]'
                  }`}
                >
                  {stat.label}
                </p>
                <p
                  className={`text-3xl font-light tabular-nums ${
                    idx === 0 ? 'text-white' : 'text-[#151515]'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
        </section>
      )}

      {module === 'prayer' && isPrayerStaff && (
        <AdminPrayerTab
          requests={prayerRequests}
          assignments={prayerAssignments}
          responses={prayerResponses}
        />
      )}

      {module === 'visitors' && isFollowUpStaff && (
        <AdminVisitorsTab visitors={visitors} followUps={followUps} />
      )}

      {module === 'events' && isEventStaff && <AdminEventsTab events={events} />}

      {module === 'sermons' && isMediaStaff && <AdminSermonsTab sermons={sermons} />}

      {module === 'announcements' && isMediaStaff && (
        <AdminAnnouncementsTab announcements={announcements} />
      )}

      {module === 'devotionals' && (isMediaStaff || isPrayerStaff) && (
        <AdminDevotionalsTab devotionals={devotionals} />
      )}

      {module === 'testimonies' && isPrayerStaff && (
        <AdminTestimoniesTab testimonies={testimonies} />
      )}

      {module === 'pastoral' && isPastor && (
        <AdminPastoralFollowUpTab requests={pastoralRequests} />
      )}

      {module === 'members' && (isSeniorPastor || isSuperAdmin) && (
        <AdminMembersTab users={users} roles={roles} />
      )}

      {module === 'notifications' && <AdminNotificationsTab />}

      {module === 'settings' && (isSeniorPastor || isMediaStaff) && (
        <AdminSettingsTab settings={settings} services={services} departments={departments} />
      )}
    </div>
  );
};
