
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/config/firebase';
import { supabase } from '@/integrations/supabase/client';

interface FirebaseAuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync user data to Supabase
        await syncUserToSupabase(firebaseUser);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserToSupabase = async (firebaseUser: User) => {
    try {
      // Check if user already exists in Supabase profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (!existingProfile) {
        // Generate a UUID for the Supabase profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            firebase_uid: firebaseUser.uid,
            full_name: firebaseUser.displayName || '',
            role: 'user'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating Supabase profile:', error);
        } else {
          console.log('Created Supabase profile:', data);
        }
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign up error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      console.log('Google provider config:', googleProvider);
      
      // Clear any existing auth state
      await firebaseSignOut(auth);
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user.email);
      
      return { error: null };
    } catch (error: any) {
      console.error('Google sign in error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData,
        operationType: error.operationType
      });
      
      // Handle specific Google auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        return { error: { message: 'Login dibatalkan oleh pengguna' } };
      } else if (error.code === 'auth/popup-blocked') {
        return { error: { message: 'Popup diblokir oleh browser. Silakan izinkan popup dan coba lagi.' } };
      } else if (error.code === 'auth/unauthorized-domain') {
        return { error: { message: 'Domain tidak diotorisasi untuk Google Auth. Silakan hubungi admin.' } };
      } else if (error.code === 'auth/configuration-not-found') {
        return { error: { message: 'Konfigurasi Google Auth belum selesai. Silakan hubungi admin.' } };
      } else if (error.code === 'auth/invalid-api-key') {
        return { error: { message: 'API key tidak valid. Silakan hubungi admin.' } };
      }
      
      return { error: { message: 'Gagal masuk dengan Google. Silakan coba lagi.' } };
    }
  };

  const signInWithFacebook = async () => {
    try {
      console.log('Attempting Facebook sign in...');
      
      // Clear any existing auth state
      await firebaseSignOut(auth);
      
      const result = await signInWithPopup(auth, facebookProvider);
      console.log('Facebook sign in successful:', result.user.email);
      
      return { error: null };
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      
      // Handle specific Facebook auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        return { error: { message: 'Login dibatalkan oleh pengguna' } };
      } else if (error.code === 'auth/popup-blocked') {
        return { error: { message: 'Popup diblokir oleh browser. Silakan izinkan popup dan coba lagi.' } };
      } else if (error.code === 'auth/unauthorized-domain') {
        return { error: { message: 'Domain tidak diotorisasi untuk Facebook Auth. Silakan hubungi admin.' } };
      } else if (error.code === 'auth/app-not-authorized') {
        return { error: { message: 'Aplikasi belum diotorisasi Facebook. Silakan hubungi admin.' } };
      }
      
      return { error: { message: 'Gagal masuk dengan Facebook. Silakan coba lagi.' } };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <FirebaseAuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      loading
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
