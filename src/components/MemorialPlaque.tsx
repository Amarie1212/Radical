import React from 'react';
import { Game } from '../lib/types';
import { Calendar, Flag, Clock, Edit, Trash2, CheckCircle2, Sparkles, X, Share2, Award, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemorialPlaqueProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onMarkCleared: (id: string) => void;
  onClose?: () => void;
  onViewProof?: (imageUrl: string, title: string) => void;
  isModal?: boolean;
}

export const MemorialPlaque: React.FC<MemorialPlaqueProps> = ({
  game,
  onEdit,
  onDelete,
  onMarkCleared,
  onClose,
  onViewProof,
  isModal = false,
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'In Progress / Not Set';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F97316', '#22C55E', '#C87D4A', '#2DD4BF', '#FFD1A4'],
    });
  };

  const proofSources = game.proofs && game.proofs.length > 0
    ? game.proofs
    : [game.proof_clear, game.proof_credits, game.proof_achievement].filter(Boolean) as string[];

  const proofSlots = proofSources.slice(0, 1).map((url) => ({
    label: 'clear screen',
    url,
    title: `${game.title} - Victory / Clear Screen`,
  }));

  return (
    <div
      className={`relative w-full max-w-[min(92vw,1100px)] mx-auto select-none transition-all duration-300 ${
        isModal ? 'animate-in fade-in zoom-in-95 duration-200' : ''
      }`}
    >
      {/* Close button — floats above the entire plaque */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:top-1 sm:right-1 z-50 p-1.5 bg-[#1a2540] border border-slate-600 hover:border-brand-orange text-slate-300 hover:text-white transition-all rounded-full shadow-lg"
          title="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Outer Copper Beveled Frame */}
      <div className="copper-bevel p-1.5 sm:p-2.5 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* 4 Corner Metal Rivets */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 plaque-rivet" />
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 plaque-rivet" />
        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 z-20 plaque-rivet" />
        <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 plaque-rivet" />

        {/* Diagonal Glowing Orange Laser Beams Behind Plaque Frame */}
        <div className="absolute -top-10 -left-10 w-96 h-1 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rotate-45 pointer-events-none blur-[1px]" />
        <div className="absolute -bottom-10 -right-10 w-96 h-1 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rotate-45 pointer-events-none blur-[1px]" />

        {/* Inner Dark Patina Teal Plate with responsive scroll */}
        <div className="copper-inner-frame rounded-xl p-3 sm:p-5 md:p-6 relative text-slate-200 overflow-y-auto max-h-[calc(100dvh-4.5rem)] overscroll-contain">
          

          {/* Top Decorative Filigree / Crest Arch */}
          <div className="flex items-center justify-center mb-3 sm:mb-4 relative">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-copper-dark to-copper-light opacity-60" />
            
            <div className="px-3 sm:px-4 flex items-center gap-2">
              <svg viewBox="0 0 60 20" className="w-8 sm:w-12 h-4 sm:h-5 fill-copper-light text-copper-light opacity-90">
                <path d="M30 2 C 22 2, 18 10, 0 10 C 18 10, 22 18, 30 18 C 38 18, 42 10, 60 10 C 42 10, 38 2, 30 2 Z" />
              </svg>
            </div>

            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-copper-dark to-copper-light opacity-60" />
          </div>

          {/* 1. Plaque Header Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-copper-dark/60">
            {/* Left Mini Cover Art */}
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 rounded-lg overflow-hidden shrink-0 border-2 border-copper-border shadow-lg group">
              <img
                src={game.cover_image_url}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-copper-shine uppercase tracking-wider truncate w-full text-center">
                  {game.title}
                </span>
              </div>
            </div>

            {/* Right Title & Mastered Certificate */}
            <div className="flex-1 flex flex-col justify-center text-center sm:text-left space-y-1 w-full min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#FFDE00] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase font-['Outfit']">
                <Award className="w-3.5 h-3.5 text-[#FFDE00] shrink-0" />
                <span>Certificate of Game Mastered:</span>
              </div>

              <h1 className="font-['Outfit'] text-xl sm:text-3xl md:text-4xl font-black italic tracking-tight uppercase text-white drop-shadow-md leading-none break-words">
                {game.title}
              </h1>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-emerald-950/80 text-emerald-400 border border-emerald-500/80 green-glow-badge font-['Outfit']">
                  {game.status.toUpperCase()}
                </span>
                {game.platform && (
                  <span className="text-[11px] sm:text-xs text-slate-300 font-['Outfit'] font-bold tracking-[0.14em] uppercase">
                    {game.platform}
                  </span>
                )}
                {game.rating && (
                  <span className="text-[11px] sm:text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-600/40 font-mono">
                    ★ {game.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {game.notes && (
                <p className="text-[11px] sm:text-xs text-slate-300/80 italic line-clamp-2 pt-1 font-['Outfit']">
                  "{game.notes}"
                </p>
              )}
            </div>
          </div>

          {/* 2. Section: YOUR JOURNEY DATA */}
          <div className="mt-3 sm:mt-4">
            <h3 className="font-['Outfit'] text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#FFDE00] mb-1.5 sm:mb-2 flex items-center gap-1.5">
              <span>YOUR JOURNEY DATA</span>
            </h3>

            <div className="bg-[#0f2423]/90 border border-copper-dark/80 rounded-lg p-2.5 sm:p-3.5 md:p-4 space-y-2 shadow-inner">
              {/* Started On */}
              <div className="flex items-center justify-between py-1 border-b border-tealplate-border/40 text-xs sm:text-sm">
                <div className="text-[10px] sm:text-xs text-slate-400 font-['Outfit'] font-bold tracking-wider uppercase">
                  STARTED ON:
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-100 font-mono text-xs sm:text-sm">
                  <span>{formatDate(game.started_on)}</span>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFDE00] shrink-0" />
                </div>
              </div>

              {/* Finished On */}
              <div className="flex items-center justify-between py-1 border-b border-tealplate-border/40 text-xs sm:text-sm">
                <div className="text-[10px] sm:text-xs text-slate-400 font-['Outfit'] font-bold tracking-wider uppercase">
                  FINISHED ON:
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-100 font-mono text-xs sm:text-sm">
                  <span>{formatDate(game.finished_on)}</span>
                  <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFDE00] shrink-0" />
                </div>
              </div>

              {/* Total Duration */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] sm:text-xs text-slate-400 font-['Outfit'] font-bold tracking-wider uppercase">
                  TOTAL DURATION:
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg font-black text-[#FFDE00] font-['Outfit'] italic">
                  <span>
                    {game.duration_days !== null && game.duration_days !== undefined
                      ? `${game.duration_days} Days`
                      : game.started_on && game.finished_on
                      ? 'Calculated at Sync'
                      : 'Active Campaign'}
                  </span>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFDE00] shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Section: PROOF OF CLEARANCE */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h3 className="font-['Outfit'] text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#FFDE00]">
                PROOF OF CLEARANCE
              </h3>
              <span className="text-[9px] sm:text-[10px] text-slate-400 italic font-['Outfit']">Click to inspect</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {proofSlots.map((proof, idx) => (
                <div
                  key={idx}
                  onClick={() => onViewProof && onViewProof(proof.url, proof.title)}
                  className="group relative cursor-pointer bg-black/40 rounded-lg p-1 border border-tealplate-border/60 hover:border-copper-shine transition-all duration-200"
                >
                  <div className="aspect-video w-full rounded overflow-hidden bg-slate-900 relative">
                    <img
                      src={proof.url}
                      alt={proof.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFDE00] drop-shadow" />
                    </div>
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-center text-slate-300 group-hover:text-[#FFDE00] font-['Outfit'] font-semibold tracking-wider py-0.5 sm:py-1 truncate">
                    {proof.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Action Toolbar */}
          <div className="mt-4 sm:mt-5 pt-2.5 sm:pt-3 border-t border-copper-dark/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {game.status !== 'Cleared' && (
                <button
                  onClick={() => {
                    onMarkCleared(game.id);
                    triggerConfetti();
                  }}
                  className="flex items-center gap-1 bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-emerald-500 transition-all shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Cleared</span>
                </button>
              )}

              <button
                onClick={triggerConfetti}
                className="flex items-center gap-1 bg-copper-dark/60 hover:bg-copper-dark text-copper-shine text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-copper-border transition-all"
                title="Celebrate Achievement!"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>Salute</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `🏆 Game Mastered: ${game.title} - Cleared in ${game.duration_days || 'X'} Days!`
                  );
                  alert('Certificate summary copied to clipboard!');
                }}
                className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded border border-slate-700 transition-all"
                title="Copy shareable summary"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onEdit(game)}
                className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-slate-600 transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
                    onDelete(game.id);
                  }
                }}
                className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-red-800/60 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
