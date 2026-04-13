import React from 'react';
import { useAppContext } from '../store/AppContext';
import { rewriteText } from '../lib/gemini';
import { getRandomMutations, PROFILE_PRESETS } from '../lib/mutations';
import { Play, Loader2 } from 'lucide-react';
import { t } from '../lib/i18n';

export function InputPanel() {
  const { 
    language,
    inputText, setInputText, 
    setOutputText, 
    isProcessing, setIsProcessing,
    fingerprints, activeFingerprintId,
    autoChaos, selectedPreset,
    setActiveMutations
  } = useAppContext();
  
  const lang = t[language];

  const handleRewrite = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setOutputText(''); // Clear output for typewriter effect
    
    try {
      const fp = fingerprints.find(f => f.id === activeFingerprintId) || null;
      
      let mutations: string[] = [];
      if (autoChaos) {
        mutations = getRandomMutations(language);
      } else if (selectedPreset && PROFILE_PRESETS[selectedPreset as keyof typeof PROFILE_PRESETS]) {
        mutations = PROFILE_PRESETS[selectedPreset as keyof typeof PROFILE_PRESETS][language].mutations;
      }
      
      setActiveMutations(mutations);
      
      const result = await rewriteText(inputText, fp, mutations, language);
      
      // Simulate typewriter effect
      let i = 0;
      const speed = 10; // ms per char
      
      const typeWriter = () => {
        if (i < result.length) {
          setOutputText(prev => prev + result.charAt(i));
          i++;
          setTimeout(typeWriter, speed);
        } else {
          setIsProcessing(false);
        }
      };
      
      typeWriter();
      
    } catch (e) {
      console.error(e);
      alert("Failed to rewrite text.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg p-4 border-r border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-widest uppercase text-text-muted">{lang.theInput}</h2>
        <button 
          onClick={handleRewrite}
          disabled={isProcessing || !inputText.trim() || (!autoChaos && !selectedPreset)}
          className="flex items-center gap-2 bg-neon-green text-bg px-4 py-1.5 font-bold text-sm hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {lang.compile}
        </button>
      </div>
      
      <textarea 
        className="flex-1 w-full bg-panel border border-border p-4 text-sm font-mono focus:outline-none focus:border-neon-green resize-none"
        placeholder={lang.inputPlaceholder}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
      />
    </div>
  );
}
