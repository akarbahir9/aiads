export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  colors: string[];
  font_style: string | null;
  personality_keywords: string[];
  target_audience_notes: string | null;
  created_at: string;
  user_id: string;
}

export interface ReferenceFolder {
    id: string;
    name: string;
    user_id: string;
    auto_keywords: string[] | null;
    manual_keywords: string[] | null;
    created_at: string;
}

export interface ReferenceImage {
    id: string;
    folder_id: string;
    image_url: string;
    user_id: string;
    created_at: string;
}

export interface GeneratedAd {
  id: string;
  brand_id: string;
  user_id: string;
  goal: string;
  ratio: string;
  concept: string;
  message: string;
  include_logo: boolean;
  used_reference_folder_id: string;
  visual_style_prompt: string;
  image_url: string;
  caption: string;
  created_at: string;
  version: number;
}
