
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
  prompt: 'select_account',
  access_type: 'offline'
});

// Add required scopes for Google
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');

// Configure Facebook provider settings
facebookProvider.setCustomParameters({
  display: 'popup'
});

// Add required scopes for Facebook
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

console.log('Firebase initialized successfully');
console.log('Auth providers configured');

export default app;
