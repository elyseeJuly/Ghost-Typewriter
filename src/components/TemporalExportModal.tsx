/**
 * TemporalExportModal.tsx — 时间戳伪造引擎模态框
 * 
 * 展示生成的伪造编辑时间轴，提供 Markdown 导出和纯文本复制。
 */
import React, { useState, useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { forgeEditTrail, buildExportMarkdown, formatTimestamp } from '../lib/temporalForge';
import { extractCleanText } from '../lib/xray';
import { Clock, Copy, Check, X, FileText, Download } from 'lucide-react';

function TrailRow({ entry, isLast }: { entry: any; isLast: boolean }) {
  return (
    <div className="flex gap-3 relative">
      {/* Timeline connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-2 h-2 rounded-full border ${
          entry.action === '初稿完成' || entry.action === '发布前检查'
            ? 'border-[var(--color-neon-green)] bg-[var(--color-neon-green)]'
            : 'border-[var(--color-border-bright)] bg-[var(--color-panel)]'
        }`} />
        {!isLast && <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{entry.version}</span>
          <span className="text-[9px] text-[var(--color-text-dim)]">{formatTimestamp(new Date(entry.timestamp))}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded border ml-auto ${
            entry.action === '发布前检查' || entry.action === 'Publication Check'
              ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]'
              : entry.action === '初稿完成' || entry.action === 'First Draft'
              ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]'
              : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
          }`}>
            {entry.action}
          </span>
        </div>
        <p className="text-[9px] text-[var(--color-text-dim)] mt-0.5 truncate">{entry.paragraphHint}</p>
        <p className="text-[9px] text-[var(--color-text-dim)]">{entry.charCount.toLocaleString()} chars · {entry.durationSince}</p>
      </div>
    </div>
  );
}

export function TemporalExportModal() {
  const {
    language,
    editTrail, setEditTrail,
    setIsTemporalModalOpen,
    detoxText,
  } = useAppContext();
  const lang = t[language];
  const [copied, setCopied] = useState(false);
  const [mdCopied, setMdCopied] = useState(false);

  // Get clean text from detox editor
  const getCleanText = useCallback((): string => {
    const editorEl = document.getElementById('detox-editor') as HTMLDivElement | null;
    if (editorEl) return extractCleanText(editorEl.innerHTML) || detoxText;
    return detoxText;
  }, [detoxText]);

  const handleGenerate = useCallback(() => {
    const clean = getCleanText();
    const trail = forgeEditTrail(clean);
    setEditTrail(trail);
  }, [getCleanText, setEditTrail]);

  const handleCopyPlain = useCallback(() => {
    navigator.clipboard.writeText(getCleanText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getCleanText]);

  const handleExportMarkdown = useCallback(() => {
    const clean = getCleanText();
    const trail = editTrail.length > 0 ? editTrail : forgeEditTrail(clean);
    if (editTrail.length === 0) setEditTrail(trail);

    const md = buildExportMarkdown(clean, trail);
    navigator.clipboard.writeText(md);
    setMdCopied(true);
    setTimeout(() => setMdCopied(false), 2500);
  }, [getCleanText, editTrail, setEditTrail]);

  const totalDuration = editTrail.length >= 2
    ? Math.round((editTrail[editTrail.length - 1].timestamp.getTime() - editTrail[0].timestamp.getTime()) / 60000)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
          <Clock className="w-4 h-4 text-[var(--color-accent-orange)]" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[var(--color-text-main)] tracking-wider">{lang.temporalExportTitle}</h2>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{lang.temporalExportDesc}</p>
          </div>
          <button
            onClick={() => setIsTemporalModalOpen(false)}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Generate button */}
          <button
            id="forge-trail-btn"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--color-accent-orange)] text-[var(--color-accent-orange)] text-xs font-bold tracking-widest uppercase hover:bg-[rgba(255,107,43,0.08)] active:scale-98 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            {lang.generateTrail}
          </button>

          {/* Trail stats */}
          {editTrail.length > 0 && (
            <div className="flex items-center gap-4 p-2.5 border border-[var(--color-border)] rounded-sm">
              <div>
                <p className="text-[9px] text-[var(--color-text-dim)] uppercase">{lang.editCount}</p>
                <p className="text-sm font-bold text-[var(--color-text-muted)]">{editTrail.length}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--color-text-dim)] uppercase">{lang.totalDuration}</p>
                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                  {totalDuration >= 60 ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m` : `${totalDuration}m`}
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[9px] border border-[var(--color-neon-green)] text-[var(--color-neon-green)] px-2 py-0.5 rounded">
                  ✓ {lang.trailGenerated}
                </span>
              </div>
            </div>
          )}

          {/* Timeline */}
          {editTrail.length > 0 && (
            <div className="max-h-52 overflow-y-auto pr-1 space-y-0">
              {editTrail.map((entry, i) => (
                <div key={i}>
                  <TrailRow entry={entry} isLast={i === editTrail.length - 1} />
                </div>
              ))}
            </div>
          )}

          {/* Export actions */}
          <div className="flex gap-2 pt-1">
            <button
              id="copy-plain-export-btn"
              onClick={handleCopyPlain}
              className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-main)] hover:text-[var(--color-text-main)] transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-[var(--color-neon-green)]" /> : <Copy className="w-3 h-3" />}
              {copied ? lang.copied : lang.exportPlain}
            </button>
            <button
              id="export-markdown-btn"
              onClick={handleExportMarkdown}
              className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-2 border border-[var(--color-accent-orange)] text-[var(--color-accent-orange)] hover:bg-[rgba(255,107,43,0.08)] transition-all"
            >
              {mdCopied ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {mdCopied ? lang.copied : lang.exportMarkdown}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
