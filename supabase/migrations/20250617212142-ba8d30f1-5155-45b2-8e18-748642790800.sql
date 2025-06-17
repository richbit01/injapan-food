
-- Remove foreign key constraint yang menyebabkan error
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Change the id column to be a regular UUID instead of foreign key to auth.users
ALTER TABLE public.profiles 
ALTER COLUMN id DROP DEFAULT,
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add a unique constraint on firebase_uid for better performance and data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_firebase_uid_unique UNIQUE (firebase_uid);
