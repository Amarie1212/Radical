import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLanguage, AppThemeMode, Game, TabType } from './lib/types';
import {
  getSupabaseConfig,
  getCurrentUser,
  getSupabase,
  fetchGames,
  addGame,
  updateGame,
  deleteGame,
  markAsCleared,
  subscribeToGames,
  signOut,
  getStoredUserPreferences,
  getUserPreferences,
  saveUserPreferences,
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { GameGrid } from './components/GameGrid';
import { GameModal } from './components/GameModal';
import { EditGamePanel } from './components/EditGamePanel';
import { ConfigModal } from './components/ConfigModal';
import { AuthGate } from './components/AuthGate';
import { AchievementsView } from './components/AchievementsView';
import { ProofLightbox } from './components/ProofLightbox';
import { MemorialPlaque } from './components/MemorialPlaque';
import { JournalDashboard } from './components/JournalDashboard';
import { CheckCircle2, UserRound } from 'lucide-react';

import { User } from '@supabase/supabase-js';

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [config, setConfig] = useState(getSupabaseConfig());

  // Data State
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isPlaqueOpen, setIsPlaqueOpen] = useState(false);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('TIMELINE');
  const [themeMode, setThemeMode] = useState<AppThemeMode>('dark');
  const [languageMode, setLanguageMode] = useState<AppLanguage>('en');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');

  // Modals & Panels
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const [isPlaqueClosing, setIsPlaqueClosing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lightboxProof, setLightboxProof] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  // Check initial Auth
  useEffect(() => {
    const initAuth = async () => {
      const cfg = getSupabaseConfig();
      setConfig(cfg);

      if (cfg.isConfigured) {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);

          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
          });

          setAuthChecked(true);
          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      }
      setAuthChecked(true);
    };

    initAuth();
  }, []);

  // Reload Games Function
  const loadGames = useCallback(async () => {
    try {
      const data = await fetchGames(user?.id);
      setGames(data);

      if (data.length > 0 && !selectedGameId && !hasInitializedSelection) {
        setSelectedGameId(data[0].id);
        setHasInitializedSelection(true);
      }
    } catch (err) {
      console.error('Error loading games:', err);
    }
  }, [user?.id, selectedGameId, hasInitializedSelection]);

  useEffect(() => {
    const preferences = getStoredUserPreferences();
    setThemeMode(preferences.theme);
    setLanguageMode(preferences.language);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.lang = languageMode;
  }, [themeMode, languageMode]);

  useEffect(() => {
    if (user?.id) {
      getUserPreferences(user.id).then((preferences) => {
        setThemeMode(preferences.theme);
        setLanguageMode(preferences.language);
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveUserPreferences({ userId: user.id, theme: themeMode, language: languageMode });
    }
  }, [user?.id, themeMode, languageMode]);

  // Load games on auth change
  useEffect(() => {
    if (user || !config.isConfigured) {
      loadGames();
    }
  }, [user, config.isConfigured, loadGames]);

  // Real-time live sync subscription
  useEffect(() => {
    if (config.isConfigured && user) {
      const unsubscribe = subscribeToGames(() => {
        loadGames();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [config.isConfigured, user, loadGames]);

  // Available Filter Options
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    games.forEach((g) => {
      if (g.platform) {
        platforms.add(g.platform);
      }
    });
    return Array.from(platforms);
  }, [games]);

  // Filtered Games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesPlatform = g.platform.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPlatform) return false;
      }

      // Status
      if (selectedStatus !== 'ALL') {
        if (g.status !== selectedStatus) return false;
      }

      // Platform
      if (selectedPlatform !== 'ALL') {
        if (g.platform !== selectedPlatform) return false;
      }

      return true;
    });
  }, [games, searchQuery, selectedStatus, selectedPlatform]);

  const selectedGame = useMemo(() => {
    if (!selectedGameId) return null;
    return games.find((g) => g.id === selectedGameId) || null;
  }, [games, selectedGameId]);

  const clearedGamesCount = useMemo(() => games.filter((g) => g.status === 'Cleared').length, [games]);

  const handleSelectGame = (game: Game) => {
    setSelectedGameId(game.id);
  };

  // Handlers
  const handleSaveGame = async (gameData: Omit<Game, 'id' | 'duration_days'>, existingId?: string) => {
    let savedGame: Game;
    if (existingId) {
      savedGame = await updateGame(existingId, gameData, user?.id);
      setGames((currentGames) => currentGames.map((game) => (
        game.id === existingId ? savedGame : game
      )));
    } else {
      savedGame = await addGame(gameData, user?.id);
      setGames((currentGames) => [savedGame, ...currentGames]);
      setSelectedGameId(savedGame.id);
    }
    notify(existingId ? 'Game data updated successfully.' : 'Game added successfully.');
  };

  const handleDeleteGame = async (id: string) => {
    await deleteGame(id, user?.id);
    setGames((currentGames) => currentGames.filter((game) => game.id !== id));
    if (selectedGameId === id) {
      const remainingGames = games.filter((g) => g.id !== id);
      setSelectedGameId(remainingGames.length > 0 ? remainingGames[0].id : null);
    }
    notify('Game deleted successfully.');
  };

  const handleMarkCleared = async (id: string) => {
    await markAsCleared(id, user?.id);
    setGames((currentGames) => currentGames.map((game) => (
      game.id === id ? { ...game, status: 'Cleared' } : game
    )));
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    notify('Signed out successfully.');
  };

  const handleOpenAdd = () => {
    setIsGameModalOpen(true);
  };

  const handleOpenEdit = (game: Game) => {
    setEditingGame(game);
    setIsEditPanelOpen(true);
  };

  const handleViewProof = (imageUrl: string, title?: string) => {
    setLightboxProof({
      isOpen: true,
      url: imageUrl,
      title: title || selectedGame?.title || 'Clearance Proof',
    });
  };

  const handleCloseProfile = () => {
    setIsProfileClosing(true);
    window.setTimeout(() => {
      setIsProfileOpen(false);
      setIsProfileClosing(false);
    }, 190);
  };

  const handleClosePlaque = () => {
    setIsPlaqueClosing(true);
    window.setTimeout(() => {
      setIsPlaqueOpen(false);
      setIsPlaqueClosing(false);
    }, 190);
  };

  // Auth Gate check: If user not authenticated
  if (authChecked && !user) {
    return (
      <AuthGate
        language={languageMode}
        onAuthenticated={(method) => {
          getCurrentUser().then((currentUser) => {
            setUser(currentUser);
            notify(method === 'register' ? 'Registration successful.' : 'Login successful.');
          });
        }}
      />
    );
  }

  return (
    <div className="paper-world flex flex-col min-h-dvh h-dvh w-full overflow-hidden">
      {/* 1. Top Navigation Bar */}
      <Navbar
        language={languageMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onSignOut={handleSignOut}
        onOpenAddModal={handleOpenAdd}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        isConfigured={config.isConfigured}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clearedCount={clearedGamesCount}
        totalCount={games.length}
      />

      {/* 2. Main Content Body */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {/* Dynamic Center Work Area */}
        <main className="paper-stage flex-1 min-h-0 h-full w-full overflow-hidden relative flex flex-col">
          {/* TAB 1: LIBRARY (Grid of all games) */}
          {activeTab === 'LIBRARY' && (
            <div className="w-full p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 sm:space-y-6">
              <GameGrid
                language={languageMode}
                games={filteredGames}
                selectedGameId={selectedGame?.id || null}
                onSelectGame={handleSelectGame}
                onEditGame={handleOpenEdit}
                onDeleteGame={handleDeleteGame}
                onMarkCleared={handleMarkCleared}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
                availablePlatforms={availablePlatforms}
              />
            </div>
          )}

          {/* TAB 2: TIMELINE / JOURNAL DASHBOARD */}
          {activeTab === 'TIMELINE' && (
            <div className="paper-dashboard w-full h-full min-h-0 flex-1 flex flex-col">
              <JournalDashboard
                language={languageMode}
                games={filteredGames}
                selectedGame={selectedGame}
                onSelectGame={handleSelectGame}
                onEditGame={handleOpenEdit}
                onDeleteGame={handleDeleteGame}
                onOpenProof={(url, title) => setLightboxProof({ isOpen: true, url, title })}
              />
            </div>
          )}

          {/* TAB 3: ACHIEVEMENTS */}
          {activeTab === 'ACHIEVEMENTS' && (
            <div className="w-full p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <AchievementsView
                language={languageMode}
                games={games}
                onSelectGame={(g) => {
                  setSelectedGameId(g.id);
                  setIsPlaqueOpen(true);
                  setActiveTab('TIMELINE');
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Global Modals & Panels */}

      {/* Add Game Modal */}
      <GameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSave={handleSaveGame}
        initialGame={null}
      />

      {/* Edit Game Panel */}
      <EditGamePanel
        game={editingGame}
        isOpen={isEditPanelOpen}
        onClose={() => { setIsEditPanelOpen(false); setEditingGame(null); }}
        onSave={handleSaveGame}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        user={user}
        currentTheme={themeMode}
        currentLanguage={languageMode}
        onPreferencesSaved={(nextTheme, nextLanguage) => {
          setThemeMode(nextTheme);
          setLanguageMode(nextLanguage);
        }}
        onSaved={() => {
          setConfig(getSupabaseConfig());
          loadGames();
        }}
      />

      {isProfileOpen && (
        <div
          className={`notebook-entry-overlay fixed inset-0 flex items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto ${isProfileClosing ? 'tv-closing-backdrop' : ''}`}
          onClick={handleCloseProfile}
        >
          <div
            className={`zzz-modal-window w-full max-w-[460px] my-auto ${isProfileClosing ? 'tv-closing' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="zzz-modal-header">
              <div className="zzz-modal-header-copy">
                <h2 className="zzz-modal-title">Operator Profile</h2>
              </div>
              <div className="zzz-modal-graphic">
                <div className="w-full h-full flex items-center justify-center bg-[#181922] text-[#FFDE00]">
                  <UserRound size={28} strokeWidth={2.2} />
                </div>
                <span className="zzz-modal-graphic-badge">OPR</span>
              </div>
              <button className="zzz-modal-close" onClick={handleCloseProfile} aria-label="Close profile">✕</button>
            </div>

            <div className="zzz-modal-body space-y-4">
              <div className="p-4 bg-[#161722] rounded-2xl border border-[#2B2D3C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 tracking-wider">OPERATOR CODENAME</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">● ONLINE</span>
                </div>
                <h3 className="text-2xl font-black italic text-white font-['Outfit'] tracking-tight">
                  {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Commander'}
                </h3>
                <p className="text-xs font-mono text-zinc-400 break-all">
                  {user?.email || 'Local session'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  className="zzz-action-row zzz-action-danger"
                  onClick={handleSignOut}
                >
                  <span className="zzz-action-tag">[ SIGN OUT ]</span>
                  <span className="zzz-action-label">Disconnect Operator Session</span>
                  <span className="zzz-action-arrow">›</span>
                </button>

                <button
                  type="button"
                  className="zzz-action-row"
                  onClick={handleCloseProfile}
                >
                  <span className="zzz-action-tag">[ ABORT ]</span>
                  <span className="zzz-action-label">Return to Terminal</span>
                  <span className="zzz-action-arrow">✕</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProofLightbox
        isOpen={lightboxProof.isOpen}
        imageUrl={lightboxProof.url}
        title={lightboxProof.title}
        onClose={() => setLightboxProof({ isOpen: false, url: '', title: '' })}
      />

      {toast && (
        <div className="app-toast" role="status">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
        </div>
      )}

      {isPlaqueOpen && selectedGame && (
        <div
          className={`plaque-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 ${
            isPlaqueClosing ? 'tv-closing-backdrop' : ''
          }`}
          onClick={handleClosePlaque}
        >
          <div
            className={`plaque-modal-content w-full max-w-[min(92vw,1100px)] ${isPlaqueClosing ? 'tv-closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MemorialPlaque
              game={selectedGame}
              isModal
              onClose={handleClosePlaque}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteGame}
              onMarkCleared={handleMarkCleared}
              onViewProof={handleViewProof}
            />
          </div>
        </div>
      )}
    </div>
  );
};
