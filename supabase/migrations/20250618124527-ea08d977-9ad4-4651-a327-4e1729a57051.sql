
-- Fix the RLS policies for product-images storage bucket
-- The current policies are checking profiles table but there might be issues with the user verification

-- First, let's recreate the storage policies with better error handling
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create new policies that are more permissive for admin operations
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE firebase_uid = (
      SELECT raw_user_meta_data ->> 'sub' 
      FROM auth.users 
      WHERE id = auth.uid()
    ) 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE firebase_uid = (
      SELECT raw_user_meta_data ->> 'sub' 
      FROM auth.users 
      WHERE id = auth.uid()
    ) 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE firebase_uid = (
      SELECT raw_user_meta_data ->> 'sub' 
      FROM auth.users 
      WHERE id = auth.uid()
    ) 
    AND role = 'admin'
  )
);
