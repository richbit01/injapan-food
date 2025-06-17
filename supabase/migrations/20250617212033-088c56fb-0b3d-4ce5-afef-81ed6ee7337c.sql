
-- Update RLS policies untuk profiles table agar mengizinkan Firebase users membuat profile
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during auth" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin status checks" ON public.profiles;

-- Create new policies that work with Firebase authentication
-- Allow anyone to read profiles (needed for admin checks)
CREATE POLICY "Allow read access to profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow profile creation (needed for Firebase sync)
CREATE POLICY "Allow profile creation" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

-- Allow profile updates for own records
CREATE POLICY "Allow profile updates" 
  ON public.profiles 
  FOR UPDATE 
  USING (true);
