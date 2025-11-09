/*
  # Blog Platform Database Schema

  ## Overview
  Complete database schema for a blog platform with authentication, blog posts, comments, and ratings.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `username` (text, unique, not null)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz, default now())
  
  Stores user profile information linked to Supabase auth.users.

  ### 2. blogs
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `content` (text, not null)
  - `image_url` (text, nullable)
  - `author_id` (uuid, references profiles, not null)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  Stores blog posts with author reference and optional image.

  ### 3. comments
  - `id` (uuid, primary key)
  - `blog_id` (uuid, references blogs, not null)
  - `user_id` (uuid, references profiles, not null)
  - `content` (text, not null)
  - `created_at` (timestamptz, default now())
  
  Stores comments on blog posts.

  ### 4. ratings
  - `id` (uuid, primary key)
  - `blog_id` (uuid, references blogs, not null)
  - `user_id` (uuid, references profiles, not null)
  - `rating` (integer, check 1-5, not null)
  - `created_at` (timestamptz, default now())
  
  Stores ratings (1-5 stars) for blog posts. One rating per user per blog.

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  
  ### Profiles Table Policies
  - Anyone can read profiles
  - Users can insert their own profile on signup
  - Users can update their own profile
  
  ### Blogs Table Policies
  - Anyone can read all blogs
  - Authenticated users can create blogs
  - Authors can update/delete their own blogs
  - Admins can delete any blog
  
  ### Comments Table Policies
  - Anyone can read comments
  - Authenticated users can create comments
  - Comment authors can update/delete their own comments
  - Admins can delete any comment
  
  ### Ratings Table Policies
  - Anyone can read ratings
  - Authenticated users can create/update ratings
  - Users can only rate once per blog (unique constraint)
  
  ## Indexes
  - Indexes on foreign keys for performance
  - Index on blog author_id for filtering
  - Index on comment blog_id for fetching comments per blog
  - Index on rating blog_id for calculating average ratings
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_blog ON comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_blog ON ratings(blog_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Blogs policies
CREATE POLICY "Anyone can read blogs"
  ON blogs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any blog"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Comments policies
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Ratings policies
CREATE POLICY "Anyone can read ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);