import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthorFingerprint, GenerationVariant } from '../lib/gemini';
import { Language } from '../lib/i18n';
import { XRayCounts } from '../lib/xray';
import { DiscriminatorResult } from '../lib/discriminator';
import { HeatmapSegment } from '../lib/vectorScope';
import { EditTrailEntry } from '../lib/temporalForge';

export interface Preset {
  id: string;
  name: string;
  intensity: number;
  fingerprintId: string | null;
}

interface AppState {
  // ── Language ──
  language: Language;
  setLanguage: (lang: Language) => void;

  // ── Presets ──
  presets: Preset[];
  addPreset: (preset: Preset) => void;
  removePreset: (id: string) => void;
  loadPreset: (id: string) => void;

  // ── Modals ──
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
  isApiVaultOpen: boolean;
  setIsApiVaultOpen: (val: boolean) => void;
  isApiVaultCancelable: boolean;
  setIsApiVaultCancelable: (val: boolean) => void;

  // ── API ──
  apiKey: string;
  setApiKey: (key: string) => void;
  gptzeroKey: string;
  setGptzeroKey: (key: string) => void;

  // ── Fingerprints ──
  fingerprints: AuthorFingerprint[];
  addFingerprint: (fp: AuthorFingerprint) => void;
  activeFingerprintId: string | null;
  setActiveFingerprintId: (id: string | null) => void;

  // ── Stage 0: GAN Adversarial Cluster ──
  isGanMode: boolean;
  setIsGanMode: (val: boolean) => void;
  isClusterRunning: boolean;
  setIsClusterRunning: (val: boolean) => void;
  generationVariants: GenerationVariant[];
  setGenerationVariants: (val: GenerationVariant[]) => void;
  selectedVariantIdx: number | null;
  setSelectedVariantIdx: (val: number | null) => void;

  // ── Discriminator ──
  discriminatorResults: DiscriminatorResult[];
  setDiscriminatorResults: (val: DiscriminatorResult[]) => void;
  isDiscriminating: boolean;
  setIsDiscriminating: (val: boolean) => void;
  winnerIdx: number | null;
  setWinnerIdx: (val: number | null) => void;

  // ── Stage 1: Input & Mutation Config ──
  inputText: string;
  setInputText: (val: string) => void;
  mutationIntensity: number;   // 0 - 100
  setMutationIntensity: (val: number) => void;
  isBabelActive: boolean;
  setIsBabelActive: (val: boolean) => void;
  isTypoActive: boolean;
  setIsTypoActive: (val: boolean) => void;
  isPunctuationActive: boolean;
  setIsPunctuationActive: (val: boolean) => void;
  isScrambleActive: boolean;
  setIsScrambleActive: (val: boolean) => void;
  autoChaos: boolean;
  setAutoChaos: (val: boolean) => void;
  selectedPreset: string | null;
  setSelectedPreset: (val: string | null) => void;
  activeMutations: string[];
  setActiveMutations: (val: string[]) => void;

  // ── Stage 1: Output (mutation buffer) ──
  mutatedText: string;
  setMutatedText: (val: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  babelStepLabel: string;
  setBabelStepLabel: (val: string) => void;

  // ── Stage 2: Detox Editor ──
  detoxText: string;
  setDetoxText: (val: string) => void;
  isXrayScanning: boolean;
  setIsXrayScanning: (val: boolean) => void;
  xrayCounts: XRayCounts;
  setXrayCounts: (val: XRayCounts) => void;
  hasXrayRan: boolean;
  setHasXrayRan: (val: boolean) => void;

  // ── Vector Scope ──
  vectorModelState: 'idle' | 'loading' | 'ready' | 'error';
  setVectorModelState: (val: 'idle' | 'loading' | 'ready' | 'error') => void;
  vectorModelProgress: number;
  setVectorModelProgress: (val: number) => void;
  vectorHeatmap: HeatmapSegment[];
  setVectorHeatmap: (val: HeatmapSegment[]) => void;
  isVectorScanning: boolean;
  setIsVectorScanning: (val: boolean) => void;
  vectorAvgSim: number;
  setVectorAvgSim: (val: number) => void;
  vectorVariance: number;
  setVectorVariance: (val: number) => void;
  vectorHotCount: number;
  setVectorHotCount: (val: number) => void;

  // ── Temporal Forge ──
  editTrail: EditTrailEntry[];
  setEditTrail: (val: EditTrailEntry[]) => void;
  isTemporalModalOpen: boolean;
  setIsTemporalModalOpen: (val: boolean) => void;

  // ── Global Progress ──
  globalProgress: number;
  isGlobalProcessing: boolean;
  startProgress: () => void;
  stopProgress: () => void;
  setGlobalProgress: (val: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Language
  const [language, setLanguage] = useState<Language>('zh');
  // Presets
  const [presets, setPresets] = useState<Preset[]>([]);
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApiVaultOpen, setIsApiVaultOpen] = useState(false);
  const [isApiVaultCancelable, setIsApiVaultCancelable] = useState(false);
  // API
  const [apiKey, setApiKey] = useState<string>('');
  const [gptzeroKey, setGptzeroKey] = useState<string>('');
  // Fingerprints
  const [fingerprints, setFingerprints] = useState<AuthorFingerprint[]>([]);
  const [activeFingerprintId, setActiveFingerprintId] = useState<string | null>(null);

  // GAN Adversarial Cluster (Stage 0)
  const [isGanMode, setIsGanMode] = useState(false);
  const [isClusterRunning, setIsClusterRunning] = useState(false);
  const [generationVariants, setGenerationVariants] = useState<GenerationVariant[]>([]);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);

  // Discriminator
  const [discriminatorResults, setDiscriminatorResults] = useState<DiscriminatorResult[]>([]);
  const [isDiscriminating, setIsDiscriminating] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  // Stage 1 config
  const [inputText, setInputText] = useState('');
  const [mutationIntensity, setMutationIntensity] = useState(60);
  const [isBabelActive, setIsBabelActive] = useState(true);
  const [isTypoActive, setIsTypoActive] = useState(true);
  const [isPunctuationActive, setIsPunctuationActive] = useState(true);
  const [isScrambleActive, setIsScrambleActive] = useState(false);
  const [autoChaos, setAutoChaos] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeMutations, setActiveMutations] = useState<string[]>([]);

  // Stage 1 output
  const [mutatedText, setMutatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [babelStepLabel, setBabelStepLabel] = useState('');

  // Stage 2
  const [detoxText, setDetoxText] = useState('');
  const [isXrayScanning, setIsXrayScanning] = useState(false);
  const [xrayCounts, setXrayCounts] = useState<XRayCounts>({ cliches: 0, transitions: 0, structures: 0, total: 0 });
  const [hasXrayRan, setHasXrayRan] = useState(false);

  // Vector Scope
  const [vectorModelState, setVectorModelState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [vectorModelProgress, setVectorModelProgress] = useState(0);
  const [vectorHeatmap, setVectorHeatmap] = useState<HeatmapSegment[]>([]);
  const [isVectorScanning, setIsVectorScanning] = useState(false);
  const [vectorAvgSim, setVectorAvgSim] = useState(0);
  const [vectorVariance, setVectorVariance] = useState(0);
  const [vectorHotCount, setVectorHotCount] = useState(0);

  // Temporal Forge
  const [editTrail, setEditTrail] = useState<EditTrailEntry[]>([]);
  const [isTemporalModalOpen, setIsTemporalModalOpen] = useState(false);

  // Global progress
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    setIsGlobalProcessing(true);
    setGlobalProgress(0);
    let current = 0;
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      current += Math.max(0.5, (88 - current) * 0.08);
      if (current > 88) current = 88;
      setGlobalProgress(current);
    }, 300);
  };

  const stopProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setGlobalProgress(100);
    setTimeout(() => {
      setIsGlobalProcessing(false);
      setGlobalProgress(0);
    }, 400);
  };

  // ── Load from localStorage ──
  useEffect(() => {
    const storedApiKey = localStorage.getItem('ghost_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsApiVaultCancelable(false);
      setIsApiVaultOpen(true);
    }

    const storedGPTZero = localStorage.getItem('ghost_gptzero_key');
    if (storedGPTZero) setGptzeroKey(storedGPTZero);

    const storedFp = localStorage.getItem('ghost_fingerprints');
    if (storedFp) {
      try {
        const parsed = JSON.parse(storedFp);
        setFingerprints(parsed);
        if (parsed.length > 0) setActiveFingerprintId(parsed[0].id);
      } catch (_) {}
    }

    const storedLang = localStorage.getItem('ghost_language');
    if (storedLang === 'en' || storedLang === 'zh') setLanguage(storedLang);

    const storedPresets = localStorage.getItem('ghost_presets');
    if (storedPresets) {
      try { setPresets(JSON.parse(storedPresets)); } catch (_) {}
    }

    const storedIntensity = localStorage.getItem('ghost_intensity');
    if (storedIntensity) setMutationIntensity(Number(storedIntensity));
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => { localStorage.setItem('ghost_fingerprints', JSON.stringify(fingerprints)); }, [fingerprints]);
  useEffect(() => { localStorage.setItem('ghost_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('ghost_presets', JSON.stringify(presets)); }, [presets]);
  useEffect(() => { if (apiKey) localStorage.setItem('ghost_api_key', apiKey); }, [apiKey]);
  useEffect(() => { if (gptzeroKey) localStorage.setItem('ghost_gptzero_key', gptzeroKey); }, [gptzeroKey]);
  useEffect(() => { localStorage.setItem('ghost_intensity', String(mutationIntensity)); }, [mutationIntensity]);

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
      setMutationIntensity(preset.intensity);
      setIsSettingsOpen(false);
    }
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      presets, addPreset, removePreset, loadPreset,
      isSettingsOpen, setIsSettingsOpen,
      isApiVaultOpen, setIsApiVaultOpen,
      isApiVaultCancelable, setIsApiVaultCancelable,
      apiKey, setApiKey,
      gptzeroKey, setGptzeroKey,
      fingerprints, addFingerprint, activeFingerprintId, setActiveFingerprintId,
      isGanMode, setIsGanMode,
      isClusterRunning, setIsClusterRunning,
      generationVariants, setGenerationVariants,
      selectedVariantIdx, setSelectedVariantIdx,
      discriminatorResults, setDiscriminatorResults,
      isDiscriminating, setIsDiscriminating,
      winnerIdx, setWinnerIdx,
      inputText, setInputText,
      mutationIntensity, setMutationIntensity,
      isBabelActive, setIsBabelActive,
      isTypoActive, setIsTypoActive,
      isPunctuationActive, setIsPunctuationActive,
      isScrambleActive, setIsScrambleActive,
      autoChaos, setAutoChaos,
      selectedPreset, setSelectedPreset,
      activeMutations, setActiveMutations,
      mutatedText, setMutatedText,
      isProcessing, setIsProcessing,
      babelStepLabel, setBabelStepLabel,
      detoxText, setDetoxText,
      isXrayScanning, setIsXrayScanning,
      xrayCounts, setXrayCounts,
      hasXrayRan, setHasXrayRan,
      vectorModelState, setVectorModelState,
      vectorModelProgress, setVectorModelProgress,
      vectorHeatmap, setVectorHeatmap,
      isVectorScanning, setIsVectorScanning,
      vectorAvgSim, setVectorAvgSim,
      vectorVariance, setVectorVariance,
      vectorHotCount, setVectorHotCount,
      editTrail, setEditTrail,
      isTemporalModalOpen, setIsTemporalModalOpen,
      globalProgress, isGlobalProcessing,
      startProgress, stopProgress, setGlobalProgress,
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
