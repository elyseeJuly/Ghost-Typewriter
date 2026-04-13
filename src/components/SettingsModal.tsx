import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { X, Save, Trash2, Shuffle, Download } from 'lucide-react';

export function SettingsModal() {
  const { 
    language, setLanguage, 
    presets, addPreset, removePreset, loadPreset,
    setIsSettingsOpen,
    fingerprints, activeFingerprintId, setActiveFingerprintId
  } = useAppContext();
  
  const [newPresetName, setNewPresetName] = useState('');
  const lang = t[language];

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    addPreset({
      id: crypto.randomUUID(),
      name: newPresetName,
      intensity: 50, // Legacy support
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-panel border border-border w-[400px] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg">
          <h2 className="text-neon-green font-bold tracking-widest uppercase">{lang.settings}</h2>
          <button onClick={() => setIsSettingsOpen(false)} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Language */}
          <div>
            <h3 className="text-sm text-text-muted uppercase mb-3">{lang.language}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 border ${language === 'en' ? 'border-neon-green text-neon-green bg-neon-dim' : 'border-border text-text-muted hover:border-text-main'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`flex-1 py-2 border ${language === 'zh' ? 'border-neon-green text-neon-green bg-neon-dim' : 'border-border text-text-muted hover:border-text-main'}`}
              >
                中文
              </button>
            </div>
          </div>

          {/* Randomize */}
          <div>
            <button 
              onClick={handleRandomize}
              className="w-full flex items-center justify-center gap-2 py-2 border border-neon-green text-neon-green hover:bg-neon-dim transition-colors"
            >
              <Shuffle className="w-4 h-4" /> {lang.randomize}
            </button>
          </div>

          {/* Presets */}
          <div>
            <h3 className="text-sm text-text-muted uppercase mb-3">{lang.presets}</h3>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder={lang.presetName}
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                className="flex-1 bg-bg border border-border p-2 text-sm focus:outline-none focus:border-neon-green"
              />
              <button 
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className="px-3 bg-border text-white hover:bg-text-muted disabled:opacity-50 flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> {lang.save}
              </button>
            </div>

            <div className="space-y-2">
              {presets.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 border border-border bg-bg">
                  <span className="text-sm truncate flex-1">{p.name}</span>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => loadPreset(p.id)} className="text-text-muted hover:text-neon-green" title={lang.load}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => removePreset(p.id)} className="text-text-muted hover:text-red-500" title={lang.delete}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {presets.length === 0 && (
                <p className="text-xs text-text-muted italic">{lang.noPresets}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
