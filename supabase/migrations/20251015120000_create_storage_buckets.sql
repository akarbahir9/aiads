/*
          # [Operation Name]
          Create Storage Buckets and Policies

          [Description of what this operation does]
          This script creates the 'brands-logos' and 'reference-images' storage buckets required by the application for file uploads. It also configures the necessary security policies to allow users to manage their own files while making the images publicly viewable.

          ## Query Description: [This operation sets up the file storage system for the application. It creates two main folders (buckets) in Supabase Storage. It is a safe, structural change and does not affect any existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Creates storage bucket: 'brands-logos'
          - Creates storage bucket: 'reference-images'
          - Adds Row Level Security policies to both buckets for secure access.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Users must be authenticated to upload, update, or delete files. Files are publicly readable.]
          
          ## Performance Impact:
          - Indexes: [N/A]
          - Triggers: [N/A]
          - Estimated Impact: [None]
          */

-- Create 'brands-logos' bucket
INSERT into storage.buckets (id, name, public)
values ('brands-logos', 'brands-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'brands-logos' bucket
DROP POLICY IF EXISTS "Public select access" ON storage.objects;
CREATE POLICY "Public select access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'brands-logos' );

DROP POLICY IF EXISTS "Authenticated user can upload" ON storage.objects;
CREATE POLICY "Authenticated user can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'brands-logos' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Authenticated user can update" ON storage.objects;
CREATE POLICY "Authenticated user can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'brands-logos' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Authenticated user can delete" ON storage.objects;
CREATE POLICY "Authenticated user can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'brands-logos' AND auth.uid() = owner );


-- Create 'reference-images' bucket
INSERT into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'reference-images' bucket
DROP POLICY IF EXISTS "Public select access for reference images" ON storage.objects;
CREATE POLICY "Public select access for reference images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'reference-images' );

DROP POLICY IF EXISTS "Authenticated user can upload reference images" ON storage.objects;
CREATE POLICY "Authenticated user can upload reference images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'reference-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Authenticated user can update reference images" ON storage.objects;
CREATE POLICY "Authenticated user can update reference images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'reference-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Authenticated user can delete reference images" ON storage.objects;
CREATE POLICY "Authenticated user can delete reference images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'reference-images' AND auth.uid() = owner );
