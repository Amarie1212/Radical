import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AppLanguage, AppThemeMode, Game, Profile } from './types';

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

const FALLBACK_SUPABASE_URL = 'https://hbtqgsnstqrymscqvpeb.supabase.co';
const FALLBACK_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidHFnc25zdHFyeW1zY3F2cGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODk1NzksImV4cCI6MjEwNDQ2NTU3OX0.QtC09tGXZU-tskNS9hpYtPk92bfM9g13xO23H8xM-sE';

// Helper to get active configuration
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  const localUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
  const localAnon = (localStorage.getItem(STORAGE_KEY_ANON) || '').trim();

  const rawUrl = envUrl || localUrl || FALLBACK_SUPABASE_URL;
  const rawAnon = envAnon || localAnon || FALLBACK_SUPABASE_ANON;

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

try {
  // Purge legacy shared offline games cache so previous users' games never leak
  localStorage.removeItem(STORAGE_KEY_GAMES);
} catch {
  // ignore
}

// ----------------------------------------------------------------------
// INDEXEDDB FULL-PHOTO LOCAL CACHE (Bypasses 5MB LocalStorage limit)
// ----------------------------------------------------------------------
const IDB_NAME = 'radical_dreamer_archive';
const IDB_STORE = 'user_game_vault';

function openIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getIdbCachedGames(userId?: string): Promise<Game[]> {
  if (!userId) return [];
  const db = await openIndexedDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(userId);
      req.onsuccess = () => {
        resolve(Array.isArray(req.result) ? req.result : []);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function setIdbCachedGames(userId: string, games: Game[]): Promise<void> {
  if (!userId || !Array.isArray(games)) return;
  const db = await openIndexedDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(games, userId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function getUserStorageKey(userId?: string): string | null {
  return userId ? `${STORAGE_KEY_GAMES}_${userId}` : null;
}

export function getLocalCachedGames(userId?: string): Game[] {
  if (!userId) return [];
  const key = getUserStorageKey(userId);
  if (!key) return [];
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  return [];
}

export function saveLocalCachedGames(games: Game[], userId?: string) {
  if (!Array.isArray(games) || !userId) return;

  // 1. Always store full games (including all base64 cover images and proofs) into IndexedDB
  setIdbCachedGames(userId, games).catch(() => {});

  // 2. Also save to LocalStorage (with graceful fallback if quota is exceeded)
  const key = getUserStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(games));
  } catch (_quotaErr) {
    try {
      // If quota exceeded, strip only proofs but try to keep cover images
      const slimGames = games.map((game) => {
        const copy = { ...game };
        if (copy.proof_clear && copy.proof_clear.startsWith('data:') && copy.proof_clear.length > 512) {
          copy.proof_clear = '';
        }
        if (copy.proof_credits && copy.proof_credits.startsWith('data:') && copy.proof_credits.length > 512) {
          copy.proof_credits = '';
        }
        if (copy.proof_achievement && copy.proof_achievement.startsWith('data:') && copy.proof_achievement.length > 512) {
          copy.proof_achievement = '';
        }
        return copy;
      });
      localStorage.setItem(key, JSON.stringify(slimGames));
    } catch (_secondErr) {
      // LocalStorage full; IndexedDB retains complete full data safely
    }
  }
}

function sanitizeGameForStorage<T extends Partial<Game>>(game: T): T {
  const cloned = { ...game } as Record<string, unknown>;
  delete cloned.proofs;
  delete cloned.duration_days;
  if (typeof cloned.id === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cloned.id)) {
    delete cloned.id;
  }
  return cloned as T;
}

export async function fetchGames(userId?: string): Promise<Game[]> {
  if (!userId) {
    return [];
  }

  const supabase = getSupabase();
  if (!supabase) {
    const idbGames = await getIdbCachedGames(userId);
    if (idbGames.length > 0) return idbGames;
    return getLocalCachedGames(userId);
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
    const idbGames = await getIdbCachedGames(userId);
    if (idbGames.length > 0) return idbGames;
    return getLocalCachedGames(userId);
  }

  const { data, error } = result;

  if (error) {
    console.error('Failed to fetch games from Supabase:', error);
    const idbGames = await getIdbCachedGames(userId);
    if (idbGames.length > 0) return idbGames;
    return getLocalCachedGames(userId);
  }

  // If user already has games in database, cache safely and return them
  if (data && data.length > 0) {
    console.log(`[Supabase Cloud] Successfully fetched ${data.length} games for user ${userId || 'all'}.`);
    const gamesList = (data as Game[]).map((game) => {
      const { proofs: _proofs, ...rest } = game;
      return rest as Game;
    });
    try {
      saveLocalCachedGames(gamesList, userId);
    } catch (cacheErr) {
      console.warn('Could not cache games locally, continuing with fetched games:', cacheErr);
    }
    return gamesList;
  }

  // If user has 0 games in database, clear user cache and return empty list
  saveLocalCachedGames([], userId);
  return [];
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
      console.warn('Supabase unavailable or error, saving game locally:', error);
    }
  }

  const newGame: Game = {
    ...game,
    id: 'game-' + Date.now(),
    duration_days,
    created_at: new Date().toISOString(),
  };
  const current = getLocalCachedGames(userId);
  const updated = [newGame, ...current];
  saveLocalCachedGames(updated, userId);
  return newGame;
}

export async function updateGame(id: string, updates: Partial<Game>, userId?: string): Promise<Game> {
  const supabase = getSupabase();

  if (supabase && userId) {
    const cleanUpdates = sanitizeGameForStorage(updates);

    try {
      const { data, error } = await supabase
        .from('games')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data as Game;
    } catch (error) {
      console.warn('Supabase update failed, updating locally:', error);
    }
  }

  const current = getLocalCachedGames(userId);
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
  saveLocalCachedGames(updatedList, userId);
  if (!updatedGame) throw new Error('Game not found');
  return updatedGame;
}

export async function deleteGame(id: string, userId?: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && userId) {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) console.warn('Supabase delete error:', error);
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }
  const current = getLocalCachedGames(userId);
  const filtered = current.filter(g => g.id !== id);
  saveLocalCachedGames(filtered, userId);
}


export async function markAsCleared(id: string, finishedDateOrUserId?: string, maybeUserId?: string): Promise<Game> {
  let finishedDateStr: string;
  let userId: string | undefined;

  if (maybeUserId) {
    finishedDateStr = finishedDateOrUserId || new Date().toISOString().split('T')[0];
    userId = maybeUserId;
  } else if (finishedDateOrUserId && finishedDateOrUserId.includes('-') && finishedDateOrUserId.length <= 10) {
    finishedDateStr = finishedDateOrUserId;
    userId = undefined;
  } else {
    finishedDateStr = new Date().toISOString().split('T')[0];
    userId = finishedDateOrUserId;
  }

  return updateGame(id, {
    status: 'Cleared',
    finished_on: finishedDateStr,
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
