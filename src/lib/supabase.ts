import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AppLanguage, AppThemeMode, Game, Profile } from './types';
import { DEFAULT_GAMES } from '../assets/default_games';

const STORAGE_KEY_URL = 'achievement_supabase_url';
const STORAGE_KEY_ANON = 'achievement_supabase_anon_key';
const STORAGE_KEY_GAMES = 'achievement_offline_games';
const STORAGE_KEY_THEME = 'achievement_theme_preference';
const STORAGE_KEY_LANGUAGE = 'achievement_language_preference';

// Clean and normalize URLs (strips spaces and trailing slashes)
export function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

// Helper to get active configuration
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';

  const rawUrl = localUrl || envUrl;
  const rawAnon = localAnon || envAnon;

  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = rawAnon.trim();

  // Valid if starts with http and is not placeholder
  const isConfigured = Boolean(
    url &&
    anonKey &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('your-project-id') &&
    anonKey.length > 10
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function saveSupabaseConfig(rawUrl: string, rawAnonKey: string) {
  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = rawAnonKey.trim();
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_ANON, anonKey);
  supabaseInstance = null; // reset client instance
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  supabaseInstance = null;
}

// ----------------------------------------------------------------------
// AUTH OPERATIONS
// ----------------------------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.warn('Error fetching current user:', e);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('Profile fetch error, using fallback:', error);
      return null;
    }
    return data as Profile;
  } catch (err) {
    console.warn('Error loading profile:', err);
    return null;
  }
}

export async function signIn(email: string, pass: string) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase Cloud is not configured yet. Please enter your Project URL and Publishable Key.');
  }

  const cleanEmail = email.trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: pass,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. If you just registered, make sure your account is confirmed or register first.');
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('Email not confirmed. Check your email inbox or disable "Confirm email" in Supabase Auth settings.');
    }
    throw error;
  }
  return data;
}

export async function signUp(email: string, pass: string, username: string) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase Cloud is not configured yet. Please enter your Project URL and Publishable Key.');
  }

  const cleanEmail = email.trim();
  const cleanUsername = username.trim() || cleanEmail.split('@')[0];

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: pass,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new Error('Email already registered. Please switch to the SIGN IN tab.');
    }
    if (error.message.includes('Password should be')) {
      throw new Error('Password too short (minimum 6 characters).');
    }
    throw error;
  }
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export function getStoredUserPreferences(): { theme: AppThemeMode; language: AppLanguage } {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as AppThemeMode | null;
  const savedLanguage = localStorage.getItem(STORAGE_KEY_LANGUAGE) as AppLanguage | null;

  return {
    theme: savedTheme === 'dark' ? 'dark' : 'light',
    language: savedLanguage === 'en' ? 'en' : 'id',
  };
}

export async function getUserPreferences(userId?: string): Promise<{ theme: AppThemeMode; language: AppLanguage }> {
  const fallback = getStoredUserPreferences();
  if (!userId) return fallback;

  const supabase = getSupabase();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('theme_preference, language')
      .eq('id', userId)
      .single();

    if (error || !data) return fallback;

    const theme = data.theme_preference === 'dark' ? 'dark' : 'light';
    const language = data.language === 'en' ? 'en' : 'id';

    localStorage.setItem(STORAGE_KEY_THEME, theme);
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
    return { theme, language };
  } catch (err) {
    console.warn('Unable to fetch user preferences:', err);
    return fallback;
  }
}

export async function saveUserPreferences({
  userId,
  theme,
  language,
}: {
  userId?: string;
  theme: AppThemeMode;
  language: AppLanguage;
}) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  const normalizedLanguage = language === 'en' ? 'en' : 'id';

  localStorage.setItem(STORAGE_KEY_THEME, normalizedTheme);
  localStorage.setItem(STORAGE_KEY_LANGUAGE, normalizedLanguage);

  if (!userId) return;

  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        theme_preference: normalizedTheme,
        language: normalizedLanguage,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Could not persist user preferences to Supabase:', err);
  }
}

export async function updateUserPassword(newPassword: string) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase Cloud is not configured yet. Please enter your Project URL and Publishable Key.');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || 'Failed to update password.');
  }
}

// ----------------------------------------------------------------------
// GAME CRUD OPERATIONS (ONLINE WITH OFFLINE DEMO FALLBACK)
// ----------------------------------------------------------------------

export function getLocalCachedGames(): Game[] {
  const cached = localStorage.getItem(STORAGE_KEY_GAMES);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return DEFAULT_GAMES;
}

export function saveLocalCachedGames(games: Game[]) {
  localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
}

function isNetworkFailure(error: unknown) {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network error');
}

function sanitizeGameForStorage<T extends Partial<Game>>(game: T): T {
  const cloned = { ...game } as Record<string, unknown>;
  delete cloned.proofs;
  delete cloned.duration_days;
  return cloned as T;
}

export async function fetchGames(userId?: string): Promise<Game[]> {
  const supabase = getSupabase();
  if (!supabase || !userId) {
    return getLocalCachedGames();
  }

  let result: { data: unknown[] | null; error: { message?: string } | null };
  try {
    result = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  } catch (error) {
    console.warn('Supabase unavailable, using local games:', error);
    return getLocalCachedGames();
  }

  const { data, error } = result;

  if (error) {
    console.error('Failed to fetch games from Supabase:', error);
    return getLocalCachedGames();
  }

  if (data && data.length === 0) {
    // Populate initial games for new cloud user
    try {
      const initialGames = DEFAULT_GAMES.map(g => ({
        ...g,
        id: undefined, // let DB generate UUID
        user_id: userId,
      }));
      const { data: inserted } = await supabase
        .from('games')
        .insert(initialGames)
        .select('*');
      if (inserted && inserted.length > 0) {
        return inserted as Game[];
      }
    } catch (seedErr) {
      console.warn('Could not seed initial games:', seedErr);
    }
  }

  const gamesList = ((data as Game[]) || []).map((game) => {
    const { proofs: _proofs, ...rest } = game;
    return rest as Game;
  });
  saveLocalCachedGames(gamesList);
  return gamesList;
}

export async function addGame(game: Omit<Game, 'id' | 'duration_days'>, userId?: string): Promise<Game> {
  const supabase = getSupabase();
  
  let duration_days: number | null = null;
  if (game.started_on && game.finished_on) {
    const start = new Date(game.started_on).getTime();
    const finish = new Date(game.finished_on).getTime();
    duration_days = Math.max(0, Math.round((finish - start) / (1000 * 60 * 60 * 24)));
  }

  if (supabase && userId) {
    const payload = sanitizeGameForStorage({
      ...game,
      user_id: userId,
    });
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      return data as Game;
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      console.warn('Supabase unavailable, saving game locally:', error);
    }
  } else {
    // Use the local path below when cloud mode is not configured.
  }

  const newGame: Game = {
    ...game,
    id: 'game-' + Date.now(),
    duration_days,
    created_at: new Date().toISOString(),
  };
  const current = getLocalCachedGames();
  const updated = [newGame, ...current];
  saveLocalCachedGames(updated);
  return newGame;
}

export async function updateGame(id: string, updates: Partial<Game>, userId?: string): Promise<Game> {
  const supabase = getSupabase();

  if (supabase && userId) {
    const cleanUpdates = sanitizeGameForStorage(updates);

    const { data, error } = await supabase
      .from('games')
      .update(cleanUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Game;
  } else {
    const current = getLocalCachedGames();
    let updatedGame: Game | null = null;
    const updatedList = current.map(g => {
      if (g.id === id) {
        const merged = { ...g, ...updates };
        if (merged.started_on && merged.finished_on) {
          const start = new Date(merged.started_on).getTime();
          const finish = new Date(merged.finished_on).getTime();
          merged.duration_days = Math.max(0, Math.round((finish - start) / (1000 * 60 * 60 * 24)));
        }
        updatedGame = merged;
        return merged;
      }
      return g;
    });
    saveLocalCachedGames(updatedList);
    if (!updatedGame) throw new Error('Game not found');
    return updatedGame;
  }
}

export async function deleteGame(id: string, userId?: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && userId) {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const current = getLocalCachedGames();
    const filtered = current.filter(g => g.id !== id);
    saveLocalCachedGames(filtered);
  }
}

export async function markAsCleared(id: string, finishedDateStr?: string, userId?: string): Promise<Game> {
  const today = finishedDateStr || new Date().toISOString().split('T')[0];
  return updateGame(id, {
    status: 'Cleared',
    finished_on: today,
  }, userId);
}

// ----------------------------------------------------------------------
// REAL-TIME SUBSCRIPTION
// ----------------------------------------------------------------------

export function subscribeToGames(onEvent: () => void) {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:games')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games' },
      () => {
        onEvent();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
