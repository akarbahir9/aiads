/*
          # [Operation Name]
          Finalize Schema for Full Functionality

          ## Query Description: This migration prepares the database for the final set of application features. It adds columns to the `generated_ads` table to support the "Regenerate" feature and implements cascading deletes to ensure data integrity. When a parent record (like a brand or reference folder) is deleted, all its child records (ads, images) will be automatically removed. This is a safe, structural change.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - `generated_ads`: Adds `message` and `include_logo` columns. Modifies foreign key constraints.
          - `reference_images`: Modifies foreign key constraints.
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: No change
          - Triggers: No change
          - Estimated Impact: Low. Adds constraints which can slightly slow down delete operations but significantly improve data consistency.
          */

-- Add columns to generated_ads for the regenerate feature
ALTER TABLE public.generated_ads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.generated_ads ADD COLUMN IF NOT EXISTS include_logo BOOLEAN DEFAULT false;

-- Add cascading delete to generated_ads when a brand is deleted
ALTER TABLE public.generated_ads
DROP CONSTRAINT IF EXISTS generated_ads_brand_id_fkey,
ADD CONSTRAINT generated_ads_brand_id_fkey
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Add cascading delete to generated_ads when a reference folder is deleted
ALTER TABLE public.generated_ads
DROP CONSTRAINT IF EXISTS generated_ads_used_reference_folder_id_fkey,
ADD CONSTRAINT generated_ads_used_reference_folder_id_fkey
FOREIGN KEY (used_reference_folder_id) REFERENCES public.reference_folders(id) ON DELETE SET NULL; -- Set to null so ad history isn't lost if a ref folder is deleted

-- Add cascading delete to reference_images when a reference_folder is deleted
ALTER TABLE public.reference_images
DROP CONSTRAINT IF EXISTS reference_images_folder_id_fkey,
ADD CONSTRAINT reference_images_folder_id_fkey
FOREIGN KEY (folder_id) REFERENCES public.reference_folders(id) ON DELETE CASCADE;
