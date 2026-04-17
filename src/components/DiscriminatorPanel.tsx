/**
 * DiscriminatorPanel.tsx — AI 判别器沙盒面板
 * 
 * 对 5 路生成变体进行 AI 率打分（GPTZero API 或本地启发式）。
 * 展示柱状图、优胜者标记、策略档案。
 */
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { runDiscriminatorBatch, recordWinner, getWinnerRecords, clearWinnerRecords, scoreToColor, WinnerRecord } from '../lib/discriminator';
import { ADVERSARIAL_PROMPT_STYLES } from '../lib/gemini';
import { Loader2, Trophy, BarChart2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function ScoreBar({ score, isWinner }: { score: number; isWinner: boolean }) {
  const color = scoreToColor(score);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color }}>
        {score}%
      </span>
      {isWinner && (
        <Trophy className="w-3.5 h-3.5 text-[var(--color-neon-green)] shrink-0" />
      )}
    </div>
  );
}

export function DiscriminatorPanel() {
  const {
    language,
    generationVariants,
    discriminatorResults, setDiscriminatorResults,
    isDiscriminating, setIsDiscriminating,
    winnerIdx, setWinnerIdx,
    gptzeroKey,
    setDetoxText,
    startProgress, stopProgress,
  } = useAppContext();
  const lang = t[language];

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [winnerRecords, setWinnerRecords] = useState<WinnerRecord[]>(getWinnerRecords);

  const hasVariants = generationVariants.filter(v => v.status === 'done').length > 0;

  const handleRun = async () => {
    if (!hasVariants || isDiscriminating) return;
    setIsDiscriminating(true);
    startProgress();

    const doneVariants = generationVariants
      .filter(v => v.status === 'done')
      .map(v => ({ text: v.text, promptStyle: v.promptStyle }));

    try {
      const { results, winnerIdx: winner } = await runDiscriminatorBatch(
        doneVariants,
        gptzeroKey || undefined,
      );
      setDiscriminatorResults(results);
      setWinnerIdx(winner);

      // Record winner into strategy archive
      const winnerVariant = generationVariants[winner];
      if (winnerVariant) {
        recordWinner(
          generationVariants[0]?.text ?? '',
          winnerVariant.promptStyle,
          results[winner]?.aiScore ?? 0,
          winnerVariant.text
        );
        setWinnerRecords(getWinnerRecords());
      }
    } finally {
      setIsDiscriminating(false);
      stopProgress();
    }
  };

  const handlePipeWinner = () => {
    if (winnerIdx === null) return;
    const winner = generationVariants[winnerIdx];
    if (winner) setDetoxText(winner.text);
  };

  if (!hasVariants) return null;

  return (
    <div className="border border-[var(--color-border)] rounded-sm overflow-hidden mt-3">
      {/* Header */}
      <div className="px-3 py-2 bg-[var(--color-panel)] flex items-center gap-2 border-b border-[var(--color-border)]">
        <BarChart2 className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent-cyan)] flex-1">
          {lang.discriminatorTitle}
        </span>
        {!gptzeroKey && (
          <span className="text-[9px] text-[var(--color-accent-orange)] border border-[var(--color-accent-orange)] px-1.5 py-0.5 rounded">
            {lang.methodHeuristic}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Variant score rows */}
        {generationVariants.filter(v => v.status === 'done').map((variant, relIdx) => {
          const result = discriminatorResults[relIdx];
          const isWin = winnerIdx === relIdx;
          const style = ADVERSARIAL_PROMPT_STYLES[variant.idx];

          return (
            <div
              key={variant.idx}
              className={`p-2 border rounded-sm transition-all duration-300 ${
                isWin
                  ? 'border-[var(--color-neon-green)] bg-[var(--color-neon-dim)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{style?.icon ?? '◆'}</span>
                <span className={`text-[10px] font-bold flex-1 ${isWin ? 'text-[var(--color-neon-green)]' : 'text-[var(--color-text-muted)]'}`}>
                  {variant.promptStyle}
                </span>
                {result && (
                  <span className="text-[9px] uppercase text-[var(--color-text-dim)]">
                    {result.method === 'gptzero' ? lang.methodGPTZero : lang.methodHeuristic}
                  </span>
                )}
              </div>
              {result ? (
                <ScoreBar score={result.aiScore} isWinner={isWin} />
              ) : (
                <div className="h-1.5 bg-[var(--color-border)] rounded-full" />
              )}
              {result?.details && (
                <p className="text-[9px] text-[var(--color-text-dim)] mt-1">{result.details}</p>
              )}
            </div>
          );
        })}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            id="run-discriminator-btn"
            onClick={handleRun}
            disabled={isDiscriminating || !hasVariants}
            className={`
              flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-2 border transition-all
              ${isDiscriminating || !hasVariants
                ? 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed'
                : 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[rgba(0,212,255,0.08)] active:scale-95'
              }
            `}
          >
            {isDiscriminating
              ? <><Loader2 className="w-3 h-3 animate-spin" /> {lang.discriminatorRunning}</>
              : lang.discriminatorRun
            }
          </button>

          {winnerIdx !== null && (
            <button
              id="pipe-winner-btn"
              onClick={handlePipeWinner}
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 border border-[var(--color-neon-green)] text-[var(--color-neon-green)] hover:bg-[var(--color-neon-dim)] active:scale-95 transition-all"
            >
              <Trophy className="w-3 h-3" /> {lang.pipeWinner}
            </button>
          )}
        </div>

        {/* No GPTZero notice */}
        {!gptzeroKey && (
          <p className="text-[9px] text-[var(--color-text-dim)] italic">{lang.noGPTZeroKey}</p>
        )}

        {/* Strategy Archive */}
        {winnerRecords.length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-2 mt-1">
            <button
              onClick={() => setArchiveOpen(!archiveOpen)}
              className="w-full flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              {archiveOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span className="flex-1 text-left">{lang.winnerRecords} ({winnerRecords.length})</span>
              <button
                onClick={(e) => { e.stopPropagation(); clearWinnerRecords(); setWinnerRecords([]); }}
                className="hover:text-[var(--color-red-xray)] transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
            {archiveOpen && (
              <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                {winnerRecords.map((rec, i) => (
                  <div key={i} className="p-1.5 border border-[var(--color-border)] rounded-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[var(--color-neon-green)]">{rec.promptStyle}</span>
                      <span className="text-[9px] text-[var(--color-text-dim)] ml-auto">{rec.aiScore}% AI</span>
                    </div>
                    <p className="text-[9px] text-[var(--color-text-dim)] mt-0.5 truncate">{rec.textSnippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
