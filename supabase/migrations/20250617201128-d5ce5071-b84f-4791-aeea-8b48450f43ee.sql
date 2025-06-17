
-- Add firebase_uid column to profiles table to support Firebase authentication
ALTER TABLE public.profiles 
ADD COLUMN firebase_uid TEXT UNIQUE;

-- Create an index for better performance when looking up users by Firebase UID
CREATE INDEX idx_profiles_firebase_uid ON public.profiles(firebase_uid);

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.firebase_uid IS 'Firebase Authentication UID for users who authenticate via Firebase';
