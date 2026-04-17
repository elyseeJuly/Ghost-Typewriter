/**
 * FingerprintPanel.tsx — 控制矩阵 (v9.0 GAN Edition)
 * 
 * 新增 Stage 0 区块：对抗生成集群模式开关 + 向量示波器预加载触发器
 */
import React from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { Zap, Shield, Fingerprint, ChevronDown, ChevronUp, Swords, Activity, BarChart2 } from 'lucide-react';
import { PROFILE_PRESETS } from '../lib/mutations';
import { loadVectorModel } from '../lib/vectorScope';
import { useState } from 'react';

// ── Toggle Switch ──────────────────────────────────────────
function Toggle({ on, onToggle, disabled, color }: { on: boolean; onToggle: () => void; disabled?: boolean; color?: string }) {
  return (
    <div
      className={`toggle-track ${on ? 'on' : ''} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      style={on && color ? { background: color } : undefined}
      onClick={disabled ? undefined : onToggle}
    >
      <div className="toggle-thumb" />
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ icon, label, tag }: { icon: React.ReactNode; label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[var(--color-neon-green)]">{icon}</span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-text-muted)]">{label}</span>
      {tag && <span className="ml-auto text-[9px] bg-[var(--color-border)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">{tag}</span>}
    </div>
  );
}

// ── Mutation Row ───────────────────────────────────────────
function MutationRow({
  label, desc, isOn, onToggle, badge, disabled,
}: {
  label: string; desc: string; isOn: boolean; onToggle: () => void; badge?: string; disabled?: boolean;
}) {
  return (
    <div className={`p-2.5 border border-[var(--color-border)] rounded-sm transition-all duration-200 ${isOn && !disabled ? 'border-[var(--color-border-bright)] bg-[rgba(0,255,65,0.04)]' : 'opacity-70'}`}>
      <div className="flex items-center gap-2">
        <Toggle on={isOn && !disabled} onToggle={onToggle} disabled={disabled} />
        <span className={`text-xs font-bold flex-1 ${isOn && !disabled ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}`}>
          {label}
        </span>
        {badge && <span className="text-[9px] text-[var(--color-accent-cyan)] bg-[rgba(0,212,255,0.1)] px-1.5 py-0.5 rounded">{badge}</span>}
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed pl-10">{desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
export function ControlPanel() {
  const {
    language,
    isBabelActive, setIsBabelActive,
    isTypoActive, setIsTypoActive,
    isPunctuationActive, setIsPunctuationActive,
    isScrambleActive, setIsScrambleActive,
    autoChaos, setAutoChaos,
    mutationIntensity, setMutationIntensity,
    fingerprints, activeFingerprintId, setActiveFingerprintId,
    // GAN
    isGanMode, setIsGanMode,
    vectorModelState, gptzeroKey,
  } = useAppContext();

  const lang = t[language];
  const [fpExpanded, setFpExpanded] = useState(false);

  const handlePreloadVector = async () => {
    if (vectorModelState === 'idle' || vectorModelState === 'error') {
      try { await loadVectorModel(); } catch (_) {}
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-panel)] border-r border-[var(--color-border)] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-neon-green)]" />
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--color-neon-green)]">
            {lang.theLab}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">

        {/* ── Stage 0: GAN Adversarial Cluster ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-[var(--color-accent-orange)] flex items-center justify-center text-black text-[10px] font-bold shrink-0">0</div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-accent-orange)]">
              {lang.stage0Label}
            </span>
          </div>

          {/* GAN Mode toggle */}
          <div className={`p-2.5 border rounded-sm mb-2 transition-all ${isGanMode ? 'border-[var(--color-accent-orange)] bg-[rgba(255,107,43,0.06)]' : 'border-[var(--color-border)] opacity-70'}`}>
            <div className="flex items-center gap-2">
              <Toggle on={isGanMode} onToggle={() => setIsGanMode(!isGanMode)} color="var(--color-accent-orange)" />
              <Swords className={`w-3.5 h-3.5 ${isGanMode ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-text-muted)]'}`} />
              <span className={`text-xs font-bold flex-1 ${isGanMode ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-text-muted)]'}`}>
                {lang.ganMode}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 pl-10 leading-relaxed">{lang.ganModeDesc}</p>
          </div>

          {/* Discriminator indicator */}
          <div className="flex items-center gap-2 px-2 py-1.5 border border-[var(--color-border)] rounded-sm">
            <BarChart2 className="w-3 h-3 text-[var(--color-text-dim)]" />
            <span className="text-[9px] text-[var(--color-text-dim)] flex-1">{lang.discriminatorTitle}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
              gptzeroKey
                ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
            }`}>
              {gptzeroKey ? 'GPTZero' : 'HEURISTIC'}
            </span>
          </div>

          {/* Vector model preload */}
          <div className="flex items-center gap-2 px-2 py-1.5 border border-[var(--color-border)] rounded-sm mt-2">
            <Activity className="w-3 h-3 text-[var(--color-text-dim)]" />
            <span className="text-[9px] text-[var(--color-text-dim)] flex-1">{lang.vectorScopeTitle}</span>
            <button
              onClick={handlePreloadVector}
              className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                vectorModelState === 'ready'
                  ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]'
                  : vectorModelState === 'loading'
                  ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)]'
              }`}
            >
              {vectorModelState === 'ready' ? '✓ READY'
               : vectorModelState === 'loading' ? 'LOADING…'
               : vectorModelState === 'error' ? 'HEURISTIC'
               : 'PRELOAD'}
            </button>
          </div>
        </div>

        {/* ── Stage 1 Label ── */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
          <div className="w-5 h-5 rounded-full bg-[var(--color-neon-green)] flex items-center justify-center text-black text-[10px] font-bold shrink-0">1</div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-neon-green)]">
            {lang.stage1Label}
          </span>
        </div>

        {/* ── Mutation Toggles ── */}
        <div>
          <SectionHeader icon={<Zap className="w-3.5 h-3.5" />} label={lang.mutationEngine} />

          {/* Auto Chaos Toggle */}
          <div className={`p-2.5 border rounded-sm mb-3 transition-all ${autoChaos ? 'border-[var(--color-accent-orange)] bg-[rgba(255,107,43,0.06)]' : 'border-[var(--color-border)] opacity-70'}`}>
            <div className="flex items-center gap-2">
              <Toggle on={autoChaos} onToggle={() => setAutoChaos(!autoChaos)} color="var(--color-accent-orange)" />
              <span className={`text-xs font-bold flex-1 ${autoChaos ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-text-muted)]'}`}>
                {lang.autoChaos}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 pl-10 leading-relaxed">{lang.autoChaosDesc}</p>
          </div>

          <div className={`space-y-2 transition-opacity ${autoChaos ? 'opacity-40 pointer-events-none' : ''}`}>
            <MutationRow label={lang.babelProtocol} desc={lang.babelDesc} isOn={isBabelActive} onToggle={() => setIsBabelActive(!isBabelActive)} badge="API" disabled={autoChaos} />
            <MutationRow label={lang.extremeScramble} desc={lang.extremeScrambleDesc} isOn={isScrambleActive} onToggle={() => setIsScrambleActive(!isScrambleActive)} badge="API" disabled={autoChaos} />
            <MutationRow label={lang.typoInjector} desc={lang.typoDesc} isOn={isTypoActive} onToggle={() => setIsTypoActive(!isTypoActive)} badge="LOCAL" disabled={autoChaos} />
            <MutationRow label={lang.punctuationChaos} desc={lang.punctuationDesc} isOn={isPunctuationActive} onToggle={() => setIsPunctuationActive(!isPunctuationActive)} badge="LOCAL" disabled={autoChaos} />
          </div>
        </div>

        {/* ── Intensity Slider ── */}
        <div className={`transition-opacity ${autoChaos ? 'opacity-30' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{lang.mutationIntensity}</span>
            <span className="text-xs font-bold text-[var(--color-neon-green)]">{mutationIntensity}%</span>
          </div>
          <input
            type="range" min={10} max={100} step={5}
            value={mutationIntensity}
            onChange={e => setMutationIntensity(Number(e.target.value))}
            className="w-full"
            disabled={autoChaos}
            style={{ background: `linear-gradient(to right, var(--color-neon-green) ${mutationIntensity}%, var(--color-border) ${mutationIntensity}%)` }}
          />
          <div className="flex justify-between text-[9px] text-[var(--color-text-dim)] mt-1">
            <span>{lang.microDose}</span>
            <span>{lang.hardcore}</span>
          </div>
        </div>

        {/* ── Stage 2 Label ── */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
          <div className="w-5 h-5 rounded-full bg-[var(--color-accent-cyan)] flex items-center justify-center text-black text-[10px] font-bold shrink-0">2</div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--color-accent-cyan)]">
            {lang.stage2Label}
          </span>
        </div>

        {/* X-Ray legend */}
        <div className="p-2.5 border border-[var(--color-border)] rounded-sm">
          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2">X-Ray 图例</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.25)] border border-[#ef4444] shrink-0" />
              <span className="text-[10px] text-[var(--color-text-muted)]">{lang.clichesLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[rgba(59,130,246,0.25)] border border-[#3b82f6] shrink-0" />
              <span className="text-[10px] text-[var(--color-text-muted)]">{lang.transitionsLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[rgba(234,179,8,0.20)] border border-dashed border-[#eab308] shrink-0" />
              <span className="text-[10px] text-[var(--color-text-muted)]">{lang.structuresLabel}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
              <span className="w-3 h-3 rounded-sm bg-[rgba(255,107,43,0.25)] border border-[var(--color-accent-orange)] shrink-0" />
              <span className="text-[10px] text-[var(--color-text-muted)]">{lang.hotZones} (Vector)</span>
            </div>
          </div>
        </div>

        {/* ── Author Fingerprints (collapsible) ── */}
        <div className="border border-[var(--color-border)] rounded-sm overflow-hidden">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--color-border)] transition-colors"
            onClick={() => setFpExpanded(!fpExpanded)}
          >
            <Fingerprint className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] flex-1">{lang.authorFingerprints}</span>
            <span className="text-[9px] text-[var(--color-text-dim)]">[OPTIONAL]</span>
            {fpExpanded ? <ChevronUp className="w-3 h-3 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />}
          </button>
          {fpExpanded && (
            <div className="p-3 border-t border-[var(--color-border)]">
              {fingerprints.length === 0 ? (
                <p className="text-[10px] text-[var(--color-text-dim)] italic">{lang.noFingerprints}</p>
              ) : (
                <div className="space-y-1.5">
                  {fingerprints.map(fp => (
                    <div
                      key={fp.id}
                      onClick={() => setActiveFingerprintId(activeFingerprintId === fp.id ? null : fp.id)}
                      className={`p-2 border rounded-sm cursor-pointer text-xs transition-all ${activeFingerprintId === fp.id ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)] bg-[var(--color-neon-dim)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-bright)]'}`}
                    >
                      {fp.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
