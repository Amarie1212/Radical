import React, { useState, useEffect, useRef } from 'react';
import { Game } from '../lib/types';
import {
  X, Upload, Loader2,
  Calendar, ScrollText, Camera, FileText, Star, Tag, Plus,
} from 'lucide-react';

interface EditGamePanelProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameData: Omit<Game, 'id' | 'duration_days'>, existingId?: string) => Promise<void>;
}

const PLATFORM_OPTIONS = [
  'PC (.exe)',
  'PC (Steam)',
  'PC (Epic / GOG)',
  'PlayStation 2 (PS2)',
  'PlayStation 1 (PSX)',
  'PlayStation Portable (PSP)',
  'PlayStation 3 (PS3)',
  'PlayStation 4 (PS4)',
  'PlayStation 5 (PS5)',
  'Nintendo Switch',
  'Nintendo (Retro / Emulator)',
  'Xbox',
  'Other / Custom',
];

const STATUS_OPTIONS: Game['status'][] = ['Planned', 'In Progress', 'Cleared', 'Dropped'];

const normalizeProofs = (game: Game | null): string[] => {
  if (!game) return [''];

  if (game.proofs && game.proofs.length > 0) {
    return game.proofs.slice(0, 10);
  }

  const direct = [game.proof_clear, game.proof_credits, game.proof_achievement].filter(Boolean) as string[];
  return direct.length > 0 ? direct.slice(0, 10) : [''];
};

export const EditGamePanel: React.FC<EditGamePanelProps> = ({ game, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [status, setStatus] = useState<Game['status'] | ''>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [startedOn, setStartedOn] = useState('');
  const [finishedOn, setFinishedOn] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [proofs, setProofs] = useState<string[]>(['']);
  const [page, setPage] = useState(0);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 190);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (game && isOpen) {
      setTitle(game.title || '');
      const savedPlatform = game.platform === 'PC (Standalone / .exe)' ? 'PC (.exe)' : game.platform;
      const isKnown = PLATFORM_OPTIONS.includes(savedPlatform);
      setPlatform(isKnown ? savedPlatform : 'Other / Custom');
      setCustomPlatform(isKnown ? '' : savedPlatform || '');
      setStatus(game.status || '');
      setCoverImageUrl(game.cover_image_url || '');
      setStartedOn(game.started_on || '');
      setFinishedOn(game.finished_on || '');
      setGenre(game.genre || '');
      setRating(game.rating ?? '');
      setNotes(game.notes || '');
      setProofs(normalizeProofs(game));
      setPage(0);
      setError(null);
    }
  }, [game, isOpen]);

  if (!isOpen) return null;

  const addProof = () => {
    setProofs((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  };

  const updateProof = (index: number, value: string) => {
    setProofs((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeProof = (index: number) => {
    setProofs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Select an image file (JPG/PNG/WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const handleSearchOnline = async () => {
    if (!title.trim()) {
      setError('Enter game title first to search for poster.');
      return;
    }

    try {
      setSearchingOnline(true);
      setError(null);
      const results = [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      ];
      const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setCoverImageUrl(results[hash % results.length]);
    } catch {
      setError('Failed to search for poster online.');
    } finally {
      setSearchingOnline(false);
    }
  };

  const isTitleValid = title.trim().length > 0;
  const isPlatformValid = Boolean(platform) && (platform !== 'Other / Custom' || customPlatform.trim().length > 0);
  const isStatusValid = Boolean(status);

  const goToNextPage = () => {
    if (page === 0 && !isTitleValid) {
      setError('Please enter the game title first.');
      return;
    }

    if (page === 1 && !isPlatformValid) {
      setError('Please select a platform first.');
      return;
    }

    if (page === 2 && !isStatusValid) {
      setError('Please select a game status first.');
      return;
    }

    setError(null);
    setPage((current) => Math.min(current + 1, 4));
  };

  const handleSubmit = async () => {
    const safeTitle = title.trim();
    const finalPlatform = platform === 'Other / Custom' ? customPlatform.trim() || 'Custom' : platform;
    const cleanedProofs = proofs.map((p) => p.trim()).filter(Boolean).slice(0, 10);
    const finalCover = coverImageUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';

    try {
      setLoading(true);
      setError(null);

      await onSave({
        title: safeTitle || 'Untitled Game',
        platform: finalPlatform,
        status: status || 'Planned',
        started_on: startedOn || null,
        finished_on: finishedOn || null,
        genre: genre || undefined,
        rating: rating !== '' ? Number(rating) : undefined,
        cover_image_url: finalCover,
        notes: notes || undefined,
        proof_clear: cleanedProofs[0] || undefined,
        proof_credits: cleanedProofs[1] || undefined,
        proof_achievement: cleanedProofs[2] || undefined,
        proofs: cleanedProofs.length > 0 ? cleanedProofs : undefined,
      }, game?.id);

      handleClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'zzz-form-input text-xs sm:text-sm';
  const labelCls = 'zzz-form-label flex items-center gap-1.5';
  const sectionLabelCls = 'text-[11px] font-[\'Outfit\'] font-extrabold tracking-wider text-zinc-400 uppercase border-b border-[#282A36] pb-1.5 flex items-center gap-1.5 mb-3';

  return (
    <div
      className={`notebook-entry-overlay fixed inset-0 flex items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto ${isClosing ? 'tv-closing-backdrop' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`zzz-modal-window w-full max-w-[560px] my-auto ${isClosing ? 'tv-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="zzz-modal-header">
          <div className="zzz-modal-header-copy">
            <h2 className="zzz-modal-title">Edit Commission Archive</h2>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {coverImageUrl ? (
              <div className="zzz-modal-graphic">
                <img src={coverImageUrl} alt="Cover preview" />
                <span className="zzz-modal-graphic-badge">{page + 1}</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="zzz-modal-close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          className="zzz-modal-body"
        >
          {error && (
            <div className="bg-red-950/60 border border-red-500 text-red-200 px-3.5 py-2 rounded-xl text-xs">
              {error}
            </div>
          )}

          {page === 0 && (
            <div className="space-y-1.5">
              <label className="zzz-form-label">
                GAME TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="zzz-form-input"
              />
            </div>
          )}

          {page === 1 && (
            <div className="space-y-3">
              <div>
                <label className="zzz-form-label">
                  PLATFORM *
                </label>
                <select
                  value={platform}
                  required
                  onChange={(e) => setPlatform(e.target.value)}
                  className="zzz-form-select cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Platform --
                  </option>
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {platform === 'Other / Custom' && (
                <div>
                  <label className="zzz-form-label">CUSTOM PLATFORM NAME</label>
                  <input
                    type="text"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    className="zzz-form-input"
                  />
                </div>
              )}
            </div>
          )}

          {page === 2 && (
            <div className="space-y-1.5">
              <label className="zzz-form-label">
                STATUS *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Game['status'])}
                className="zzz-form-select cursor-pointer"
              >
                <option value="" disabled>-- Select Status --</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {page === 3 && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <label className="zzz-form-label flex items-center justify-between">
                  <span>COVER POSTER</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Online Search / Local File</span>
                </label>

                <div className="zzz-action-list">
                  <button
                    type="button"
                    onClick={handleSearchOnline}
                    disabled={searchingOnline}
                    className="zzz-action-row"
                  >
                    <span className="zzz-action-left">
                      <span className="zzz-action-tag">[ SEARCH ]</span>
                      <span className="zzz-action-label">Search Online Database</span>
                    </span>
                    <span className="zzz-action-arrow">
                      {searchingOnline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '›'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="zzz-action-row"
                  >
                    <span className="zzz-action-left">
                      <span className="zzz-action-tag">[ BROWSE ]</span>
                      <span className="zzz-action-label">Browse Device Files</span>
                    </span>
                    <span className="zzz-action-arrow">›</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setCoverImageUrl)}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="zzz-form-label">OR DIRECT IMAGE URL</label>
                  <input
                    type="url"
                    value={coverImageUrl.startsWith('data:') ? '[Local Device Image Attached]' : coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="zzz-form-input"
                  />
                </div>

                {coverImageUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#171821] rounded-xl border border-[#2B2D3B]">
                    <img
                      src={coverImageUrl}
                      alt="Preview"
                      className="w-12 h-16 object-cover rounded-lg border border-[#3A3D4C]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-400 block font-['Outfit']">Poster Ready</span>
                      <span className="text-[10px] text-zinc-400 truncate block font-mono">
                        {coverImageUrl.startsWith('data:') ? 'Local Device Image' : coverImageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold mt-1 font-['Outfit']"
                      >
                        Remove / Replace
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelCls}><Tag className="w-3.5 h-3.5 text-zinc-400" /> GENRE</label>
                <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls} />
              </div>

              <div className="space-y-1">
                <label className={labelCls}><Star className="w-3.5 h-3.5 text-yellow-400" /> RATING (1–10)</label>
                <input type="number" min={1} max={10} value={rating} onChange={(e) => setRating(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls} />
              </div>

              <div className="space-y-3">
                <div className={sectionLabelCls}><Calendar className="w-3 h-3" /> PLAY DATE</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400 font-semibold font-['Outfit']">Started</label>
                    <input type="date" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400 font-semibold font-['Outfit']">Finished</label>
                    <input type="date" value={finishedOn} onChange={(e) => setFinishedOn(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className={sectionLabelCls}><ScrollText className="w-3 h-3" /> JOURNEY NOTES</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="zzz-form-textarea resize-none"
                />
              </div>

              <div className="space-y-3">
                <div className={sectionLabelCls}><Camera className="w-3 h-3" /> MEMORIAL PLAQUE PROOFS</div>

                {proofs.map((proofUrl, index) => (
                  <div key={`${index}-${proofUrl || 'empty'}`} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 font-['Outfit']">
                      <FileText className="w-3 h-3 text-zinc-400" /> Proof {index + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={proofUrl.startsWith('data:') ? '[File selected]' : proofUrl}
                        onChange={(e) => updateProof(index, e.target.value)}
                        className={`${inputCls} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => proofInputsRef.current[index]?.click()}
                        className="px-3 bg-[#171821] hover:bg-[#252733] border border-[#2B2D3B] hover:border-[#4C5066] rounded-xl transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-zinc-300" />
                      </button>
                      <input
                        ref={(el) => {
                          proofInputsRef.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, (v) => updateProof(index, v))}
                      />
                      {proofs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProof(index)}
                          className="px-3 bg-red-950/30 hover:bg-red-900/40 border border-red-500/40 rounded-xl text-red-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProof}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-[#3A3D4C] text-zinc-300 rounded-xl hover:border-zinc-400 hover:text-white transition-colors text-[11px] font-semibold uppercase tracking-wider font-['Outfit']"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Proof
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="zzz-modal-footer">
          <button
            type="button"
            onClick={page === 0 ? handleClose : () => setPage((current) => Math.max(current - 1, 0))}
            className="zzz-action-row"
          >
            <span className="zzz-action-left">
              <span className="zzz-action-tag">[ {page === 0 ? 'ABORT' : 'BACK'} ]</span>
              <span className="zzz-action-label">{page === 0 ? 'Cancel Changes' : 'Previous Step'}</span>
            </span>
            <span className="zzz-action-arrow">{page === 0 ? '✕' : '‹'}</span>
          </button>

          {page < 4 ? (
            <button
              type="button"
              onClick={goToNextPage}
              disabled={(page === 0 && !isTitleValid) || (page === 1 && !isPlatformValid) || (page === 2 && !isStatusValid)}
              className="zzz-action-row zzz-action-primary disabled:opacity-40 disabled:pointer-events-none"
            >
              <span className="zzz-action-left">
                <span className="zzz-action-tag">[ NEXT ]</span>
                <span className="zzz-action-label">Proceed</span>
              </span>
              <span className="zzz-action-arrow">›</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="zzz-action-row zzz-action-primary disabled:opacity-40 disabled:pointer-events-none"
            >
              <span className="zzz-action-left">
                <span className="zzz-action-tag">[ COMMIT ]</span>
                <span className="zzz-action-label">{loading ? 'Saving...' : 'Save Changes'}</span>
              </span>
              <span className="zzz-action-arrow">✓</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
