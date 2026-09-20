import React from 'react';
import { Game } from '../lib/types';
import { Calendar, Clock } from 'lucide-react';

interface TimelineViewProps {
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  games,
  selectedGame,
  onSelectGame,
}) => {
  // Sort games chronologically
  const sortedGames = [...games].sort((a, b) => {
    const dateA = new Date(a.finished_on || a.started_on || a.created_at || '').getTime();
    const dateB = new Date(b.finished_on || b.started_on || b.created_at || '').getTime();
    return dateB - dateA;
  });

  const getStatusBadge = (status: Game['status']) => {
    switch (status) {
      case 'Cleared':
        return 'bg-emerald-950 text-emerald-400 border-emerald-600/50';
      case 'In Progress':
        return 'bg-cyan-950 text-cyan-400 border-cyan-600/50';
      case 'Planned':
        return 'bg-amber-950 text-amber-400 border-amber-600/50';
      case 'Dropped':
        return 'bg-rose-950 text-rose-400 border-rose-600/50';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8 pb-10">
      <div className="w-full max-w-4xl mx-auto mt-2">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <Clock className="w-4 h-4 text-brand-orange" />
          <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200">
            CHRONOLOGICAL CONQUEST LOG
          </h2>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-4 sm:space-y-6">
          {sortedGames.map((g) => {
            const isSelected = selectedGame?.id === g.id;
            return (
              <div
                key={g.id}
                onClick={() => onSelectGame(g)}
                className={`group relative cursor-pointer p-3 sm:p-4 rounded-xl transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#152035] border-slate-700'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:bg-[#131d33]'
                }`}
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[25px] sm:-left-[31px] top-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'bg-brand-orange border-white shadow-[0_0_8px_#F97316]'
                      : g.status === 'Cleared'
                      ? 'bg-emerald-500 border-[#0B0F19]'
                      : g.status === 'In Progress'
                      ? 'bg-cyan-500 border-[#0B0F19]'
                      : 'bg-amber-500 border-[#0B0F19]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img
                      src={g.cover_image_url}
                      alt={g.title}
                      className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                    <div>
                      <h4 className="font-cinzel text-sm sm:text-base font-bold text-white group-hover:text-copper-shine transition-colors">
                        {g.title}
                      </h4>
                      <p className="text-xs text-copper-shine font-tactical">
                        {g.platform}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:text-right">
                    <div className="text-xs">
                      <div className="text-slate-400 flex items-center sm:justify-end gap-1 text-[11px] sm:text-xs">
                        <Calendar className="w-3 h-3 text-copper-light" />
                        <span>{g.finished_on || g.started_on || 'Not Set'}</span>
                      </div>
                      <div className="text-copper-shine font-bold font-mono text-xs sm:text-sm">
                        {g.duration_days ? `${g.duration_days} Days Campaign` : g.status}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                        g.status
                      )}`}
                    >
                      {g.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
