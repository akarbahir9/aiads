/*
# [Operation] Create `reference_images` Table
This migration creates the `public.reference_images` table to store metadata about individual images uploaded to reference folders.

## Query Description:
This is a structural change that adds a new table to your database. It is a safe operation and will not affect any existing data. It establishes the necessary relationships for storing images linked to folders and users.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The table can be dropped)

## Structure Details:
- **Table Created:** `public.reference_images`
- **Columns:** `id`, `folder_id`, `user_id`, `image_url`, `created_at`
- **Constraints:**
  - `reference_images_pkey`: Primary Key on `id`
  - `reference_images_folder_id_fkey`: Foreign Key to `public.reference_folders(id)` with `ON DELETE CASCADE`.
  - `reference_images_user_id_fkey`: Foreign Key to `auth.users(id)` with `ON DELETE CASCADE`.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- **Policies Created:**
  - `SELECT`: Users can view their own reference images.
  - `INSERT`: Users can insert their own reference images.
  - `UPDATE`: Users can update their own reference images.
  - `DELETE`: Users can delete their own reference images.

## Performance Impact:
- Indexes: A primary key index is automatically created on the `id` column. Indexes are also added for foreign keys.
- Triggers: None.
- Estimated Impact: Low. This is a standard table creation.
*/

-- Create the reference_images table
CREATE TABLE public.reference_images (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    folder_id uuid NOT NULL,
    user_id uuid NOT NULL,
    image_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reference_images_pkey PRIMARY KEY (id),
    CONSTRAINT reference_images_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.reference_folders(id) ON DELETE CASCADE,
    CONSTRAINT reference_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.reference_images IS 'Stores individual images belonging to a reference folder.';
COMMENT ON COLUMN public.reference_images.folder_id IS 'Links to the parent reference folder.';
COMMENT ON COLUMN public.reference_images.user_id IS 'The user who uploaded the image.';
COMMENT ON COLUMN public.reference_images.image_url IS 'Public URL of the image in Supabase Storage.';

-- Enable Row Level Security
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reference images"
ON public.reference_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reference images"
ON public.reference_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reference images"
ON public.reference_images FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reference images"
ON public.reference_images FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for foreign keys to improve query performance
CREATE INDEX ix_reference_images_folder_id ON public.reference_images(folder_id);
CREATE INDEX ix_reference_images_user_id ON public.reference_images(user_id);
