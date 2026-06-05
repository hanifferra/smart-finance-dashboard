/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";

// ==========================================
// 1. INISIALISASI FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ==========================================
// 2. KONFIGURASI GOOGLE PROVIDER & SCOPES
// ==========================================
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file'); // Wajib untuk bikin file baru

let isSigningIn = false;

// ==========================================
// 3. MANAJEMEN GOOGLE ACCESS TOKEN
// ==========================================
export const setAccessToken = (token: string) => {
  sessionStorage.setItem('google_access_token', token);
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem('google_access_token');
};

export const clearAccessToken = () => {
  sessionStorage.removeItem('google_access_token');
};

// ==========================================
// 4. FUNGSI AUTHENTICATION
// ==========================================
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    const token = getAccessToken();
    
    if (user) {
      if (token) {
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (!isSigningIn) {
        clearAccessToken();
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      clearAccessToken();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    // Gunakan fungsi penyimpanan token yang baru
    const token = credential.accessToken;
    setAccessToken(token); 
    
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  clearAccessToken(); // Bersihkan token saat logout
};