import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { X, Save, Trash2, Shuffle, Download } from 'lucide-react';

export function SettingsModal() {
  const { 
    language, setLanguage, 
    presets, addPreset, removePreset, loadPreset,
    setIsSettingsOpen,
    fingerprints, activeFingerprintId, setActiveFingerprintId,
    mutationIntensity,
  } = useAppContext();
  
  const [newPresetName, setNewPresetName] = useState('');
  const lang = t[language];

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    addPreset({
      id: crypto.randomUUID(),
      name: newPresetName,
      intensity: mutationIntensity,
      fingerprintId: activeFingerprintId
    });
    setNewPresetName('');
  };

  const handleRandomize = () => {
    if (fingerprints.length > 0) {
      const randomFp = fingerprints[Math.floor(Math.random() * fingerprints.length)];
      setActiveFingerprintId(randomFp.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] w-[420px] shadow-[0_0_40px_rgba(0,255,65,0.1)] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <h2 className="text-sm font-bold text-[var(--color-neon-green)] tracking-widest uppercase">{lang.settings}</h2>
          <button onClick={() => setIsSettingsOpen(false)} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Language */}
          <div>
            <h3 className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{lang.language}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 text-xs border transition-all ${language === 'en' ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)] bg-[var(--color-neon-dim)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-bright)]'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`flex-1 py-2 text-xs border transition-all ${language === 'zh' ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)] bg-[var(--color-neon-dim)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-bright)]'}`}
              >
                中文
              </button>
            </div>
          </div>

          {/* Randomize */}
          <div>
            <button 
              onClick={handleRandomize}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[var(--color-neon-dim)] transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" /> {lang.randomize}
            </button>
          </div>

          {/* Presets */}
          <div>
            <h3 className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{lang.presets}</h3>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder={lang.presetName}
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
                className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-2 text-sm font-mono focus:outline-none focus:border-[var(--color-neon-green)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)]"
              />
              <button 
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className="px-3 bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-[var(--color-border-bright)] disabled:opacity-40 flex items-center gap-1 text-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> {lang.save}
              </button>
            </div>

            <div className="space-y-2">
              {presets.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <span className="text-xs truncate flex-1 text-[var(--color-text-main)]">{p.name}</span>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => loadPreset(p.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-neon-green)] transition-colors" title={lang.load}>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removePreset(p.id)} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title={lang.delete}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {presets.length === 0 && (
                <p className="text-xs text-[var(--color-text-dim)] italic">{lang.noPresets}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
