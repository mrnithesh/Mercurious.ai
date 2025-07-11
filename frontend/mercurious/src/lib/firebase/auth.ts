import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { auth } from './config';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// Convert Firebase User to UserData
export const mapFirebaseUser = (user: User | null): UserData | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  };
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    if (typeof window === 'undefined' || !auth) {
      throw new Error('Firebase not available');
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    if (result.user && displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    if (typeof window === 'undefined' || !auth) {
      throw new Error('Firebase not available');
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    if (typeof window === 'undefined' || !auth) {
      throw new Error('Firebase not available');
    }
    
    await signOut(auth);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    if (typeof window === 'undefined' || !auth) {
      throw new Error('Firebase not available');
    }
    
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

// Update user password
export const updateUserPassword = async (newPassword: string) => {
  try {
    if (typeof window === 'undefined' || !auth?.currentUser) {
      throw new Error('No authenticated user');
    }
    await updatePassword(auth.currentUser, newPassword);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

// Get current user's ID token
export const getCurrentUserToken = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined' || !auth?.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: UserData | null) => void) => {
  if (typeof window === 'undefined' || !auth) {
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
};

// Error message mapping for better UX
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}; 