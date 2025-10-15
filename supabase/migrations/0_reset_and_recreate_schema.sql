/*
          # [CRITICAL] Full Database Schema Reset
          [This script will completely reset the project's database by dropping all existing tables and storage buckets, and then recreating them with the final, correct schema. This is intended to fix schema inconsistencies from previous failed migrations.]

          ## Query Description: [This is a destructive operation that will delete all data in the 'brands', 'reference_folders', 'reference_images', and 'generated_ads' tables. It is the recommended solution to resolve persistent migration errors and ensure a stable database foundation. **Backup any critical data before proceeding.**]
          
          ## Metadata:
          - Schema-Category: ["Dangerous", "Structural"]
          - Impact-Level: ["High"]
          - Requires-Backup: [true]
          - Reversible: [false]
          
          ## Structure Details:
          - Drops: `brands`, `reference_folders`, `reference_images`, `generated_ads` tables. `brands-logos`, `reference-images` buckets.
          - Creates: All tables and buckets with correct columns, relationships (including CASCADE deletes), and RLS policies.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [All policies are re-applied to ensure users can only access their own data.]
          
          ## Performance Impact:
          - Indexes: [Primary Keys and Foreign Keys are re-indexed.]
          - Triggers: [None]
          - Estimated Impact: [Low, as it resets the schema on what is likely a small development dataset.]
          */

-- STEP 1: Drop existing objects if they exist to ensure a clean slate.
DROP TABLE IF EXISTS public.generated_ads;
DROP TABLE IF EXISTS public.reference_images;
DROP TABLE IF EXISTS public.reference_folders;
DROP TABLE IF EXISTS public.brands;

-- Drop storage buckets if they exist
SELECT storage.delete_bucket('brands-logos');
SELECT storage.delete_bucket('reference-images');


-- STEP 2: Recreate all tables with the correct schema and relationships.

-- Create the 'brands' table
CREATE TABLE public.brands (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    logo_url text,
    colors text[],
    font_style text,
    personality_keywords text[],
    target_audience_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT brands_pkey PRIMARY KEY (id)
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Create the 'reference_folders' table
CREATE TABLE public.reference_folders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    auto_keywords text[],
    manual_keywords text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT reference_folders_pkey PRIMARY KEY (id)
);
ALTER TABLE public.reference_folders ENABLE ROW LEVEL SECURITY;

-- Create the 'reference_images' table
CREATE TABLE public.reference_images (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id uuid NOT NULL REFERENCES public.reference_folders(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT reference_images_pkey PRIMARY KEY (id)
);
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;

-- Create the 'generated_ads' table
CREATE TABLE public.generated_ads (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    used_reference_folder_id uuid NOT NULL REFERENCES public.reference_folders(id) ON DELETE CASCADE,
    goal text NOT NULL,
    ratio text NOT NULL,
    concept text NOT NULL,
    message text,
    include_logo boolean DEFAULT false,
    visual_style_prompt text,
    image_url text NOT NULL,
    caption text NOT NULL,
    version integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT generated_ads_pkey PRIMARY KEY (id)
);
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;


-- STEP 3: Recreate storage buckets.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brands-logos', 'brands-logos', true, 5242880, '{"image/png", "image/jpeg", "image/svg+xml"}');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reference-images', 'reference-images', true, 10485760, '{"image/png", "image/jpeg"}');


-- STEP 4: Re-apply all RLS policies.

-- Policies for 'brands'
CREATE POLICY "Allow authenticated users to manage their own brands" ON public.brands
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for 'reference_folders'
CREATE POLICY "Allow authenticated users to manage their own folders" ON public.reference_folders
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for 'reference_images'
CREATE POLICY "Allow authenticated users to manage their own images" ON public.reference_images
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for 'generated_ads'
CREATE POLICY "Allow authenticated users to manage their own ads" ON public.generated_ads
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for 'brands-logos' bucket
CREATE POLICY "Allow authenticated users to manage their own logos" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'brands-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'brands-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policies for 'reference-images' bucket
CREATE POLICY "Allow authenticated users to manage their own reference images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'reference-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'reference-images' AND (storage.foldername(name))[1] = auth.uid()::text);
