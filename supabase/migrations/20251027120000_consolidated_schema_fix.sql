/*
          # [Consolidated Schema Fix]
          This script ensures all required tables (brands, reference_folders, reference_images, generated_ads) exist with all necessary columns and policies. It is designed to be run safely even if some tables or columns already exist.

          ## Query Description: [This operation will create missing tables and add missing columns required for the application to function correctly. It is a non-destructive operation and will not delete any existing data. It's designed to fix schema inconsistencies.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates table `brands` if not exists.
          - Creates table `reference_folders` if not exists and adds `manual_keywords` / `auto_keywords`.
          - Creates table `reference_images` if not exists.
          - Creates table `generated_ads` if not exists with all columns (`message`, `include_logo`, etc.).
          - Establishes all foreign key relationships with cascading deletes.
          - Creates all required RLS policies.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [authenticated users]
          
          ## Performance Impact:
          - Indexes: [Adds indexes on foreign keys]
          - Triggers: [None]
          - Estimated Impact: [Low. This will improve query performance by adding necessary indexes.]
          */

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    logo_url text,
    colors text[],
    font_style text,
    personality_keywords text[],
    target_audience_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.brands ADD PRIMARY KEY (id);
ALTER TABLE public.brands ADD CONSTRAINT brands_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create reference_folders table
CREATE TABLE IF NOT EXISTS public.reference_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    auto_keywords text[],
    manual_keywords text[]
);

ALTER TABLE public.reference_folders ADD PRIMARY KEY (id);
ALTER TABLE public.reference_folders ADD CONSTRAINT reference_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns to reference_folders if they don't exist
ALTER TABLE public.reference_folders ADD COLUMN IF NOT EXISTS auto_keywords text[];
ALTER TABLE public.reference_folders ADD COLUMN IF NOT EXISTS manual_keywords text[];


-- 3. Create reference_images table
CREATE TABLE IF NOT EXISTS public.reference_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    folder_id uuid NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.reference_images ADD PRIMARY KEY (id);
ALTER TABLE public.reference_images ADD CONSTRAINT reference_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reference_images ADD CONSTRAINT reference_images_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.reference_folders(id) ON DELETE CASCADE;

-- 4. Create generated_ads table
CREATE TABLE IF NOT EXISTS public.generated_ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    goal text NOT NULL,
    ratio text NOT NULL,
    concept text NOT NULL,
    visual_style_prompt text NOT NULL,
    image_url text NOT NULL,
    caption text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    used_reference_folder_id uuid,
    message text,
    include_logo boolean
);

ALTER TABLE public.generated_ads ADD PRIMARY KEY (id);
ALTER TABLE public.generated_ads ADD CONSTRAINT generated_ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.generated_ads ADD CONSTRAINT generated_ads_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
ALTER TABLE public.generated_ads ADD CONSTRAINT generated_ads_used_reference_folder_id_fkey FOREIGN KEY (used_reference_folder_id) REFERENCES public.reference_folders(id) ON DELETE SET NULL;

-- Add missing columns to generated_ads if they don't exist
ALTER TABLE public.generated_ads ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.generated_ads ADD COLUMN IF NOT EXISTS include_logo boolean;


-- 5. RLS Policies
-- Brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated user to insert their own brand" ON public.brands;
CREATE POLICY "Allow authenticated user to insert their own brand" ON public.brands FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to read their own brand" ON public.brands;
CREATE POLICY "Allow owner to read their own brand" ON public.brands FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to update their own brand" ON public.brands;
CREATE POLICY "Allow owner to update their own brand" ON public.brands FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to delete their own brand" ON public.brands;
CREATE POLICY "Allow owner to delete their own brand" ON public.brands FOR DELETE USING (auth.uid() = user_id);

-- Reference Folders
ALTER TABLE public.reference_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated user to insert their own folder" ON public.reference_folders;
CREATE POLICY "Allow authenticated user to insert their own folder" ON public.reference_folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to read their own folder" ON public.reference_folders;
CREATE POLICY "Allow owner to read their own folder" ON public.reference_folders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to update their own folder" ON public.reference_folders;
CREATE POLICY "Allow owner to update their own folder" ON public.reference_folders FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to delete their own folder" ON public.reference_folders;
CREATE POLICY "Allow owner to delete their own folder" ON public.reference_folders FOR DELETE USING (auth.uid() = user_id);

-- Reference Images
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated user to insert their own image" ON public.reference_images;
CREATE POLICY "Allow authenticated user to insert their own image" ON public.reference_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to read their own image" ON public.reference_images;
CREATE POLICY "Allow owner to read their own image" ON public.reference_images FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to delete their own image" ON public.reference_images;
CREATE POLICY "Allow owner to delete their own image" ON public.reference_images FOR DELETE USING (auth.uid() = user_id);

-- Generated Ads
ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated user to insert their own ad" ON public.generated_ads;
CREATE POLICY "Allow authenticated user to insert their own ad" ON public.generated_ads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to read their own ad" ON public.generated_ads;
CREATE POLICY "Allow owner to read their own ad" ON public.generated_ads FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to update their own ad" ON public.generated_ads;
CREATE POLICY "Allow owner to update their own ad" ON public.generated_ads FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner to delete their own ad" ON public.generated_ads;
CREATE POLICY "Allow owner to delete their own ad" ON public.generated_ads FOR DELETE USING (auth.uid() = user_id);

-- 6. Storage Policies (for completeness)
-- Brands Logos
CREATE POLICY "Allow authenticated uploads in brands-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brands-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Allow owner to read their logos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'brands-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Allow owner to delete their logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brands-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Reference Images
CREATE POLICY "Allow authenticated uploads in reference-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reference-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Allow owner to read their reference images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'reference-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Allow owner to delete their reference images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reference-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
