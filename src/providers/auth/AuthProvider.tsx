import type { IAccount } from '@/domain/Account';
import { useLogging } from '@/hooks';
import { ACCOUNTS_COLLECTION, mapFromFirestore } from '@/hooks/api/account/accountUtils';
import { Preferences } from '@capacitor/preferences';
import * as Sentry from '@sentry/react';
import {
  type AuthError,
  type UserCredential,
  confirmPasswordReset as authConfirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail as updateAuthEmail,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { auth, db } from '../../infrastructure/firebase';
import { AuthContext } from './context';
import type { AuthUser, UserRole, profileFields } from './types';

const dbCollection = 'userProfileExtensions';

interface AuthState {
  user: AuthUser | null;
  account: IAccount | null;
  error: string | null;
  isLoading: boolean;
  isSigningIn: boolean;
  isProfileUpdating: boolean;
}

const initialState: AuthState = {
  user: null,
  account: null,
  error: null,
  isSigningIn: false,
  isLoading: true,
  isProfileUpdating: false,
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { user, account, error, isLoading: authStateLoading } = state;
  const { logError } = useLogging();

  // Helper function to update state partially
  const updateState = useCallback((newState: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Helper function to load account data
  const loadAccountData = useCallback(async (uid: string): Promise<IAccount | null> => {
    try {
      const accountRef = doc(collection(db, ACCOUNTS_COLLECTION), uid);
      const accountSnapshot = await getDoc(accountRef);

      if (accountSnapshot.exists()) {
        return mapFromFirestore(accountSnapshot.id, accountSnapshot.data());
      }

      return null;
    } catch (error) {
      console.error('Error loading account data:', error);
      return null;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: This will stop the infinite loop
  const getAllProfileData = useCallback(
    async (uid?: string) => {
      if (!uid && !user?.uid) {
        return null;
      }
      try {
        const docId = uid ?? user?.uid;
        if (!docId) throw new Error('User ID not found');
        const userDocRef = doc(db, dbCollection, docId);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return {
            role: (data.role as UserRole) ?? undefined,
            businessId: data.businessId ?? undefined,
            customerId: data.customerId ?? undefined,
          };
        }
        return {
          role: undefined,
          businessId: undefined,
          customerId: undefined,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get profile data';
        console.error('Error getting profile data:', error);
        return null;
      }
    },
    [], // Remove user dependency as it's not needed
  );

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      try {
        const { value } = await Preferences.get({ key: 'authUser' });
        const { value: accountValue } = await Preferences.get({ key: 'authAccount' });

        if (value && isMounted) {
          const parsedUser = JSON.parse(value);
          const parsedAccount = accountValue ? JSON.parse(accountValue) : null;
          updateState({
            user: parsedUser,
            account: parsedAccount,
          });
        }

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!isMounted) return;

          if (!currentUser) {
            updateState({
              user: null,
              account: null,
              isLoading: false,
            });
            return;
          }

          try {
            // Load both profile and account data in parallel
            const [profileData, accountData] = await Promise.all([
              getAllProfileData(currentUser.uid),
              loadAccountData(currentUser.uid),
            ]);

            if (isMounted) {
              const updatedUser = {
                ...currentUser,
                ...profileData,
              } as AuthUser;

              updateState({
                user: updatedUser,
                account: accountData,
                isLoading: false,
              });
            }
          } catch (error) {
            if (isMounted) {
              updateState({
                error: 'Failed to load user profile and account',
                isLoading: false,
              });
            }
          }
        });
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          updateState({ isLoading: false });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [getAllProfileData, loadAccountData, updateState]);

  useEffect(() => {
    const storeUserAndAccount = async () => {
      if (user) {
        await Preferences.set({
          key: 'authUser',
          value: JSON.stringify(user),
        });
      } else {
        await Preferences.remove({ key: 'authUser' });
      }

      if (account) {
        await Preferences.set({
          key: 'authAccount',
          value: JSON.stringify(account),
        });
      } else {
        await Preferences.remove({ key: 'authAccount' });
      }
    };
    storeUserAndAccount();

    // Set Sentry user context
    if (user) {
      Sentry.setUser({
        id: user.uid,
        email: user.email ?? undefined,
        username: user.displayName ?? undefined,
      });
    }
  }, [user, account]);

  const signup = async (
    email: string,
    password: string,
    name?: string,
    location?: string,
    currency?: string,
  ): Promise<UserCredential | undefined> => {
    updateState({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Store location and currency in Firestore profile extension
      if (location) {
        await setProfileData({
          key: 'location',
          value: location,
          uid: userCredential.user.uid,
        });
      }

      if (currency) {
        await setProfileData({
          key: 'currency',
          value: currency,
          uid: userCredential.user.uid,
        });
      }

      return userCredential;
    } catch (err) {
      const authError = err as AuthError;
      updateState({ error: authError.code });
      throw err; // Re-throw so SignupPage can catch and display error
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signin = async (email: string, password: string): Promise<UserCredential | undefined> => {
    updateState({ isSigningIn: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (err) {
      const authError = err as AuthError;
      updateState({ error: authError.message });
    } finally {
      updateState({ isSigningIn: false });
    }
  };

  const signout = async (): Promise<void> => {
    updateState({ isLoading: true, error: null });
    try {
      await signOut(auth);
    } catch (err) {
      const authError = err as AuthError;
      updateState({ error: authError.message });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const setProfileData = async ({
    key,
    value,
    uid,
  }: {
    key: profileFields;
    value: string;
    uid?: string;
  }) => {
    try {
      const userDocRef = doc(db, dbCollection, uid ?? user?.uid ?? '');
      await setDoc(userDocRef, { [key]: value }, { merge: true });
    } catch (error) {
      logError(error);
    }
  };

  const getProfileData = async (key: profileFields, uid?: string) => {
    try {
      const userDocRef = doc(db, dbCollection, uid ?? user?.uid ?? '');

      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        return docSnapshot.data()[key] || null;
      }
    } catch (error) {
      console.error('Error getting profile data:', error);
      return null;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!auth.currentUser) {
      updateState({ error: 'No authenticated user found' });
      return;
    }

    try {
      updateState({ isProfileUpdating: true, error: null });
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      if (!user) return;
      updateState({
        user: { ...user, displayName: auth.currentUser.displayName },
        isProfileUpdating: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update display name';
      updateState({
        error: message,
        isProfileUpdating: false,
      });
    }
  };

  const updatePhotoUrl = async (photoURL: string) => {
    if (!auth.currentUser) {
      updateState({ error: 'No authenticated user found' });
      return;
    }

    try {
      updateState({ isProfileUpdating: true, error: null });
      await updateProfile(auth.currentUser, { photoURL });
      await auth.currentUser.reload();
      if (!user) return;
      updateState({
        user: { ...user, photoURL: auth.currentUser.photoURL },
        isProfileUpdating: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update photo URL';
      updateState({
        error: message,
        isProfileUpdating: false,
      });
    }
  };

  const updateEmail = async (email: string) => {
    if (!auth.currentUser) {
      updateState({ error: 'No authenticated user found' });
      return;
    }

    try {
      updateState({ isProfileUpdating: true, error: null });
      await updateAuthEmail(auth.currentUser, email);
      await auth.currentUser.reload();
      if (!user) return;
      updateState({
        user: { ...user, email: auth.currentUser.email },
        isProfileUpdating: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update email';
      updateState({
        error: message,
        isProfileUpdating: false,
      });
    }
  };

  const sendResetPasswordEmail = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      console.error('Error sending reset password email:', message);
      logError(error);
      throw new Error(message);
    }
  };

  const confirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      await authConfirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm password reset';
      logError(error);

      throw error;
    }
  };

  const reloadAccount = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      const accountData = await loadAccountData(user.uid);
      updateState({
        account: accountData,
      });
    } catch (error) {
      console.error('Error reloading account data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        signout,
        setProfileData,
        getProfileData,
        updateDisplayName,
        updatePhotoUrl,
        updateEmail,
        reloadAccount,
        error,
        authStateLoading,
        isAuthenticated: !!user,
        user,
        account,
        isSigningIn: state.isSigningIn,
        sendResetPasswordEmail,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
