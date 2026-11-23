import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '@/src/lib/firebase';
import { NotificationPreferences, UserProfile, UserRole } from '@/src/types/ministry';

const BOOTSTRAP_OWNER_EMAIL = 'anthonybabatunde759@gmail.com';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  upcomingServices: true,
  announcements: true,
  newSermons: true,
  prayerUpdates: true,
  events: true,
  dailyDevotional: true,
};

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  isSignedIn: boolean;
  isSuperAdmin: boolean;
  isSeniorPastor: boolean;
  isPastor: boolean;
  isPrayerStaff: boolean;
  isFollowUpStaff: boolean;
  isMediaStaff: boolean;
  isEventStaff: boolean;
  isAnyStaff: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (params: {
    email: string;
    password: string;
    displayName: string;
    country?: string;
    city?: string;
    consentGiven: boolean;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubRole: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) unsubProfile();
      if (unsubRole) unsubRole();

      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setRole('GUEST');
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', firebaseUser.uid);
      const roleRef = doc(db, 'roles', firebaseUser.uid);

      try {
        // Ensure user profile doc exists
        const existingProfile = await getDoc(userRef);
        if (!existingProfile.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member').slice(0, 100),
            email: firebaseUser.email || '',
            consentGiven: true,
            notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Bootstrap first Super Admin if verified owner email signs in without a role doc
        const existingRole = await getDoc(roleRef);
        if (
          !existingRole.exists() &&
          firebaseUser.email === BOOTSTRAP_OWNER_EMAIL &&
          firebaseUser.emailVerified
        ) {
          await setDoc(roleRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: (firebaseUser.displayName || 'Super Admin').slice(0, 100),
            role: 'SUPER_ADMIN',
            assignedBy: 'bootstrap',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Error initializing user session documents:', err);
      }

      unsubProfile = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`)
      );

      unsubRole = onSnapshot(
        roleRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setRole((data.role as UserRole) || 'MEMBER');
          } else if (
            firebaseUser.email === BOOTSTRAP_OWNER_EMAIL &&
            firebaseUser.emailVerified
          ) {
            setRole('SUPER_ADMIN');
          } else {
            setRole('MEMBER');
          }
          setLoading(false);
        },
        (error) => {
          setRole('MEMBER');
          setLoading(false);
          handleFirestoreError(error, OperationType.GET, `roles/${firebaseUser.uid}`);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubRole) unsubRole();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const registerWithEmail = async (params: {
    email: string;
    password: string;
    displayName: string;
    country?: string;
    city?: string;
    consentGiven: boolean;
  }) => {
    const cred = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password);
    await updateProfile(cred.user, { displayName: params.displayName.trim().slice(0, 100) });
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Verification email dispatch is best-effort
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      displayName: params.displayName.trim().slice(0, 100),
      email: params.email.trim().slice(0, 200),
      country: (params.country || '').trim().slice(0, 100),
      city: (params.city || '').trim().slice(0, 100),
      consentGiven: params.consentGiven,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Must be signed in to update profile.');
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(
        userRef,
        {
          ...(updates.displayName !== undefined ? { displayName: updates.displayName.slice(0, 100) } : {}),
          ...(updates.email !== undefined ? { email: updates.email.slice(0, 200) } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone.slice(0, 40) } : {}),
          ...(updates.country !== undefined ? { country: updates.country.slice(0, 100) } : {}),
          ...(updates.city !== undefined ? { city: updates.city.slice(0, 100) } : {}),
          ...(updates.consentGiven !== undefined ? { consentGiven: updates.consentGiven } : {}),
          ...(updates.notificationPrefs !== undefined ? { notificationPrefs: updates.notificationPrefs } : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isSeniorPastor = isSuperAdmin || role === 'SENIOR_PASTOR';
    const isPastor = isSeniorPastor || role === 'PASTOR';
    const isPrayerStaff = isPastor || role === 'PRAYER_COORDINATOR';
    const isFollowUpStaff = isPastor || role === 'FOLLOW_UP_TEAM';
    const isMediaStaff = isSeniorPastor || role === 'MEDIA_ADMINISTRATOR';
    const isEventStaff = isSeniorPastor || role === 'EVENT_ADMINISTRATOR';
    const isAnyStaff =
      isSuperAdmin ||
      isSeniorPastor ||
      isPastor ||
      role === 'PRAYER_COORDINATOR' ||
      role === 'FOLLOW_UP_TEAM' ||
      role === 'MEDIA_ADMINISTRATOR' ||
      role === 'EVENT_ADMINISTRATOR';

    return {
      user,
      profile,
      role,
      loading,
      isSignedIn: !!user,
      isSuperAdmin,
      isSeniorPastor,
      isPastor,
      isPrayerStaff,
      isFollowUpStaff,
      isMediaStaff,
      isEventStaff,
      isAnyStaff,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      signOut,
      updateUserProfile,
    };
  }, [user, profile, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
