import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { extractFingerprint } from '../lib/gemini';
import { Fingerprint, Plus, Loader2, Zap, Settings2 } from 'lucide-react';
import { t } from '../lib/i18n';
import { PROFILE_PRESETS } from '../lib/mutations';

export function FingerprintPanel() {
  const { language, fingerprints, activeFingerprintId, setActiveFingerprintId, addFingerprint, autoChaos, setAutoChaos, selectedPreset, setSelectedPreset } = useAppContext();
  const [isExtracting, setIsExtracting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [samples, setSamples] = useState(['', '', '']);
  const [name, setName] = useState('');
  
  const lang = t[language];

  const handleExtract = async () => {
    const validSamples = samples.filter(s => s.trim().length > 50);
    if (validSamples.length === 0 || !name.trim()) {
      alert("Please provide a name and at least one valid sample (>50 chars).");
      return;
    }

    setIsExtracting(true);
    try {
      const fp = await extractFingerprint(validSamples, name, language);
      addFingerprint(fp);
      setShowNewForm(false);
      setSamples(['', '', '']);
      setName('');
    } catch (e) {
      console.error(e);
      alert("Failed to extract fingerprint.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel border-r border-border p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-neon-green">
        <Settings2 className="w-6 h-6" />
        <h2 className="text-lg font-bold tracking-widest uppercase">{lang.theLab}</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-sm text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" /> {lang.mutationEngine}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoChaos} 
              onChange={(e) => setAutoChaos(e.target.checked)}
              className="accent-neon-green w-4 h-4"
            />
            <span className="text-sm font-bold text-neon-green">Auto Chaos (Default)</span>
          </label>
          <p className="text-xs text-text-muted">
            {language === 'zh' ? '纯随机交叉抽取四大突变维度，生成数学意义上独一无二的组合。' : 'Randomly cross-extracts from the 4 mutation dimensions to generate mathematically unique combinations.'}
          </p>

          {!autoChaos && (
            <div className="mt-4 p-3 border border-border bg-bg rounded">
              <h4 className="text-xs text-text-muted uppercase mb-2">{lang.profilePresets}</h4>
              <div className="space-y-2">
                {Object.entries(PROFILE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPreset(key)}
                    className={`w-full text-left p-2 text-sm border transition-colors ${selectedPreset === key ? 'border-neon-green text-neon-green bg-neon-dim' : 'border-border text-text-main hover:border-text-muted'}`}
                  >
                    {preset[language].name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Fingerprint className="w-4 h-4" /> {lang.authorFingerprints} <span className="text-[10px] bg-border px-1 rounded text-text-muted ml-auto">[OPTIONAL]</span>
        </h3>
        
        {fingerprints.length === 0 && !showNewForm && (
          <p className="text-xs text-text-muted italic mb-4">{lang.noFingerprints}</p>
        )}

        <div className="space-y-2 mb-4">
          {fingerprints.map(fp => (
            <div 
              key={fp.id}
              onClick={() => setActiveFingerprintId(activeFingerprintId === fp.id ? null : fp.id)}
              className={`p-3 border rounded cursor-pointer transition-colors ${activeFingerprintId === fp.id ? 'border-neon-green bg-neon-dim text-neon-green' : 'border-border hover:border-text-muted text-text-main'}`}
            >
              <div className="font-bold text-sm">{fp.name}</div>
              <div className="text-xs opacity-70 truncate mt-1">Vocab: {fp.vocabulary.slice(0, 3).join(', ')}...</div>
            </div>
          ))}
        </div>

        {!showNewForm ? (
          <button 
            onClick={() => setShowNewForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-border hover:border-neon-green hover:text-neon-green transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> {lang.newFingerprint}
          </button>
        ) : (
          <div className="border border-border p-3 rounded space-y-3 bg-bg">
            <input 
              type="text" 
              placeholder={lang.fpNamePlaceholder}
              className="w-full bg-panel border border-border p-2 text-sm focus:outline-none focus:border-neon-green"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {samples.map((sample, i) => (
              <textarea 
                key={i}
                placeholder={lang.samplePlaceholder.replace('{n}', String(i + 1))}
                className="w-full h-24 bg-panel border border-border p-2 text-xs focus:outline-none focus:border-neon-green resize-none"
                value={sample}
                onChange={e => {
                  const newSamples = [...samples];
                  newSamples[i] = e.target.value;
                  setSamples(newSamples);
                }}
              />
            ))}
            <div className="flex gap-2">
              <button 
                onClick={handleExtract}
                disabled={isExtracting}
                className="flex-1 bg-neon-green text-bg font-bold py-2 text-sm hover:opacity-80 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : lang.extract}
              </button>
              <button 
                onClick={() => setShowNewForm(false)}
                className="px-3 border border-border hover:bg-border text-sm"
              >
                {lang.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
