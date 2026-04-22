/**
 * InputPanel.tsx — 草稿输入区 (v9.0 GAN Edition)
 * 
 * 新增：⚔️ GAN 对抗生成模式
 * - 5路并行风格生成 + 判别器打分
 * - 变体卡片选择 + Discriminator Panel 内嵌
 */
import React, { useRef, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { rewriteText, runBabelProtocol, runExtremeScramble, runAdversarialCluster, BabelStepCallback, ADVERSARIAL_PROMPT_STYLES, GenerationVariant } from '../lib/gemini';
import { runAllInjections } from '../lib/injectors';
import { getRandomMutations } from '../lib/mutations';
import { DiscriminatorPanel } from './DiscriminatorPanel';
import { Loader2, Play, Swords, Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

// ── Variant card ───────────────────────────────────────────
function VariantCard({
  variant,
  isSelected,
  onSelect,
  onPipe,
}: {
  variant: GenerationVariant;
  isSelected: boolean;
  onSelect: () => void;
  onPipe: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const style = ADVERSARIAL_PROMPT_STYLES[variant.idx];

  if (variant.status === 'running') {
    return (
      <div className="p-2.5 border border-[var(--color-border)] rounded-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">{style?.icon ?? '◆'}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">{variant.promptStyle}</span>
          <Loader2 className="w-3 h-3 animate-spin text-[var(--color-accent-cyan)] ml-auto" />
        </div>
      </div>
    );
  }

  if (variant.status === 'error') {
    return (
      <div className="p-2.5 border border-[var(--color-border)] rounded-sm opacity-50 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{style?.icon ?? '◆'}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">{variant.promptStyle}</span>
          <span className="text-[9px] text-[var(--color-red-xray)] ml-auto">ERR</span>
        </div>
        {variant.error && (
          <span className="text-[9px] text-[var(--color-red-xray)] mt-1 font-mono break-all line-clamp-2">
            {variant.error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border rounded-sm transition-all duration-200 ${
        isSelected
          ? 'border-[var(--color-neon-green)] bg-[var(--color-neon-dim)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-bright)]'
      }`}
    >
      <div
        className="p-2.5 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center gap-2">
          <span className="text-base shrink-0">{style?.icon ?? '◆'}</span>
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] font-bold ${isSelected ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-text-muted)]'}`}>
              {variant.promptStyle}
            </span>
            <span className="text-[9px] text-[var(--color-text-dim)] ml-2">{variant.promptStyleEn}</span>
          </div>
          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-neon-green)] shrink-0" />}
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-2.5 pb-2.5 border-t border-[var(--color-border)]">
          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed mt-2 max-h-20 overflow-y-auto whitespace-pre-wrap font-mono">
            {variant.text.slice(0, 300)}{variant.text.length > 300 ? '…' : ''}
          </p>
          <button
            onClick={onPipe}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[rgba(0,212,255,0.08)] transition-all"
          >
            <ArrowRight className="w-3 h-3" /> Pipe to Detox
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
export function InputPanel() {
  const {
    language,
    inputText, setInputText,
    mutationIntensity,
    isBabelActive, isTypoActive, isPunctuationActive, isScrambleActive, autoChaos,
    setMutatedText,
    isProcessing, setIsProcessing,
    babelStepLabel, setBabelStepLabel,
    setActiveMutations,
    startProgress, stopProgress, setGlobalProgress,
    apiKey, apiBaseUrl, setIsApiVaultOpen, setIsApiVaultCancelable,
    // GAN
    isGanMode, setIsGanMode,
    isClusterRunning, setIsClusterRunning,
    generationVariants, setGenerationVariants,
    selectedVariantIdx, setSelectedVariantIdx,
    setDetoxText,
    setDiscriminatorResults, setWinnerIdx,
  } = useAppContext();

  const lang = t[language];
  const abortRef = useRef(false);

  // ── Traditional single-path mutation ──────────────────────
  const handleExecute = async () => {
    if (!inputText.trim()) return;

    if (!apiKey && (isBabelActive || isScrambleActive || autoChaos)) {
      setIsApiVaultCancelable(true);
      setIsApiVaultOpen(true);
      return;
    }

    setIsProcessing(true);
    setBabelStepLabel('');
    setMutatedText('');
    abortRef.current = false;
    startProgress();

    try {
      let result = inputText;
      let mutations: string[] = [];

      if (autoChaos) {
        mutations = getRandomMutations(language);
        setActiveMutations(mutations);
        result = await rewriteText(result, null, mutations, language, apiKey, apiBaseUrl);
      } else {
        let activeLabels: string[] = [];

        if (isBabelActive && !abortRef.current) {
          activeLabels.push('[巴别塔协议] ZH→DE→JA→ZH 链式转译');
          const onStep: BabelStepCallback = (step, total, label) => {
            setBabelStepLabel(`[${step}/${total}] ${label}`);
            setGlobalProgress(10 + (step / total) * 50);
          };
          result = await runBabelProtocol(result, apiKey, apiBaseUrl, onStep);
          setBabelStepLabel('');
        }

        if (isScrambleActive && !abortRef.current) {
          activeLabels.push('[极端意识流] 碎片化重构');
          setBabelStepLabel('→ 意识流碎片化重构中...');
          result = await runExtremeScramble(result, apiKey, apiBaseUrl);
          setBabelStepLabel('');
        }

        if ((isTypoActive || isPunctuationActive) && !abortRef.current) {
          if (isTypoActive) activeLabels.push('[错别字注射] 物理指纹注入');
          if (isPunctuationActive) activeLabels.push('[标点暴走] 概率扰动');
          result = runAllInjections(result, {
            typo: isTypoActive,
            punctuation: isPunctuationActive,
            stream: false,
            intensity: mutationIntensity,
            lang: language,
          });
        }

        setActiveMutations(activeLabels);
      }

      stopProgress();
      setMutatedText(result);
    } catch (e: any) {
      stopProgress();
      setBabelStepLabel('');
      if (e.message === 'Invalid API Key') {
        setIsApiVaultCancelable(true);
        setIsApiVaultOpen(true);
      } else {
        setMutatedText(`[ERROR] ${e.message}`);
      }
    } finally {
      setIsProcessing(false);
      setBabelStepLabel('');
    }
  };

  // ── GAN Adversarial Cluster ────────────────────────────────
  const handleRunCluster = async () => {
    if (!inputText.trim() || isClusterRunning) return;

    if (!apiKey) {
      setIsApiVaultCancelable(true);
      setIsApiVaultOpen(true);
      return;
    }

    setIsClusterRunning(true);
    setDiscriminatorResults([]);
    setWinnerIdx(null);
    setSelectedVariantIdx(null);

    // Initialize all 5 as pending
    const initial: GenerationVariant[] = ADVERSARIAL_PROMPT_STYLES.map((s, i) => ({
      idx: i,
      promptStyle: s.label,
      promptStyleEn: s.labelEn,
      text: '',
      status: 'pending',
    }));
    setGenerationVariants(initial);
    startProgress();

    try {
      const results = await runAdversarialCluster(
        inputText,
        apiKey,
        apiBaseUrl,
        (idx, style, status) => {
          setGenerationVariants(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], status };
            return next;
          });
        }
      );
      setGenerationVariants(results);
    } catch (e: any) {
      if (e.message === 'Invalid API Key') {
        setIsApiVaultCancelable(true);
        setIsApiVaultOpen(true);
      }
    } finally {
      setIsClusterRunning(false);
      stopProgress();
    }
  };

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIdx(idx);
  };

  const handlePipeVariant = (idx: number) => {
    const variant = generationVariants[idx];
    if (variant?.text) {
      setDetoxText(variant.text);
    }
  };

  const needsApi = autoChaos || isBabelActive || isScrambleActive;
  const canExecute = !isProcessing && !isClusterRunning && inputText.trim().length > 0;
  const doneVariants = generationVariants.filter(v => v.status === 'done' || v.status === 'error' || v.status === 'running');

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)] border-r border-[var(--color-border)] relative overflow-hidden">
      {(isProcessing || isClusterRunning) && <div className="animate-scan" />}

      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--color-text-muted)]">{lang.theInput}</h2>
          {(isProcessing || isClusterRunning) && babelStepLabel && (
            <p className="text-[10px] text-[var(--color-accent-cyan)] mt-0.5 font-mono truncate">{babelStepLabel}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* GAN Mode Toggle */}
          <button
            id="gan-mode-toggle"
            onClick={() => setIsGanMode(!isGanMode)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold border transition-all
              ${isGanMode
                ? 'border-[var(--color-accent-orange)] text-[var(--color-accent-orange)] bg-[rgba(255,107,43,0.08)]'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)]'
              }
            `}
          >
            <Swords className="w-3 h-3" />
            <span className="hidden sm:inline">GAN</span>
          </button>

          {/* Primary action */}
          {isGanMode ? (
            <button
              id="run-cluster-btn"
              onClick={handleRunCluster}
              disabled={!canExecute}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest uppercase border transition-all duration-200
                ${canExecute
                  ? 'bg-[var(--color-accent-orange)] text-black border-[var(--color-accent-orange)] hover:shadow-[0_0_20px_rgba(255,107,43,0.5)] active:scale-95'
                  : 'bg-transparent text-[var(--color-text-dim)] border-[var(--color-border)] cursor-not-allowed'
                }
              `}
            >
              {isClusterRunning
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {lang.clusterRunning}</>
                : <><Swords className="w-3.5 h-3.5" /> {lang.runCluster}</>
              }
            </button>
          ) : (
            <button
              id="execute-mutation-btn"
              onClick={handleExecute}
              disabled={!canExecute}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold tracking-widest uppercase border transition-all duration-200
                ${canExecute
                  ? 'bg-[var(--color-neon-green)] text-black border-[var(--color-neon-green)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] active:scale-95'
                  : 'bg-transparent text-[var(--color-text-dim)] border-[var(--color-border)] cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isProcessing ? lang.processing : lang.executeMutation}
            </button>
          )}
        </div>
      </div>

      {/* GAN Mode Badge */}
      {isGanMode && (
        <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[rgba(255,107,43,0.05)] shrink-0">
          <p className="text-[9px] text-[var(--color-accent-orange)] uppercase tracking-wider">{lang.ganModeDesc}</p>
        </div>
      )}

      {/* Textarea (always visible) */}
      <textarea
        id="draft-input"
        className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-[var(--color-text-main)] focus:outline-none resize-none placeholder:text-[var(--color-text-dim)] leading-relaxed min-h-[140px]"
        placeholder={lang.inputPlaceholder}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        spellCheck={false}
        style={{ maxHeight: isGanMode && doneVariants.length > 0 ? '180px' : undefined }}
      />

      {/* GAN Variant Cards (scrollable) */}
      {isGanMode && doneVariants.length > 0 && (
        <div className="border-t border-[var(--color-border)] flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-dim)]">
                {lang.clusterDone} — {doneVariants.filter(v => v.status === 'done').length}/5
              </span>
              {selectedVariantIdx !== null && (
                <button
                  id="pipe-selected-variant-btn"
                  onClick={() => handlePipeVariant(selectedVariantIdx)}
                  className="ml-auto flex items-center gap-1 text-[9px] font-bold px-2 py-1 border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[rgba(0,212,255,0.08)] transition-all"
                >
                  <ArrowRight className="w-3 h-3" /> {lang.selectVariant}
                </button>
              )}
            </div>

            {generationVariants.map((variant, i) => {
              const vi = i;
              return (
                <div key={vi}>
                  <VariantCard
                    variant={variant}
                    isSelected={selectedVariantIdx === vi}
                    onSelect={() => handleSelectVariant(vi)}
                    onPipe={() => handlePipeVariant(vi)}
                  />
                </div>
              );
            })}

            {/* Discriminator Panel */}
            <DiscriminatorPanel />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 shrink-0">
        <span className="text-[10px] text-[var(--color-text-dim)]">
          {inputText.length} chars · {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
        </span>
        {!apiKey && needsApi && !isGanMode && (
          <span className="text-[10px] text-[var(--color-accent-orange)]">⚠ API key required</span>
        )}
        {isGanMode && !apiKey && (
          <span className="text-[10px] text-[var(--color-accent-orange)]">⚠ API key required for GAN cluster</span>
        )}
      </div>
    </div>
  );
}
