import React, { useEffect, useState } from 'react';
import { ArrowRight, Bell, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  subscribeAppSettings,
  subscribePublicNotifications,
} from '@/src/services/firestoreService';
import { AppSettings, NotificationItem, NotificationPreferences } from '@/src/types/ministry';
import { HighlighterSwipe } from '@/src/components/EditorialUI';

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
      <header className="bg-white border border-[#151515]/12 p-6 md:p-8 space-y-2 rounded-[2px]">
        <p className="text-xs font-normal text-[#6B6A67]">Ministry Communications</p>
        <HighlighterSwipe
          highlight="Notification"
          rest="Centre"
          as="h1"
          className="text-3xl sm:text-4xl"
        />
        <p className="text-sm text-[#6B6A67]">
          View official ministry updates, service reminders, and manage your notification preferences.
        </p>
      </header>

      {/* Honest Web Push Architecture Status */}
      <div className="bg-white border border-[#151515]/12 p-4 flex items-start gap-3 text-xs text-[#6B6A67] rounded-[2px]">
        <Info className="w-4 h-4 text-[#151515] shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-semibold text-[#151515]">
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
        <h2 className="font-display font-light text-2xl text-[#151515]">Recent Updates</h2>
        {notifications.length === 0 ? (
          <div className="bg-white border border-[#151515]/12 p-8 text-center space-y-2 rounded-[2px]">
            <div className="w-12 h-12 rounded-[2px] bg-[#F0F0EE] border border-[#151515]/12 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[#151515]">No notifications yet</p>
            <p className="text-xs text-[#6B6A67]">
              Official ministry notifications for services, sermons, conventions, and prayer updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#151515]/12 bg-white border border-[#151515]/12 rounded-[2px]">
            {notifications.map((n) => (
              <article key={n.id} className="p-5 space-y-1.5">
                <p className="text-xs font-medium text-[#6B6A67]">{n.category}</p>
                <h3 className="text-base font-medium text-[#151515]">{n.title}</h3>
                <p className="text-sm text-[#6B6A67]">{n.body}</p>
                {n.linkPath && (
                  <Link
                    to={n.linkPath}
                    className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[#151515] hover:underline"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="bg-white border border-[#151515]/12 p-6 space-y-4 rounded-[2px]">
        <div className="flex items-center justify-between border-b border-[#151515]/12 pb-4">
          <div>
            <h2 className="font-display font-light text-2xl text-[#151515]">
              Notification Preferences
            </h2>
            <p className="text-xs text-[#6B6A67]">
              {isSignedIn
                ? 'Choose which ministry updates you wish to receive.'
                : 'Sign in to save your personal notification preferences across devices.'}
            </p>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#151515] bg-[#FCDC00] px-2.5 py-1 rounded-[2px]">
              <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
              Saved
            </span>
          )}
        </div>

        <div className="divide-y divide-[#151515]/12">
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
              <span className="text-sm text-[#151515]">{label}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                disabled={!isSignedIn}
                onChange={() => handleTogglePref(key)}
                className="w-4 h-4 accent-[#151515]"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};
