/*
# Initial Schema Setup
This script establishes the core database structure for the AgencyBrain application. It creates tables for managing brands, reference folders, and generated ads. Row Level Security (RLS) is enabled and policies are applied to ensure that users can only access their own data.

## Query Description: This is a foundational, non-destructive setup. It creates new tables and enables security policies. There is no risk to existing data as it only adds new structures.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the tables)

## Structure Details:
- Tables created:
  - `brands`: Stores client brand information (Brand Kits).
  - `reference_folders`: Manages visual reference categories.
  - `generated_ads`: Stores all data related to a generated ad creative.
- Columns: Includes IDs, timestamps, user foreign keys, and data fields as specified in the project plan.
- Foreign Keys: Relationships are established between `generated_ads` and `brands`/`reference_folders`.

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Yes, new policies are created.
- Auth Requirements: A valid authenticated user (JWT) is required for all operations (SELECT, INSERT, UPDATE, DELETE). Policies restrict access to rows matching the user's UID.

## Performance Impact:
- Indexes: Primary keys are automatically indexed. Foreign keys are indexed for better join performance.
- Triggers: None in this initial setup.
- Estimated Impact: Low. This is a standard setup for a multi-user application.
*/

-- Create brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    brand_colors JSONB,
    font_style TEXT,
    personality_keywords TEXT[],
    target_audience_notes TEXT
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own brands" ON brands
    FOR ALL USING (auth.uid() = user_id);

-- Create reference_folders table
CREATE TABLE reference_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    auto_keywords TEXT[],
    manual_keywords TEXT[],
    visual_style_description TEXT,
    dominant_colors JSONB,
    lighting_type TEXT,
    composition_summary TEXT,
    average_mood_tone TEXT
);
ALTER TABLE reference_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reference folders" ON reference_folders
    FOR ALL USING (auth.uid() = user_id);

-- Create generated_ads table
CREATE TABLE generated_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    goal TEXT,
    ratio TEXT,
    concept TEXT,
    used_reference_folder_id UUID REFERENCES reference_folders(id) ON DELETE SET NULL,
    visual_style TEXT,
    image_url TEXT,
    caption TEXT,
    version INTEGER DEFAULT 1
);
ALTER TABLE generated_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own generated ads" ON generated_ads
    FOR ALL USING (auth.uid() = user_id);

-- Add indexes for foreign keys
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_reference_folders_user_id ON reference_folders(user_id);
CREATE INDEX idx_generated_ads_user_id ON generated_ads(user_id);
CREATE INDEX idx_generated_ads_brand_id ON generated_ads(brand_id);
CREATE INDEX idx_generated_ads_ref_folder_id ON generated_ads(used_reference_folder_id);
