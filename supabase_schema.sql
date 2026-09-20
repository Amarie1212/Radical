-- =========================================================
-- MEMORIAL PLAQUE GAME PROGRESS TRACKER - SUPABASE SCHEMA
-- Jalankan skrip ini langsung di SQL Editor Supabase Cloud
-- =========================================================

-- 1. Auto-confirm setiap user baru (Bypass rate limit email verifikasi)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  NEW.last_sign_in_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_new_user();

-- 2. Tabel profil user (otomatis sinkron dengan Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Trigger otomatis untuk membuat profile saat user baru mendaftar di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Tabel data game
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    genre TEXT,
    status TEXT DEFAULT 'Cleared',
    started_on DATE,
    finished_on DATE,
    duration_days INT GENERATED ALWAYS AS (
        CASE 
            WHEN finished_on IS NOT NULL AND started_on IS NOT NULL 
            THEN (finished_on - started_on) 
            ELSE NULL 
        END
    ) STORED,
    difficulty TEXT,
    rating NUMERIC(3, 1),
    cover_image_url TEXT,
    notes TEXT,
    proof_clear TEXT,
    proof_credits TEXT,
    proof_achievement TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Keamanan data (Row Level Security - tiap user hanya bisa melihat & mengedit miliknya)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User manage own profile" ON profiles;
CREATE POLICY "User manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "User manage own games" ON games;
CREATE POLICY "User manage own games" ON games FOR ALL USING (auth.uid() = user_id);

-- 6. Aktifkan Supabase Realtime untuk tabel games
ALTER PUBLICATION supabase_realtime ADD TABLE games;
