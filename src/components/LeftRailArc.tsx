import React from 'react';
import { LayoutGrid, ListFilter, Settings, Plus } from 'lucide-react';
import { Game } from '../lib/types';
interface LeftRailArcProps {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onOpenSettings: () => void;
  onOpenAddModal: () => void;
  viewMode: 'list' | 'grid';
  onToggleViewMode: (mode: 'list' | 'grid') => void;
}

export const LeftRailArc: React.FC<LeftRailArcProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  onOpenSettings,
  onOpenAddModal,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="absolute inset-y-0 left-0 z-40 flex h-full w-[205px] select-none">
      <div className="tactical-rail w-[50px] flex flex-col items-center py-3 justify-between shrink-0">
        <div className="flex flex-col items-center space-y-3 w-full">
          <button
            onClick={() => onToggleViewMode('grid')}
            title="Grid View"
            className={`rail-action w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              viewMode === 'grid'
                ? 'text-brand-orange bg-orange-950/40 border border-brand-orange/50 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleViewMode('list')}
            title="Plaque & Timeline View"
            className={`rail-action relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              viewMode === 'list'
                ? 'text-brand-orange bg-orange-950/40 border border-brand-orange/50 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenAddModal}
            title="Track New Game"
            className="rail-action w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-orange hover:bg-slate-800/60 transition-all border border-dashed border-slate-700/60 hover:border-brand-orange/60"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3 w-full">
          <button
            onClick={onOpenSettings}
            title="Database & App Settings"
            className="rail-action w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="arc-dock hidden lg:flex w-[155px] h-full flex-col gap-4 px-3 py-5 relative overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <span className="font-tactical text-[10px] font-bold tracking-[0.28em] text-slate-300 uppercase">Memory Archive</span>
          <span className="text-[9px] text-cyan-300 font-mono">{String(games.length).padStart(2, '0')}</span>
        </div>

        <div className="arc-dock-list flex-1 space-y-3 overflow-y-auto pr-1">
          {games.slice(0, 8).map((game) => {
            const isActive = selectedGameId === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`arc-thumb group relative w-full overflow-hidden rounded-xl border text-left transition-all ${isActive ? 'arc-thumb-active' : 'border-slate-700/70'}`}
                title={`Open ${game.title} plaque`}
              >
                <img
                  src={game.cover_image_url}
                  alt={game.title}
                  className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07101a] via-transparent to-transparent" />
                <div className="absolute inset-x-2 bottom-1.5">
                  <div className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-white">{game.title}</div>
                  <div className="truncate text-[8px] font-tactical uppercase tracking-[0.16em] text-slate-400">{game.status}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
