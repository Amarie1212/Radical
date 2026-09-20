import React from 'react';
import { AppLanguage, Game } from '../lib/types';
import { getText } from '../lib/i18n';
import { MoreVertical, CheckCircle, Edit2, Trash2, Award, ChevronDown } from 'lucide-react';

interface GameGridProps {
  language?: AppLanguage;
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onEditGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
  onMarkCleared: (id: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  availablePlatforms: string[];
}

export const GameGrid: React.FC<GameGridProps> = ({
  language = 'id',
  games,
  selectedGameId,
  onSelectGame,
  onEditGame,
  onDeleteGame,
  onMarkCleared,
  selectedStatus,
  onStatusChange,
  selectedPlatform,
  onPlatformChange,
  availablePlatforms,
}) => {
  const t = {
    filterBy: getText(language, 'filterBy'),
    all: getText(language, 'all'),
    month: getText(language, 'month'),
    genre: getText(language, 'genre'),
    noGames: getText(language, 'noGames'),
    noGamesHint: getText(language, 'noGamesHint'),
    viewPlaque: getText(language, 'viewPlaque'),
    markCleared: getText(language, 'markCleared'),
    edit: getText(language, 'edit'),
    delete: getText(language, 'delete'),
  };
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClose = () => setActiveMenuId(null);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  const getStatusBadgeStyle = (status: Game['status']) => {
    switch (status) {
      case 'Cleared':
        return 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'In Progress':
        return 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]';
      case 'Planned':
        return 'bg-amber-600 text-white shadow-[0_0_8px_rgba(217,119,6,0.4)]';
      case 'Dropped':
        return 'bg-rose-900 text-rose-200 border border-rose-700/60';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1 pb-3 border-b border-slate-800/70">
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="font-cinzel text-lg font-bold tracking-[0.16em] text-white uppercase">Clear</h1>
          <div className="hud-filterbar flex flex-wrap items-center gap-2 px-3 py-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-300 font-tactical tracking-[0.25em] uppercase">
            {t.filterBy}
          </span>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none bg-[#131b2a] text-[11px] sm:text-xs font-semibold text-slate-200 pl-2.5 sm:pl-3 pr-6 sm:pr-7 py-2 rounded-full border border-slate-700 hover:border-brand-orange/70 focus:border-brand-orange focus:outline-none transition-colors cursor-pointer uppercase"
            >
              <option value="ALL">{t.month}</option>
              <option value="Cleared">Cleared</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Planned</option>
              <option value="Dropped">Dropped</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="appearance-none bg-[#131b2a] text-[11px] sm:text-xs font-semibold text-slate-200 pl-2.5 sm:pl-3 pr-6 sm:pr-7 py-2 rounded-full border border-slate-700 hover:border-brand-orange/70 focus:border-brand-orange focus:outline-none transition-colors cursor-pointer uppercase"
            >
              <option value="ALL">{t.genre}</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          </div>
        </div>
      </div>

      {/* Grid of Game Cards */}
      {games.length === 0 ? (
        <div className="py-12 sm:py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20 px-4">
          <Award className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-2 sm:mb-3 animate-pulse" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-300">{t.noGames}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t.noGamesHint}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {games.map((game) => {
            const isSelected = selectedGameId === game.id;
            return (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`game-card group relative flex flex-col overflow-hidden rounded-xl transition-all duration-200 cursor-pointer border ${
                  isSelected ? 'game-card-selected' : 'border-slate-800/90'
                }`}
              >
                <div className="relative aspect-[1.75/1] w-full shrink-0 overflow-hidden bg-slate-900">
                  <img
                    src={game.cover_image_url}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1320] via-black/10 to-transparent" />

                  <div className="absolute inset-x-2 bottom-2">
                    <span
                      className={`inline-flex items-center justify-center w-full py-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] rounded-md shadow ${getStatusBadgeStyle(
                        game.status
                      )}`}
                    >
                      {game.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === game.id ? null : game.id);
                      }}
                      className="p-1 rounded bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-colors"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeMenuId === game.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-36 bg-[#0c121e] border border-slate-700 rounded-xl shadow-2xl py-1 z-30 text-xs"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectGame(game);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <Award className="w-3.5 h-3.5 text-copper-light" />
                          <span>{t.viewPlaque}</span>
                        </button>
                        {game.status !== 'Cleared' && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onMarkCleared(game.id);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-emerald-400 flex items-center gap-2"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t.markCleared}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onEditGame(game);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-brand-orange" />
                          <span>{t.edit}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (confirm(`Delete "${game.title}"?`)) {
                              onDeleteGame(game.id);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-950/50 text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.delete}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-2.5">
                  <div>
                  <h4 className="text-[11px] font-bold text-slate-100 font-tactical tracking-[0.14em] uppercase truncate group-hover:text-brand-orange transition-colors">
                    {game.title}
                  </h4>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-slate-800/90 text-copper-shine font-semibold px-1.5 py-0.5 rounded border border-copper-dark/50 truncate max-w-full uppercase">
                      {game.platform}
                    </span>
                    {game.genre && (
                      <span className="text-[8px] text-slate-400 uppercase tracking-[0.08em]">
                        {game.genre}
                      </span>
                    )}
                  </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onEditGame(game); }}
                    className="group/btn relative flex items-center justify-center gap-1 w-full px-2 py-1.5 rounded-md text-[9px] font-semibold tracking-[0.18em] uppercase transition-all duration-200 border border-slate-700 hover:border-brand-orange/80 bg-slate-900/60 hover:bg-brand-orange/10 text-slate-300 hover:text-brand-orange"
                  >
                    <Edit2 size={8} className="transition-transform duration-200 group-hover/btn:-rotate-12" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
