import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthorFingerprint } from '../lib/gemini';
import { Language } from '../lib/i18n';

export interface Preset {
  id: string;
  name: string;
  intensity: number;
  fingerprintId: string | null;
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  presets: Preset[];
  addPreset: (preset: Preset) => void;
  removePreset: (id: string) => void;
  loadPreset: (id: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
  fingerprints: AuthorFingerprint[];
  activeFingerprintId: string | null;
  autoChaos: boolean;
  setAutoChaos: (val: boolean) => void;
  selectedPreset: string | null;
  setSelectedPreset: (val: string | null) => void;
  inputText: string;
  outputText: string;
  isProcessing: boolean;
  activeMutations: string[];
  addFingerprint: (fp: AuthorFingerprint) => void;
  setActiveFingerprintId: (id: string | null) => void;
  setInputText: (val: string) => void;
  setOutputText: (val: string) => void;
  setIsProcessing: (val: boolean) => void;
  setActiveMutations: (val: string[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [fingerprints, setFingerprints] = useState<AuthorFingerprint[]>([]);
  const [activeFingerprintId, setActiveFingerprintId] = useState<string | null>(null);
  const [autoChaos, setAutoChaos] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeMutations, setActiveMutations] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const storedFp = localStorage.getItem('ghost_fingerprints');
    if (storedFp) {
      try {
        const parsed = JSON.parse(storedFp);
        setFingerprints(parsed);
        if (parsed.length > 0) setActiveFingerprintId(parsed[0].id);
      } catch (e) {}
    }
    
    const storedLang = localStorage.getItem('ghost_language');
    if (storedLang === 'en' || storedLang === 'zh') setLanguage(storedLang);
    
    const storedPresets = localStorage.getItem('ghost_presets');
    if (storedPresets) {
      try {
        setPresets(JSON.parse(storedPresets));
      } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ghost_fingerprints', JSON.stringify(fingerprints));
  }, [fingerprints]);
  
  useEffect(() => {
    localStorage.setItem('ghost_language', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('ghost_presets', JSON.stringify(presets));
  }, [presets]);

  const addFingerprint = (fp: AuthorFingerprint) => {
    setFingerprints(prev => [...prev, fp]);
    setActiveFingerprintId(fp.id);
  };
  
  const addPreset = (preset: Preset) => setPresets(prev => [...prev, preset]);
  const removePreset = (id: string) => setPresets(prev => prev.filter(p => p.id !== id));
  const loadPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      if (preset.fingerprintId && fingerprints.some(f => f.id === preset.fingerprintId)) {
        setActiveFingerprintId(preset.fingerprintId);
      }
      setIsSettingsOpen(false);
    }
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, presets, addPreset, removePreset, loadPreset,
      isSettingsOpen, setIsSettingsOpen,
      fingerprints, activeFingerprintId, autoChaos, selectedPreset, inputText, outputText, isProcessing, activeMutations,
      addFingerprint, setActiveFingerprintId, setAutoChaos, setSelectedPreset, setInputText, setOutputText, setIsProcessing, setActiveMutations
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
