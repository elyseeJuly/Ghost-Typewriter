import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { ControlPanel } from './components/FingerprintPanel';
import { InputPanel } from './components/InputPanel';
import { DetoxEditor } from './components/DetoxEditor';
import { SettingsModal } from './components/SettingsModal';
import { ApiVaultModal } from './components/ApiVaultModal';
import { Settings, Key } from 'lucide-react';
import { t } from './lib/i18n';

function AppContent() {
  const {
    language, setLanguage,
    setIsSettingsOpen, isSettingsOpen,
    isGlobalProcessing, globalProgress,
    setIsApiVaultOpen, setIsApiVaultCancelable,
  } = useAppContext();
  const lang = t[language];

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-main)] overflow-hidden font-mono">

      {/* ── Global Zebra Progress Bar ── */}
      {isGlobalProcessing && (
        <div className="fixed top-0 left-0 h-1 z-[100] transition-all duration-300" style={{ width: `${globalProgress}%` }}>
          <div className="w-full h-full progress-zebra" />
          <div className="absolute right-0 top-0 w-4 h-full bg-[var(--color-neon-green)] shadow-[0_0_12px_var(--color-neon-green)]" />
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-12 border-b border-[var(--color-border)] flex items-center px-5 bg-[var(--color-panel)] shrink-0 gap-4">
        {/* Title with Glitch */}
        <h1
          className="glitch text-base font-bold tracking-[0.3em] uppercase neon-text"
          data-text={lang.title}
        >
          {lang.title}
        </h1>
        <span className="text-[var(--color-border-bright)] text-xs">|</span>
        <span className="text-[10px] text-[var(--color-text-muted)] tracking-[0.15em] uppercase hidden sm:block">
          {lang.subtitle}
        </span>

        {/* Right Controls */}
        <div className="ml-auto flex items-center gap-1">
          {/* Lang Toggle */}
          <button
            id="lang-toggle"
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="px-2.5 py-1 text-[10px] font-bold border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-neon-green)] hover:text-[var(--color-neon-green)] transition-colors"
          >
            {language === 'zh' ? 'EN' : '中'}
          </button>

          <button
            id="api-vault-btn"
            onClick={() => { setIsApiVaultCancelable(true); setIsApiVaultOpen(true); }}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-neon-green)] transition-colors"
            title="API Vault"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            id="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-neon-green)] transition-colors"
            title={lang.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main 3-Column Layout ── */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Control Panel (fixed width) */}
        <div className="w-64 shrink-0 overflow-hidden">
          <ControlPanel />
        </div>

        {/* Center: Draft Input (Stage 1) */}
        <div className="flex-1 min-w-[280px] overflow-hidden">
          <InputPanel />
        </div>

        {/* Right: Detox Editor (Stage 2) */}
        <div className="flex-1 min-w-[320px] overflow-hidden">
          <DetoxEditor />
        </div>
      </main>

      {/* ── Modals ── */}
      {isSettingsOpen && <SettingsModal />}
      <ApiVaultModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
