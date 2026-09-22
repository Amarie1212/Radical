import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Edit2, MoreHorizontal, Search, Trash2, Gamepad2, Tag, Trophy, Zap, Film, Calendar, Flag, Clock, ArrowLeft, ArrowRight, FileText, Quote, RefreshCw } from 'lucide-react';
import { AppLanguage, Game } from '../lib/types';
import { getText } from '../lib/i18n';

interface JournalDashboardProps {
  language?: AppLanguage;
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
  onEditGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
  onOpenProof?: (url: string, title: string) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

const formatDate = (value: string | null, fallback: string) => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const hasText = (value?: string | null) => Boolean(value && value.trim().length > 0);
const formatPlatform = (value: string) => value.replace('Standalone / ', '');

export const JournalDashboard: React.FC<JournalDashboardProps> = ({
  language = 'id',
  games,
  selectedGame,
  onSelectGame,
  onEditGame,
  onDeleteGame,
  onOpenProof,
  onRefresh,
  isSyncing,
}) => {
  const t = {
    searchGame: getText(language, 'searchGame'),
    noGames: getText(language, 'noGames'),
    noGamesHint: getText(language, 'noGamesHint'),
    edit: getText(language, 'edit'),
    delete: getText(language, 'delete'),
    filterBy: getText(language, 'filterBy'),
    all: getText(language, 'all'),
  };
  const game = selectedGame || games[0];
  const [gameSearch, setGameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Game['status']>('ALL');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  // Flexible Dropdown: close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSortOpen &&
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node) &&
        sortBtnRef.current &&
        !sortBtnRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSortOpen) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  const handleCancelDelete = () => {
    setIsDeleteClosing(true);
    setTimeout(() => {
      setDeleteTarget(null);
      setIsDeleteClosing(false);
    }, 200);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setIsDeleteClosing(true);
    setTimeout(() => {
      onDeleteGame(targetId);
      setDeleteTarget(null);
      setIsDeleteClosing(false);
    }, 200);
  };
  const safeGames = Array.isArray(games) ? games : [];
  const clearedCount = useMemo(() => safeGames.filter((item) => item?.status === 'Cleared').length, [safeGames]);

  const visibleGames = useMemo(() => {
    return safeGames
      .filter((item) => {
        if (!item) return false;
        const title = item.title ? item.title.toLowerCase() : '';
        const matchesSearch = title.includes(gameSearch.trim().toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a?.title || '').localeCompare(b?.title || ''));
  }, [safeGames, gameSearch, statusFilter]);

  const activeFilterLabel = statusFilter === 'ALL' ? 'ALL GAMES' : statusFilter.toUpperCase();
  const statusClass = (status?: string | null) => status ? `status-${status.toLowerCase().replace(/\s+/g, '-')}` : 'status-planned';
  const attachedProofs = (game?.proofs && game.proofs.length > 0
    ? game.proofs
    : [game?.proof_clear, game?.proof_credits, game?.proof_achievement].filter(Boolean) as string[]
  );
  const visibleProofs = attachedProofs;
  const hasMilestones = Boolean(game?.started_on || game?.finished_on || game?.duration_days);

  return (
    <div className="journal-page" data-mobile-view={mobileView}>
      <div className="journal-columns">
        <aside className="quest-log">
          <div className="journal-section-heading">
            <div className="quest-heading-copy">
              <div className="quest-header-stats flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="quest-count-label">
                    {games.length} {games.length === 1 ? 'GAME' : 'GAMES'} RECORDED
                  </span>
                  {onRefresh && (
                    <button
                      type="button"
                      onClick={onRefresh}
                      className="p-1 rounded text-zinc-400 hover:text-[#FFDE00] transition-colors"
                      title="Sync with cloud database"
                      aria-label="Sync with cloud database"
                    >
                      <RefreshCw size={11} className={isSyncing ? 'animate-spin text-[#FFDE00]' : ''} />
                    </button>
                  )}
                </div>
                <span className="zzz-cleared-pill">
                  <Zap size={11} className="fill-[#FFDE00] text-[#FFDE00] shrink-0" />
                  <span>CLEARED:</span>
                  <strong>{clearedCount} / {games.length}</strong>
                </span>
              </div>
              <div className="quest-heading-row">
                <div className="quest-controls">
                  <label className="quest-search">
                    <Search size={15} />
                    <input
                      type="search"
                      value={gameSearch}
                      onChange={(event) => setGameSearch(event.target.value)}
                      placeholder={t.searchGame}
                      aria-label="Search games"
                    />
                  </label>
                  <div className="quest-sort-wrap" ref={sortMenuRef}>
                    <span className="quest-sort-label">{activeFilterLabel}</span>
                    <button
                      ref={sortBtnRef}
                      className={`quest-sort-button ${isSortOpen ? 'is-active' : ''}`}
                      onClick={() => setIsSortOpen((open) => !open)}
                      aria-label="Filter games by status"
                      aria-expanded={isSortOpen}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {isSortOpen && (
                      <div className="quest-sort-menu">
                        {(['ALL', 'Cleared', 'Planned', 'Dropped', 'In Progress'] as const).map((filter) => (
                          <button
                            key={filter}
                            className={statusFilter === filter ? 'is-selected' : ''}
                            onClick={() => {
                              setStatusFilter(filter);
                              setIsSortOpen(false);
                            }}
                          >
                            {filter === 'ALL' ? 'All games' : filter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="quest-list">
            {visibleGames.length === 0 && (
              <div className="journal-empty">
                <div className="journal-empty-icon">
                  <Search size={22} strokeWidth={2.2} />
                </div>
                <h4 className="journal-empty-title">NO MATCHING ENTRIES</h4>
                <p className="journal-empty-desc">
                  No records match current query or status filter.
                </p>
              </div>
            )}
            {visibleGames.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectGame(item);
                  setMobileView('detail');
                }}
                className={`quest-entry ${game?.id === item.id ? 'is-selected' : ''}`}
              >
                <div className="quest-thumb-wrap">
                  {item.cover_image_url ? (
                    <img
                      src={item.cover_image_url}
                      alt=""
                      className="quest-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="quest-thumb-fallback">
                    <Gamepad2 size={16} className="text-zinc-500" />
                  </div>
                </div>

                <div className="quest-content">
                  <div className="quest-title-row">
                    <strong className="quest-title" title={item.title}>
                      {item.title}
                    </strong>
                    <span className={`quest-status ${statusClass(item.status)}`}>
                      {(item.status || 'PLANNED').toUpperCase()}
                    </span>
                  </div>
                  <div className="quest-meta-row">
                    <span className="quest-meta-platform">{formatPlatform(item.platform)}</span>
                    <span className="quest-meta-sep">•</span>
                    <span className="quest-meta-duration">
                      {item.duration_days ? `${item.duration_days} Days` : '--'}
                    </span>
                    {item.difficulty && (
                      <>
                        <span className="quest-meta-sep">•</span>
                        <span className="quest-meta-rank">RK: {item.difficulty}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {game ? (
          <main className="journal-sheet">
            <div className="sheet-toolbar">
              <button className="mobile-back-to-list zzz-sheet-btn" onClick={() => setMobileView('list')} aria-label="Back to game list">
                <ArrowLeft size={12} className="btn-icon" />
                <span>Game List</span>
              </button>
              <div className="sheet-toolbar-actions">
                <button className="zzz-sheet-btn zzz-edit-btn" onClick={() => onEditGame(game)}>
                  <Edit2 size={12} className="btn-icon" />
                  <span>{t.edit}</span>
                </button>
                <button className="zzz-sheet-btn zzz-delete-btn" onClick={() => setDeleteTarget(game)}>
                  <Trash2 size={12} className="btn-icon" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>

            <div className="sheet-scroll-content">
              <section className="journal-profile">
                <div className="journal-cover">
                  <button
                    className="journal-cover-frame journal-cover-btn"
                    onClick={() => game.cover_image_url && onOpenProof?.(game.cover_image_url, game.title)}
                    title="Click to expand cover"
                    disabled={!game.cover_image_url}
                  >
                    <img src={game.cover_image_url} alt={game.title} />
                    {game.cover_image_url && (
                      <div className="cover-expand-hint">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                      </div>
                    )}
                  </button>
                  <div className="journal-cover-meta">
                    <span className="cover-badge">[ SPECIMEN ARCHIVE ]</span>
                  </div>
                </div>

                <div className="journal-profile-copy min-w-0">
                  <div className="journal-label-row">
                    <span className="journal-label">
                      ARCHIVE #{String(games.findIndex((item) => item.id === game.id) + 1).padStart(3, '0')} • COMMISSION RECORD
                    </span>
                  </div>
                  <h2 className="break-words">{game.title}</h2>

                  <div className="zzz-chips-row flex flex-wrap gap-2 my-2">
                    {hasText(game.platform) && (
                      <span className="zzz-chip">
                        <Gamepad2 size={13} className="text-[#FFDE00]" />
                        <span>{formatPlatform(game.platform)}</span>
                      </span>
                    )}
                    {hasText(game.genre) && (
                      <span className="zzz-chip">
                        <Tag size={13} className="text-zinc-400" />
                        <span>{game.genre}</span>
                      </span>
                    )}
                    {hasText(game.difficulty) && (
                      <span className="zzz-chip">
                        <Trophy size={13} className="text-[#FFDE00]" />
                        <span>{game.difficulty}</span>
                      </span>
                    )}
                  </div>

                  {game.rating && (
                    <div className="zzz-rating-meter flex items-center gap-2.5 my-3">
                      <span className="text-[11px] font-mono tracking-widest text-[#FFDE00] font-black">SYS.EVAL:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
                          <span
                            key={step}
                            className={`w-3 h-4 rounded-[2px] transition-colors ${
                              step <= Math.round(game.rating || 0)
                                ? 'bg-[#FFDE00]'
                                : 'bg-[#262836]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-['Outfit'] text-sm font-black text-white ml-1.5 px-2.5 py-0.5 rounded-md bg-[#1B1C26] border border-[#2F3244]">
                        {game.rating.toFixed(1)} / 10
                      </span>
                    </div>
                  )}

                  {hasText(game.status) && (
                    <div className="pt-1">
                      <span className={`official-stamp ${statusClass(game.status)}`}>
                        <span className="official-stamp-dot" />
                        <span className="official-stamp-text">
                          {game.status === 'Cleared' ? 'COMMISSION CLEARED' : game.status.toUpperCase()}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {hasMilestones && (
                <section className="journey-section">
                  <div className="journey-section-header">
                    <span className="journey-section-tag">T-LOG</span>
                    <h3>COMMISSION TIMELINE</h3>
                  </div>
                  <div className="milestone-strip">
                    {/* Departure / Start */}
                    <div className="milestone-cell milestone-start">
                      <div className="milestone-meta-row">
                        <div className="milestone-icon-pill">
                          <Calendar size={13} className="text-[#FFDE00]" />
                        </div>
                        <span className="milestone-label">DEPARTURE DATE</span>
                      </div>
                      <strong className="milestone-date">{formatDate(game.started_on, '—')}</strong>
                      <div className="milestone-status-sub">
                        <span className="milestone-sub-dot" />
                        <span>Mission Deployed</span>
                      </div>
                    </div>

                    {/* Telemetry Flow Connector */}
                    <div className="milestone-divider">
                      <div className="milestone-connector-line" />
                      <div className="milestone-arrow-badge">
                        <ArrowRight size={14} className="text-[#FFDE00]" />
                      </div>
                      <div className="milestone-connector-line" />
                    </div>

                    {/* Conquered / Finish */}
                    <div className="milestone-cell milestone-end">
                      <div className="milestone-meta-row">
                        <div className="milestone-icon-pill">
                          <Flag size={13} className="text-[#FFDE00]" />
                        </div>
                        <span className="milestone-label">CONQUERED DATE</span>
                      </div>
                      <strong className="milestone-date">{formatDate(game.finished_on, '—')}</strong>
                      <div className="milestone-status-sub">
                        <span className={`milestone-sub-dot ${game.status === 'Cleared' ? 'dot-cleared' : ''}`} />
                        <span>{game.status === 'Cleared' ? 'Campaign Cleared' : 'Active Campaign'}</span>
                      </div>
                    </div>

                    {/* Tactical Duration Telemetry Card */}
                    <div className="duration-card">
                      <div className="duration-card-head">
                        <div className="duration-head-left">
                          <div className="milestone-icon-pill">
                            <Clock size={12} className="text-[#FFDE00]" />
                          </div>
                          <span className="duration-card-label">TOTAL DURATION</span>
                        </div>
                        <span className={`duration-badge ${game.status === 'Cleared' ? 'badge-cleared' : 'badge-active'}`}>
                          {game.status === 'Cleared' ? 'RECORDED' : 'LIVE'}
                        </span>
                      </div>
                      <div className="duration-card-body">
                        <span className="duration-card-val">
                          {game.duration_days !== null && game.duration_days !== undefined ? game.duration_days : '—'}
                        </span>
                        <span className="duration-card-unit">
                          {game.duration_days === 1 ? 'DAY' : 'DAYS'}
                        </span>
                      </div>
                      <div className="duration-card-footer">
                        <span className={`milestone-sub-dot ${game.status === 'Cleared' ? 'dot-cleared' : 'dot-active'}`} />
                        <span>{game.status === 'Cleared' ? 'Completed Campaign' : 'Expedition Ongoing'}</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {visibleProofs.length > 0 && (
                <section className="journey-section proofs-section">
                  <h3>SURVEILLANCE SNAPSHOTS ({visibleProofs.length} FEEDS)</h3>
                  <div className="proof-row">
                    {visibleProofs.map((image, index) => (
                      <div
                        className={`zzz-cinema-card proof-${index}`}
                        key={`${image}-${index}`}
                        onClick={() => onOpenProof?.(image, `${game.title} - Snapshot 0${index + 1}`)}
                        title="Click to expand snapshot"
                      >
                        {/* Left Stub Track */}
                        <div className="zzz-ticket-left">
                          <span className="zzz-ticket-vert-text">SNAPSHOT</span>
                          <span className="zzz-ticket-logo">REC</span>
                        </div>

                        {/* Center Photo Window (No text below) */}
                        <div className="zzz-ticket-media">
                          <img src={image} alt={`Snapshot ${index + 1}`} />
                        </div>

                        {/* Right Ticket Stub */}
                        <div className="zzz-ticket-right">
                          <div className="zzz-ticket-badge">
                            <Film size={13} strokeWidth={2.2} />
                          </div>
                          <div className="zzz-ticket-number">
                            <span>№</span>
                            <strong>0{index + 1}</strong>
                          </div>
                          <div className="zzz-ticket-barcode-wrap">
                            <div className="zzz-ticket-barcode" />
                            <span className="zzz-ticket-eridu">VERIFIED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {game.notes && (
                <section className="memo-section">
                  <div className="memo-header">
                    <div className="memo-tag-pill">
                      <FileText size={12} className="text-[#FF7A00]" />
                      <span>OP-LOG</span>
                    </div>
                    <h3 className="memo-title">TACTICAL OPERATOR LOG</h3>
                  </div>
                  <div className="memo-body">
                    <Quote size={18} className="memo-quote-icon" />
                    <p className="memo-text break-words whitespace-pre-wrap">{game.notes}</p>
                  </div>
                  <div className="memo-footer">
                    <span className="memo-footer-dot" />
                    <span className="memo-footer-label">FIELD ARCHIVE // ENCRYPTED ENTRY</span>
                  </div>
                </section>
              )}
            </div>
          </main>
        ) : (
          <main className="journal-sheet journal-empty-sheet">Select a quest entry to open its journal page.</main>
        )}
      </div>

      {deleteTarget && (
        <div
          className={`journal-confirm-backdrop ${isDeleteClosing ? 'tv-closing-backdrop' : ''}`}
          onClick={handleCancelDelete}
        >
          <div
            className={`zzz-modal-window ${isDeleteClosing ? 'tv-closing' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="zzz-modal-header">
              <div className="zzz-modal-header-copy">
                <h2 className="zzz-modal-title">{deleteTarget.title}</h2>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {deleteTarget.cover_image_url ? (
                  <div className="zzz-modal-graphic">
                    <img src={deleteTarget.cover_image_url} alt={deleteTarget.title} />
                    <span className="zzz-modal-graphic-badge">!</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="zzz-modal-close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="zzz-modal-body">
              <div className="zzz-action-list">
                <button
                  type="button"
                  className="zzz-action-row zzz-action-danger"
                  onClick={handleConfirmDelete}
                >
                  <span className="zzz-action-left">
                    <span className="zzz-action-tag">[ PURGE ]</span>
                    <span className="zzz-action-label">Confirm Deletion & Erase Record</span>
                  </span>
                  <span className="zzz-action-arrow">›</span>
                </button>

                <button
                  type="button"
                  className="zzz-action-row"
                  onClick={handleCancelDelete}
                >
                  <span className="zzz-action-left">
                    <span className="zzz-action-tag">[ ABORT ]</span>
                    <span className="zzz-action-label">Cancel & Return to Commission</span>
                  </span>
                  <span className="zzz-action-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
