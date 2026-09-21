import React from 'react';
import { AppLanguage, Game } from '../lib/types';
import { getText } from '../lib/i18n';
import { Trophy, Award, Clock, Flame, CheckCircle2, Shield, Gamepad2 } from 'lucide-react';

interface AchievementsViewProps {
  language?: AppLanguage;
  games: Game[];
  onSelectGame: (game: Game) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ language = 'id', games, onSelectGame }) => {
  const t = {
    completionRate: getText(language, 'completionRate'),
    clearGames: getText(language, 'clearGames'),
    inProgress: getText(language, 'inProgress'),
    avgDuration: getText(language, 'avgDuration'),
    totalDaysLogged: getText(language, 'totalDaysLogged'),
    memorialCleared: getText(language, 'memorialCleared'),
  };
  const clearedGames = games.filter((g) => g.status === 'Cleared');
  const inProgressGames = games.filter((g) => g.status === 'In Progress');

  // Calculate stats
  const totalCleared = clearedGames.length;
  const durations = clearedGames.map((g) => g.duration_days).filter((d): d is number => typeof d === 'number');
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const totalDaysPlayed = durations.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full flex flex-col space-y-6 pb-12">
      {/* 1. Trophy Header Banner */}
      <div className="bg-gradient-to-r from-[#1c2e4a] via-[#16253d] to-[#0f1a2c] p-6 rounded-2xl border border-copper-dark/60 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-orange-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#FFDE00] text-xs font-outfit font-bold tracking-widest uppercase">
              <Trophy className="w-4 h-4 text-[#FFDE00]" />
              <span>{language === 'en' ? 'HALL OF ACHIEVEMENTS & MASTER MEMORIALS' : 'HALL OF ACHIEVEMENTS & MASTER MEMORIALS'}</span>
            </div>
            <h1 className="font-outfit text-2xl sm:text-3xl font-black italic tracking-tight text-white mt-1">
              HALL OF FAME PLAQUES
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg font-outfit">
              Every game you complete is immortalized with an engraved copper plaque in the cloud database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/40 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-outfit font-bold uppercase tracking-wider">COMPLETION RATE</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {games.length > 0 ? Math.round((totalCleared / games.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#101726] border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-outfit font-bold uppercase tracking-wider">CLEARED GAMES</div>
            <div className="text-xl font-bold text-white font-mono">{totalCleared}</div>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-600/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-outfit font-bold uppercase tracking-wider">{t.inProgress}</div>
            <div className="text-xl font-bold text-white font-mono">{inProgressGames.length}</div>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-outfit font-bold uppercase tracking-wider">{t.avgDuration}</div>
            <div className="text-xl font-bold text-white font-mono">{avgDuration} Days</div>
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-600/40 flex items-center justify-center text-brand-orange shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-outfit font-bold uppercase tracking-wider">{t.totalDaysLogged}</div>
            <div className="text-xl font-bold text-white font-mono">{totalDaysPlayed} Days</div>
          </div>
        </div>
      </div>

      {/* 3. Masterwork Cleared Plaques Showcase */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
          <Award className="w-4 h-4 text-[#FFDE00]" />
          <h3 className="font-outfit text-base font-black uppercase italic tracking-wider text-white">
            {t.memorialCleared}
          </h3>
        </div>

        {clearedGames.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 font-outfit">
            No games marked as Cleared yet. Add or change your game status to Cleared to display plaques here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clearedGames.map((game) => (
              <div
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="copper-inner-frame p-4 rounded-xl cursor-pointer hover:border-copper-light transition-all shadow-xl hover:shadow-[0_0_20px_rgba(200,125,74,0.35)] group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={game.cover_image_url}
                    alt={game.title}
                    className="w-14 h-18 object-cover rounded-lg border border-copper-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[#FFDE00] text-[10px] font-outfit font-bold tracking-widest uppercase">
                      <Shield className="w-3 h-3" />
                      <span>CLEARED</span>
                    </div>
                    <h4 className="font-outfit text-sm font-bold text-white group-hover:text-[#FFDE00] truncate">
                      {game.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                      <span className="text-[#FFDE00] font-semibold font-outfit">{game.platform}</span>
                      <span className="font-mono text-slate-400">{game.duration_days ? `${game.duration_days} Days` : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
