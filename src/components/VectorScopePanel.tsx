/**
 * VectorScopePanel.tsx — 向量示波器面板
 * 
 * 客户端语义热力图（基于 all-MiniLM-L6-v2 或启发式降级）。
 * 对抗目标：识别语义平滑死区，引导插入感官记忆碎片进行向量撕裂。
 */
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import {
  loadVectorModel,
  analyzeSemanticVariance,
  analyzeHeuristic,
  subscribeModelState,
  getModelState,
  VECTOR_THRESHOLDS,
} from '../lib/vectorScope';
import { Loader2, Activity } from 'lucide-react';

function HeatmapBar({ segments }: { segments: Array<{ simToNext?: number; risk: string }> }) {
  if (segments.length === 0) return null;
  return (
    <div className="flex gap-0.5 h-4 rounded-sm overflow-hidden">
      {segments.map((seg, i) => {
        const bgColor =
          seg.risk === 'hot' ? 'rgba(239,68,68,0.85)'
          : seg.risk === 'warm' ? 'rgba(234,179,8,0.7)'
          : 'rgba(0,255,65,0.5)';
        const shadowColor =
          seg.risk === 'hot' ? 'rgba(239,68,68,0.6)'
          : seg.risk === 'warm' ? 'rgba(234,179,8,0.4)'
          : 'rgba(0,255,65,0.3)';
        return (
          <div
            key={i}
            className="flex-1 transition-all duration-500 rounded-sm"
            style={{ background: bgColor, boxShadow: `0 0 4px ${shadowColor}` }}
            title={seg.simToNext !== undefined ? `Sim: ${seg.simToNext.toFixed(3)} — ${seg.risk}` : 'Last segment'}
          />
        );
      })}
    </div>
  );
}

export function VectorScopePanel() {
  const {
    language,
    detoxText,
    vectorModelState, setVectorModelState,
    vectorModelProgress, setVectorModelProgress,
    vectorHeatmap, setVectorHeatmap,
    isVectorScanning, setIsVectorScanning,
    vectorAvgSim, setVectorAvgSim,
    vectorVariance, setVectorVariance,
    vectorHotCount, setVectorHotCount,
  } = useAppContext();
  const lang = t[language];

  // Sync model state from singleton
  useEffect(() => {
    const unsub = subscribeModelState((state, progress) => {
      setVectorModelState(state);
      if (progress !== undefined) setVectorModelProgress(progress);
    });
    return unsub;
  }, [setVectorModelState, setVectorModelProgress]);

  const handleScan = useCallback(async () => {
    if (!detoxText.trim() || isVectorScanning) return;
    setIsVectorScanning(true);

    try {
      let result;
      const currentState = getModelState();

      if (currentState === 'idle' || currentState === 'error') {
        // Try to load model
        try {
          await loadVectorModel((pct) => setVectorModelProgress(pct));
          result = await analyzeSemanticVariance(detoxText);
        } catch {
          // Fallback to heuristic
          result = analyzeHeuristic(detoxText);
        }
      } else if (currentState === 'ready') {
        try {
          result = await analyzeSemanticVariance(detoxText);
        } catch {
          result = analyzeHeuristic(detoxText);
        }
      } else {
        // Loading in progress— use heuristic for now
        result = analyzeHeuristic(detoxText);
      }

      setVectorHeatmap(result.segments);
      setVectorAvgSim(result.avgSimilarity);
      setVectorVariance(result.variance);
      setVectorHotCount(result.hotZoneCount);
    } finally {
      setIsVectorScanning(false);
    }
  }, [detoxText, isVectorScanning, setIsVectorScanning, setVectorHeatmap, setVectorAvgSim, setVectorVariance, setVectorHotCount, setVectorModelProgress]);

  const hotSegments = vectorHeatmap.filter(s => s.risk === 'hot');
  const hasResults = vectorHeatmap.length > 0;

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-panel)]">
      {/* Header */}
      <div className="px-4 py-2 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent-orange)] flex-1">
          {lang.vectorScopeTitle}
        </span>

        {/* Model state indicator */}
        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
          vectorModelState === 'ready' ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]'
          : vectorModelState === 'loading' ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]'
          : vectorModelState === 'error' ? 'border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]'
          : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
        }`}>
          {vectorModelState === 'ready' ? lang.modelReady
           : vectorModelState === 'loading' ? `${vectorModelProgress}%`
           : vectorModelState === 'error' ? 'HEURISTIC'
           : 'MiniLM-L6'}
        </span>

        <button
          id="run-vector-scan-btn"
          onClick={handleScan}
          disabled={isVectorScanning || !detoxText.trim()}
          className={`
            flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 border transition-all
            ${!detoxText.trim() || isVectorScanning
              ? 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed'
              : 'border-[var(--color-accent-orange)] text-[var(--color-accent-orange)] hover:bg-[rgba(255,107,43,0.08)] active:scale-95'
            }
          `}
        >
          {isVectorScanning
            ? <><Loader2 className="w-3 h-3 animate-spin" /> {lang.vectorScanning}</>
            : lang.runVectorScan
          }
        </button>
      </div>

      {/* Model loading progress */}
      {vectorModelState === 'loading' && (
        <div className="px-4 pb-2">
          <p className="text-[9px] text-[var(--color-accent-cyan)] mb-1">{lang.loadingModel} ({vectorModelProgress}%)</p>
          <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent-cyan)] transition-all duration-300"
              style={{ width: `${vectorModelProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="px-4 pb-3 space-y-2">
          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--color-text-dim)] uppercase">{lang.avgSimilarity}</span>
              <span className={`text-xs font-bold ${vectorAvgSim > VECTOR_THRESHOLDS.hot ? 'text-[#ef4444]' : vectorAvgSim > VECTOR_THRESHOLDS.warm ? 'text-[#eab308]' : 'text-[var(--color-neon-green)]'}`}>
                {vectorAvgSim.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--color-text-dim)] uppercase">{lang.variance}</span>
              <span className="text-xs font-bold text-[var(--color-text-muted)]">{vectorVariance.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--color-text-dim)] uppercase">{lang.hotZones}</span>
              <span className={`text-xs font-bold ${vectorHotCount > 0 ? 'text-[#ef4444]' : 'text-[var(--color-neon-green)]'}`}>
                {vectorHotCount}
              </span>
            </div>
            <div className="ml-auto">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                vectorHotCount === 0
                  ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]'
                  : 'border-[#ef4444] text-[#ef4444]'
              }`}>
                {vectorHotCount === 0 ? lang.vectorSafe : lang.vectorDanger}
              </span>
            </div>
          </div>

          {/* Heatmap bar */}
          <HeatmapBar segments={vectorHeatmap} />

          {/* Hot zone warnings */}
          {hotSegments.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {hotSegments.map((seg, i) => (
                <div key={i} className="vector-dead-zone p-2 rounded-sm border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.06)]">
                  <p className="text-[9px] text-[#ef4444] font-bold mb-1">{lang.hotZoneWarning}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] italic leading-relaxed line-clamp-2">
                    「{seg.sentence.slice(0, 80)}{seg.sentence.length > 80 ? '…' : ''}」
                  </p>
                  {seg.warning && (
                    <p className="text-[9px] text-[var(--color-text-dim)] mt-1">{seg.warning}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
