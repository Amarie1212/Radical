import React, { useEffect, useState } from 'react';
import { getSupabaseConfig, saveSupabaseConfig, updateUserPassword } from '../lib/supabase';
import { AppLanguage, AppThemeMode } from '../lib/types';
import { CheckCircle2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  user?: User | null;
  currentTheme?: AppThemeMode;
  currentLanguage?: AppLanguage;
  onPreferencesSaved?: (theme: AppThemeMode, language: AppLanguage) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  user,
  currentTheme = 'light',
  currentLanguage = 'id',
  onPreferencesSaved,
}) => {
  const currentConfig = getSupabaseConfig();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 190);
  };

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setStatus('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatus('Password confirmation does not match.');
        return;
      }
      try {
        await updateUserPassword(newPassword);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Failed to change password.');
        return;
      }
    }

    if (currentConfig.url && currentConfig.anonKey) {
      saveSupabaseConfig(currentConfig.url, currentConfig.anonKey);
    }

    onPreferencesSaved?.(currentTheme, currentLanguage);
    setStatus('Preferences saved successfully.');
    setTimeout(() => {
      onSaved();
      onClose();
    }, 800);
  };

  return (
    <div
      className={`notebook-entry-overlay fixed inset-0 flex items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto ${isClosing ? 'tv-closing-backdrop' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`zzz-modal-window w-full max-w-[560px] my-auto ${isClosing ? 'tv-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zzz-modal-header">
          <div className="zzz-modal-header-copy">
            <h2 className="zzz-modal-title">Settings & Preferences</h2>
          </div>
          <button
            onClick={handleClose}
            className="zzz-modal-close"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="zzz-modal-body">
          {status && (
            <div className="bg-emerald-950/60 border border-emerald-500 text-emerald-100 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{status}</span>
            </div>
          )}

          <form id="config-form" onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              {user && (
                <>
                  <div>
                    <label className="zzz-form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="zzz-form-input"
                    />
                  </div>
                  <div>
                    <label className="zzz-form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="zzz-form-input"
                    />
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        <div className="zzz-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="zzz-action-row"
          >
            <span className="zzz-action-left">
              <span className="zzz-action-tag">[ ABORT ]</span>
              <span className="zzz-action-label">Cancel</span>
            </span>
            <span className="zzz-action-arrow">✕</span>
          </button>
          <button
            type="submit"
            form="config-form"
            className="zzz-action-row zzz-action-primary"
          >
            <span className="zzz-action-left">
              <span className="zzz-action-tag">[ COMMIT ]</span>
              <span className="zzz-action-label">Save</span>
            </span>
            <span className="zzz-action-arrow">✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
