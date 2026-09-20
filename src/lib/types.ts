export type AppThemeMode = 'light' | 'dark';
export type AppLanguage = 'id' | 'en';

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  theme_preference?: AppThemeMode;
  language?: AppLanguage;
  created_at?: string;
}

export interface Game {
  id: string;
  user_id?: string;
  title: string;
  platform: string;
  genre?: string;
  status: 'Planned' | 'In Progress' | 'Cleared' | 'Dropped';
  started_on: string | null;
  finished_on: string | null;
  duration_days: number | null;
  difficulty?: string;
  rating?: number;
  cover_image_url: string;
  notes?: string;
  proof_clear?: string;
  proof_credits?: string;
  proof_achievement?: string;
  proofs?: string[];
  created_at?: string;
}

export type TabType = 'LIBRARY' | 'TIMELINE' | 'ACHIEVEMENTS';

export interface FilterState {
  searchQuery: string;
  month: string;
  platform: string;
  status: string;
}
