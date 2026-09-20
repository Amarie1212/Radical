import React from 'react';
import { Gamepad2, Plus, Settings, UserRound } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { AppLanguage, TabType } from '../lib/types';

interface NavbarProps {
  language: AppLanguage;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User | null;
  onSignOut: () => void;
  onOpenAddModal: () => void;
  onOpenConfigModal: () => void;
  onOpenProfile: () => void;
  isConfigured: boolean;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  clearedCount?: number;
  totalCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenConfigModal,
  onOpenProfile,
}) => {
  const addTitle = 'Add game';
  return (
    <header className="journal-header">
      <div className="journal-header-title">
        <Gamepad2 size={24} strokeWidth={1.35} />
        <div>
          <h1>RADICAL DREAMER</h1>
        </div>
      </div>

      <div className="journal-header-actions">
        <button className="zzz-circle-btn zzz-circle-yellow" onClick={onOpenAddModal} aria-label={addTitle} title={addTitle}>
          <Plus size={18} strokeWidth={3} />
        </button>
        <button className="zzz-circle-btn" onClick={onOpenConfigModal} aria-label="Open settings" title="Settings">
          <Settings size={17} strokeWidth={2.2} />
        </button>
        <button className="zzz-circle-btn" onClick={onOpenProfile} aria-label="Profile" title="Profile">
          <UserRound size={17} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
};
