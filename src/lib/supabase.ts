import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
  created_at: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Comment = {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export type Rating = {
  id: string;
  blog_id: string;
  user_id: string;
  rating: number;
  created_at: string;
};
