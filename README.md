# Bornfree Global Ministry — Digital Ministry PWA

**Motto:** *"Preaching Christ in Totality"*  
**Mission:** *"Preaching the total gospel of Christ to the total man for the total freedom and making men live for God."*  
**Vision:** *"Reaching the unreached with the total gospel of Christ building the largest Christian community on earth today through media, crusade, outreach, evangelism and publications."*  
**Headquarters Address:** No. 1, Bornfree Avenue, Off Saheed Hasan Street, Greenville Estate, Badore-Ajah, Lagos State, Nigeria.

A mobile-first, lightweight, responsive Progressive Web Application (PWA) built for **Bornfree Global Ministry** using React, Vite, TypeScript, Tailwind CSS, React Router, Firebase Authentication, and Cloud Firestore, configured for Netlify and GitHub deployment.

---

## Core Features

- **Public Spiritual Hub (No Sign-In Required):**
  - Automatic detection of the next upcoming worship service (`WEDNESDAY MIDWEEK SERVICE` at `6:00 PM – 8:00 PM` WAT or `SUNDAY WORSHIP SERVICE` at `8:00 AM – 11:00 AM` WAT), with `.ics` calendar export, directions, and automatic local time conversion for international visitors.
  - Full service breakdown pages (`/services/wednesday` and `/services/sunday`) including `WORD ENCOUNTER` and Sunday School schedules.
  - Sermons & Teachings library, Daily Devotionals, Interactive Prayer Challenges, Announcements, and Ministry Events.
  - First-Time Visitor welcome flow (`/new-here`) with consent-based follow-up submission.
  - Ministries/Departments directory and Pastoral Follow-Up / Counselling request form (`/connect`).
- **Prayer Hub (`/prayer`):**
  - Confidential **Private Prayer Request** submission (isolated from public streams via Firestore security rules).
  - Moderated **Public Prayer Wall** with *"I Prayed"* intercession counter.
  - **My Prayers** tracking view for signed-in members.
  - **Testimony** submission (moderated before publication).
- **Role-Based Administrative Dashboard (`/admin`):**
  - Strict role enforcement backed by `/roles/{uid}` in Cloud Firestore (`SUPER_ADMIN`, `SENIOR_PASTOR`, `PASTOR`, `PRAYER_COORDINATOR`, `FOLLOW_UP_TEAM`, `MEDIA_ADMINISTRATOR`, `EVENT_ADMINISTRATOR`).
  - Manage Prayer Requests & private Pastoral Notes (`/prayerAssignments`), First-Time Visitor Follow-Ups, Events, Sermons, Announcements, Daily Devotionals, Testimonies, Member Roles, Service Schedules/Livestream Embeds, and In-App Broadcast Notifications.
- **PWA & Offline Shell:**
  - Installable on Android, iOS Safari (`Add to Home Screen`), and Desktop via `vite-plugin-pwa`.
  - Workbox caches only static application shell assets and public icons—never private prayer records or pastoral notes.
- **Privacy & NDPA 2023 Alignment:**
  - Dedicated `/privacy` and `/terms` pages, explicit consent checkboxes on forms, and strict data isolation.

---

## Architecture & Project Structure

```text
├── firebase-applet-config.json   # Default Firebase client configuration
├── firebase-blueprint.json       # Firestore entity & collection blueprint
├── firestore.rules               # Hardened role-based Firestore security rules
├── netlify.toml                  # Netlify build & SPA fallback configuration
├── public/                       # Official logo, favicons, and PWA icons
└── src/
    ├── components/
    │   ├── admin/                # Modular Care & Content management admin tabs
    │   ├── AppShell.tsx          # Responsive top header & mobile 5-tab bottom bar
    │   ├── AuthModal.tsx         # Google & Email/Password sign-in modal
    │   ├── ErrorBoundary.tsx     # Application error boundary
    │   └── PWAInstallButton.tsx  # Cross-platform install trigger & iOS guidance
    ├── constants/ministry.ts     # Official ministry identity & service schedules
    ├── contexts/AuthContext.tsx  # Auth state, RBAC helpers & profile sync
    ├── hooks/                    # Online status & PWA install prompt hooks
    ├── lib/firebase.ts           # Firebase SDK initialization & error helpers
    ├── pages/                    # Public, member, legal & admin routes
    ├── services/firestoreService.ts # Typed Firestore queries & mutations
    ├── types/ministry.ts         # TypeScript domain interfaces
    └── utils/                    # Lagos timezone scheduler, ICS export, media helpers
```

---

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Commands

```bash
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
npm run lint     # TypeScript type-check (tsc --noEmit)
npm run build    # Production bundle + PWA service worker generation into dist/
```

---

## Firebase Setup & Configuration

1. **Authentication Providers (Firebase Console → Authentication → Sign-in method):**
   - **Google Sign-In:** Enabled by default. Add your custom/Netlify domain under **Authentication → Settings → Authorized domains**.
   - **Email/Password:** Enable the **Email/Password** provider in Firebase Console so members can register and sign in with email and password.
2. **Firestore Security Rules:**
   - Rules live in `/firestore.rules`. Whenever updated, deploy them with Firebase CLI (`firebase deploy --only firestore:rules`) or your project deployment workflow.
   - Validate rules security lint checks using:
     ```bash
     npx eslint firestore.rules
     ```
3. **First Super Admin Setup:**
   - When the designated bootstrap administrator signs in with a verified email, `/contexts/AuthContext.tsx` bootstraps their `SUPER_ADMIN` role document in `/roles/{uid}` (permitted once by `firestore.rules`).
   - Subsequent staff roles (`SENIOR_PASTOR`, `PASTOR`, `PRAYER_COORDINATOR`, `FOLLOW_UP_TEAM`, `MEDIA_ADMINISTRATOR`, `EVENT_ADMINISTRATOR`) can be assigned directly from `/admin` → **Member Management** by a Super Admin or Senior Pastor.
4. **Optional Web Push (FCM):**
   - In-app notifications work out of the box via Cloud Firestore (`/notifications`).
   - To enable OS-level background Web Push notifications in the future, configure a Firebase Cloud Messaging Web Push certificate (VAPID key pair) in Firebase Console → Project Settings → Cloud Messaging, add `firebase-messaging-sw.js`, and store device tokens via a secure backend Cloud Function.

---

## GitHub & Netlify Deployment

This repository includes `netlify.toml` preconfigured for Vite SPA routing (`/* -> /index.html` with status `200`).

1. Push your repository to GitHub.
2. In **Netlify**, choose **Add new site → Import an existing project** and connect your GitHub repository.
3. Verify build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. *(Optional)* Configure `VITE_FIREBASE_*` environment variables in Netlify Site Settings (see `.env.example`) if deploying against a separate Firebase project.
5. After Netlify assigns your `.netlify.app` or custom domain, add that domain to **Firebase Console → Authentication → Settings → Authorized domains** so Google Sign-In works seamlessly in production.
