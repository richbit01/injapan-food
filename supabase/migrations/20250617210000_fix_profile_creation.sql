
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RLS policies for profiles table
-- Allow users to read their own profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id OR firebase_uid = (
    SELECT firebase_uid FROM auth.users WHERE id = auth.uid()
  ));

-- Allow profile creation during signup process
CREATE POLICY "Allow profile creation during auth" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id OR firebase_uid = (
    SELECT firebase_uid FROM auth.users WHERE id = auth.uid()
  ));

-- Allow anyone to read admin status for checking permissions
CREATE POLICY "Allow admin status checks" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
