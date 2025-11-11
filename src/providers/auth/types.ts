import type { IAccount } from '@/domain/Account';
import type { User, UserCredential } from 'firebase/auth';

export type profileFields = 'role' | 'location' | 'currency';

export type UserRole = 'user' | 'admin' | undefined;

export interface AuthUser extends User {
  role: UserRole;
  businessId?: string;
  customerId?: string;
}

export interface AuthContextType {
  signup: (email: string, password: string, name?: string) => Promise<UserCredential | undefined>;
  signin: (email: string, password: string) => Promise<UserCredential | undefined>;
  signInWithGoogle: () => Promise<UserCredential | undefined>;
  signout: () => Promise<void>;
  setProfileData: ({
    key,
    value,
    uid,
  }: {
    key: profileFields;
    value: string;
    uid?: string;
  }) => Promise<void>;
  getProfileData: (key: profileFields, uid?: string) => Promise<string | null>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updatePhotoUrl: (photoURL: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  reloadAccount: () => Promise<void>;
  error: string | null;
  authStateLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  account: IAccount | null;
  isSigningIn: boolean;
  isSigningInWithGoogle: boolean;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
}
