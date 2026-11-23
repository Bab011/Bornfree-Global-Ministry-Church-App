import React, { useEffect, useState } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  subscribeAppSettings,
  subscribePublicNotifications,
} from '@/src/services/firestoreService';
import { AppSettings, NotificationItem, NotificationPreferences } from '@/src/types/ministry';

const DEFAULT_PREFS: NotificationPreferences = {
  upcomingServices: true,
  announcements: true,
  newSermons: true,
  prayerUpdates: true,
  events: true,
  dailyDevotional: true,
};

export const NotificationsPage: React.FC = () => {
  const { user, profile, isSignedIn, updateUserProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    profile?.notificationPrefs || DEFAULT_PREFS
  );
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (profile?.notificationPrefs) {
      setPrefs(profile.notificationPrefs);
    }
  }, [profile?.notificationPrefs]);

  useEffect(() => {
    const unsubs = [
      subscribePublicNotifications(user?.uid ?? null, setNotifications),
      subscribeAppSettings(setSettings),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (isSignedIn) {
      await updateUserProfile({ notificationPrefs: next });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#26364A]">
          Ministry Communications
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#26364A]">
          Notification Centre
        </h1>
        <p className="text-sm text-[#68717D]">
          View official ministry updates, service reminders, and manage your notification preferences.
        </p>
      </header>

      {/* Honest Web Push Architecture Status */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] p-4 flex items-start gap-3 text-xs text-[#68717D]">
        <Info className="w-4 h-4 text-[#26364A] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#26364A]">
            In-App Notifications Active · Web Push Status:{' '}
            {settings?.pushConfigured ? 'Configured' : 'Awaiting FCM / VAPID Setup'}
          </p>
          <p className="mt-1 leading-relaxed">
            {settings?.pushConfigured
              ? 'Browser push notifications are configured for this deployment.'
              : 'All official notifications appear here in-app. Background Web Push notifications require Firebase Cloud Messaging (FCM) VAPID keys and a messaging service worker, documented in the project README.'}
          </p>
        </div>
      </div>

      {/* Feed */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#26364A]">Recent Updates</h2>
        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#E5E7EB] p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#F4F2EC] border border-[#E5E7EB] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6 text-[#26364A]" />
            </div>
            <p className="text-sm font-medium text-[#252B33]">No notifications yet</p>
            <p className="text-xs text-[#68717D]">
              Official ministry notifications for services, sermons, conventions, and prayer updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <article
                key={n.id}
                className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-1.5"
              >
                <p className="text-xs font-semibold text-[#26364A]">{n.category}</p>
                <h3 className="text-base font-semibold text-[#252B33]">{n.title}</h3>
                <p className="text-sm text-[#68717D]">{n.body}</p>
                {n.linkPath && (
                  <Link
                    to={n.linkPath}
                    className="inline-block pt-1 text-xs font-semibold text-[#26364A] hover:text-[#1D2939] hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#26364A]">Notification Preferences</h2>
            <p className="text-xs text-[#68717D]">
              {isSignedIn
                ? 'Choose which ministry updates you wish to receive.'
                : 'Sign in to save your personal notification preferences across devices.'}
            </p>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {(
            [
              ['upcomingServices', 'Upcoming Wednesday & Sunday Services'],
              ['dailyDevotional', 'Daily Devotionals & Scripture'],
              ['newSermons', 'New Sermons & Media Teachings'],
              ['announcements', 'Ministry Announcements'],
              ['events', 'Conventions, Crusades & Event Reminders'],
              ['prayerUpdates', 'Prayer Request Status Updates'],
            ] as Array<[keyof NotificationPreferences, string]>
          ).map(([key, label]) => (
            <label
              key={key}
              className="py-3 flex items-center justify-between gap-4 cursor-pointer min-h-[44px]"
            >
              <span className="text-sm text-[#252B33]">{label}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                disabled={!isSignedIn}
                onChange={() => handleTogglePref(key)}
                className="w-4 h-4 accent-[#26364A]"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};
