/**
 * ApiVaultModal.tsx — API 金库 (v9.0 GAN Edition)
 * 
 * 新增 GPTZero API Key 可选字段
 */
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { Key, Eye, EyeOff, Lock, BarChart2 } from 'lucide-react';

export function ApiVaultModal() {
  const {
    language,
    isApiVaultOpen, setIsApiVaultOpen,
    isApiVaultCancelable,
    apiKey, setApiKey,
    apiBaseUrl, setApiBaseUrl,
    gptzeroKey, setGptzeroKey,
  } = useAppContext();
  const lang = t[language];

  const [draft, setDraft] = useState(apiKey);
  const [baseDraft, setBaseDraft] = useState(apiBaseUrl);
  const [gptzDraft, setGptzDraft] = useState(gptzeroKey);
  const [showKey, setShowKey] = useState(false);
  const [showGtz, setShowGtz] = useState(false);

  if (!isApiVaultOpen) return null;

  const handleSave = () => {
    if (!draft.trim()) return;
    setApiKey(draft.trim());
    setApiBaseUrl(baseDraft.trim());
    if (gptzDraft.trim()) setGptzeroKey(gptzDraft.trim());
    setIsApiVaultOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
          <Lock className="w-4 h-4 text-[var(--color-neon-green)]" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[var(--color-text-main)] tracking-wider">{lang.apiVaultTitle}</h2>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{lang.apiVaultDesc}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-3.5 h-3.5 text-[var(--color-neon-green)]" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Gemini API Key
              </label>
              <span className="ml-auto text-[9px] bg-[rgba(0,255,65,0.1)] text-[var(--color-neon-green)] px-1.5 py-0.5 rounded">REQUIRED</span>
            </div>
            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={lang.apiKeyPlaceholder}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-mono px-3 py-2.5 pr-10 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors placeholder:text-[var(--color-text-dim)]"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Gemini Base URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                API Base URL (Proxy)
              </label>
              <span className="ml-auto text-[9px] bg-[var(--color-border)] text-[var(--color-text-dim)] px-1.5 py-0.5 rounded">OPTIONAL</span>
            </div>
            <p className="text-[9px] text-[var(--color-text-dim)] mb-2">如果您处于无法访问Google API的地区，请在此填入反向代理地址 (例如: https://api.proxy.com)</p>
            <div className="relative">
              <input
                id="gemini-base-url-input"
                type="text"
                value={baseDraft}
                onChange={e => setBaseDraft(e.target.value)}
                placeholder="https://generativelanguage.googleapis.com"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-mono px-3 py-2.5 focus:outline-none focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-dim)]"
              />
            </div>
          </div>

          {/* GPTZero API Key */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                {lang.gptzeroKeyLabel}
              </label>
              <span className="ml-auto text-[9px] bg-[var(--color-border)] text-[var(--color-text-dim)] px-1.5 py-0.5 rounded">OPTIONAL</span>
            </div>
            <p className="text-[9px] text-[var(--color-text-dim)] mb-2">{lang.gptzeroKeyDesc}</p>
            <div className="relative">
              <input
                id="gptzero-api-key-input"
                type={showGtz ? 'text' : 'password'}
                value={gptzDraft}
                onChange={e => setGptzDraft(e.target.value)}
                placeholder={lang.gptzeroKeyPlaceholder}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-mono px-3 py-2.5 pr-10 focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors placeholder:text-[var(--color-text-dim)]"
              />
              <button
                onClick={() => setShowGtz(!showGtz)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {showGtz ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isApiVaultCancelable && (
              <button
                id="api-vault-cancel-btn"
                onClick={() => setIsApiVaultOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-bright)] transition-colors"
              >
                {lang.apiVaultCancel}
              </button>
            )}
            <button
              id="api-vault-save-btn"
              onClick={handleSave}
              disabled={!draft.trim()}
              className={`
                flex-1 py-2.5 text-xs font-bold border tracking-widest uppercase transition-all
                ${draft.trim()
                  ? 'bg-[var(--color-neon-green)] text-black border-[var(--color-neon-green)] hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]'
                  : 'bg-transparent text-[var(--color-text-dim)] border-[var(--color-border)] cursor-not-allowed'
                }
              `}
            >
              {lang.apiVaultSave}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
