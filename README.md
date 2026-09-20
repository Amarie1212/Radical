# 🏆 Memorial Plaque - Game Progress & Master Tracker

A high-performance desktop application for tracking video game conquests and commemorating cleared titles with a **1:1 Copper-Teal Memorial Plaque** aesthetic.

Powered by **Tauri v2 (Rust)**, **React 18 (TypeScript)**, **Tailwind CSS**, and **Supabase Cloud (Zero Local Database)**.

---

## 🌟 Key Features

1. **Tactical Auth Gate (Login / Register)**:
   - High-tech operative login & registration interface.
   - Powered by Supabase Authentication (`supabase.auth`).
   - Interactive Preview Demo Mode to test features instantly.
2. **1:1 Memorial Plaque Centerpiece**:
   - Engraved copper-bronze outer bevel with metallic patina corner rivets.
   - Inset dark teal patina inner plate with dual glowing orange laser beam cuts.
   - Header with game poster art, crown crest, and glowing `CLEARED` neon badge.
   - **YOUR JOURNEY DATA**: Started date, finished date, and computed campaign duration.
   - **PROOF OF CLEARANCE**: 3 framed screenshot inspection slots (*clear screen*, *credits*, *key achievement unlock*) with full-screen lightbox viewer.
3. **Curved Arc Navigation Rail**:
   - Left navigation icon rail (Grid view, Plaque/Timeline view, Settings, Quick Add).
   - Glassmorphic curved arc panel with active orange glowing thumbnail rings.
4. **Cloud Database & Live Sync (Supabase Online)**:
   - Zero local database installation required.
   - Row-Level Security (RLS) guaranteeing data isolation per user.
   - Supabase Realtime channel subscription for instant live synchronization across desktop instances.
5. **Multi-Tab Dashboard**:
   - **LIBRARY**: Responsive game card grid with search, month filter, and genre dropdowns.
   - **TIMELINE**: Chronological milestone log with interactive memorial plaques.
   - **ACHIEVEMENTS**: Hall of Fame showcase, completion rates, average clear times, and ratings.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase Cloud
Create a free project at [supabase.com](https://supabase.com). Run the SQL script from `supabase_schema.sql` in the **SQL Editor**.

Set your environment variables in `.env` (or configure them directly inside the app UI):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 3. Run in Development Mode
```bash
# Web & Desktop preview
npm run dev
```

### 4. Build Desktop App (.exe)
```bash
# Build desktop executable using Tauri v2
npm run tauri build
```

---

## 🗄️ Supabase SQL Schema

Execute the following in the Supabase SQL Editor:

```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Games table
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

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "User manage own games" ON games FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;
```

---

## 🎨 UI Color Palette

- **Dark Slate / Navy Background**: `#0B0F19`, `#070A12`, `#111726`
- **Neon Orange Accent**: `#F97316`, `#EA580C`, `#FF6B00`
- **Copper & Bronze Metallic**: `#C87D4A`, `#DFA26E`, `#844B24`, `#FFD1A4`
- **Dark Patina Teal Plate**: `#173432`, `#1E4542`, `#0C1D1C`
- **Clearance Neon Green**: `#22C55E`, `#10B981`, `#4ADE80`

