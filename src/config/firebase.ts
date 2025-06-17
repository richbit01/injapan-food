
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { firebaseConfig } from './env';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure Google provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add required scopes for Google
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure Facebook provider settings
facebookProvider.setCustomParameters({
  display: 'popup'
});

console.log('Firebase initialized successfully');
console.log('Auth providers configured');

export default app;
