import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { FingerprintPanel } from './components/FingerprintPanel';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { Chatbot } from './components/Chatbot';
import { SettingsModal } from './components/SettingsModal';
import { Settings } from 'lucide-react';
import { t } from './lib/i18n';

function AppContent() {
  const { language, setIsSettingsOpen, isSettingsOpen } = useAppContext();
  const lang = t[language];

  return (
    <div className="h-screen w-screen flex flex-col bg-bg text-text-main overflow-hidden font-mono">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-6 bg-panel shrink-0">
        <h1 className="text-xl font-bold tracking-widest uppercase text-neon-green">
          {lang.title} <span className="text-xs text-text-muted ml-2">v2.0</span>
        </h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs text-text-muted uppercase tracking-wider hidden md:block">
            {lang.subtitle}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-text-muted hover:text-neon-green transition-colors"
            title={lang.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: The Lab */}
        <div className="w-80 shrink-0">
          <FingerprintPanel />
        </div>

        {/* Middle Panel: The Input */}
        <div className="flex-1 min-w-[300px]">
          <InputPanel />
        </div>

        {/* Right Panel: The Output */}
        <div className="flex-1 min-w-[300px]">
          <OutputPanel />
        </div>
      </main>

      <Chatbot />
      {isSettingsOpen && <SettingsModal />}
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
