/**
 * DetoxEditor.tsx — 透析编辑器 (v9.0 GAN Edition)
 * 
 * 新增：
 * - 向量示波器面板 (VectorScopePanel) 可折叠
 * - 导出下拉菜单：纯文本 / 时间戳伪造导出
 * - TemporalExportModal 集成
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { runXRayScan, extractCleanText, XRAY_SAFE_THRESHOLD } from '../lib/xray';
import { VectorScopePanel } from './VectorScopePanel';
import { TemporalExportModal } from './TemporalExportModal';
import { Copy, Check, ArrowRight, Scan, ChevronDown, Clock } from 'lucide-react';

// ── Helper: badge color class ──────────────────────────────
function getBadgeClass(n: number, threshold: number): string {
  if (n === 0) return 'safe';
  if (n <= threshold) return 'warn';
  return 'danger';
}

// ─────────────────────────────────────────────
// Mutation Buffer (Stage 1 output, read-only)
// ─────────────────────────────────────────────
function MutationBuffer() {
  const { language, mutatedText, isProcessing, setDetoxText } = useAppContext();
  const lang = t[language];
  const [copied, setCopied] = useState(false);
  const [piped, setPiped] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mutatedText) { setDisplayText(''); return; }
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    setDisplayText('');
    let i = 0;
    const speed = mutatedText.length > 2000 ? 2 : 8;

    const tick = () => {
      if (i < mutatedText.length) {
        setDisplayText(mutatedText.slice(0, i + 1));
        i++;
        typewriterRef.current = setTimeout(tick, speed);
      }
    };
    tick();
    return () => { if (typewriterRef.current) clearTimeout(typewriterRef.current); };
  }, [mutatedText]);

  const handlePipeToDetox = () => {
    setDetoxText(mutatedText);
    setPiped(true);
    setTimeout(() => setPiped(false), 2000);
  };

  const handleCopyBuffer = () => {
    if (!mutatedText) return;
    navigator.clipboard.writeText(mutatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col border-b border-[var(--color-border)] h-[40%] shrink-0">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[var(--color-neon-green)] flex items-center justify-center text-black text-[9px] font-bold">1</div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-neon-green)]">{lang.theOutput}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="copy-buffer-btn"
            onClick={handleCopyBuffer}
            disabled={!mutatedText}
            className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] disabled:opacity-30 transition-colors px-2 py-1"
          >
            {copied ? <Check className="w-3 h-3 text-[var(--color-neon-green)]" /> : <Copy className="w-3 h-3" />}
            {copied ? lang.copied : lang.copy}
          </button>
          <button
            id="pipe-to-detox-btn"
            onClick={handlePipeToDetox}
            disabled={!mutatedText}
            className={`
              flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 border transition-all
              ${mutatedText
                ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[rgba(0,212,255,0.1)] hover:shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed'
              }
            `}
          >
            {piped ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3 flow-arrow" />}
            {piped ? '已注入 ✓' : lang.pipelineHint}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {isProcessing && <div className="animate-scan" />}
        {displayText ? (
          <div className="text-sm font-mono text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed">
            {displayText}
            {isProcessing && <span className="cursor-blink ml-1" />}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--color-text-dim)] text-xs font-mono">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="cursor-blink" />
                {lang.processing}
              </span>
            ) : (
              lang.awaiting
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Export dropdown
// ─────────────────────────────────────────────
function ExportDropdown({ hasContent }: { hasContent: boolean }) {
  const { language, setIsTemporalModalOpen } = useAppContext();
  const lang = t[language];
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPlain = () => {
    const editorEl = document.getElementById('detox-editor') as HTMLDivElement | null;
    if (!editorEl) return;
    const clean = extractCleanText(editorEl.innerHTML);
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id="export-dropdown-btn"
        onClick={() => setOpen(!open)}
        disabled={!hasContent}
        className={`
          flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 border transition-all
          ${!hasContent
            ? 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed'
            : copied
              ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)] bg-[var(--color-neon-dim)]'
              : 'border-[var(--color-text-muted)] text-[var(--color-text-muted)] hover:border-[var(--color-text-main)] hover:text-[var(--color-text-main)]'
          }
        `}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? lang.copied : lang.exportMenu}
        {!copied && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-sm shadow-xl min-w-[160px] overflow-hidden">
            <button
              id="export-plain-btn"
              onClick={handleCopyPlain}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors"
            >
              <Copy className="w-3 h-3" /> {lang.exportPlain}
            </button>
            <button
              id="export-temporal-btn"
              onClick={() => { setIsTemporalModalOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] text-[var(--color-accent-orange)] hover:bg-[rgba(255,107,43,0.08)] transition-colors border-t border-[var(--color-border)]"
            >
              <Clock className="w-3 h-3" /> {lang.exportTemporal}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Detox Editor Core (Stage 2, contenteditable)
// ─────────────────────────────────────────────
function DetoxEditorCore() {
  const {
    language,
    detoxText,
    isXrayScanning, setIsXrayScanning,
    xrayCounts, setXrayCounts,
    hasXrayRan, setHasXrayRan,
  } = useAppContext();
  const lang = t[language];

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    setHasXrayRan(false);
    setXrayCounts({ cliches: 0, transitions: 0, structures: 0, total: 0 });
    editor.innerHTML = detoxText
      ? detoxText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
      : '';
  }, [detoxText, setHasXrayRan, setXrayCounts]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const plain = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, plain);
    };
    editor.addEventListener('paste', handlePaste);
    return () => editor.removeEventListener('paste', handlePaste);
  }, []);

  const handleXRayScan = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    setIsXrayScanning(true);
    const plainText = editor.innerText || '';
    setTimeout(() => {
      const { html, counts } = runXRayScan(plainText);
      editor.innerHTML = html;
      setXrayCounts(counts);
      setHasXrayRan(true);
      setIsXrayScanning(false);
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 50);
  }, [setIsXrayScanning, setXrayCounts, setHasXrayRan]);

  const totalCount = xrayCounts.total;
  const isSafe = totalCount <= XRAY_SAFE_THRESHOLD;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel-2)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[var(--color-accent-cyan)] flex items-center justify-center text-black text-[9px] font-bold">2</div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent-cyan)]">{lang.detoxEditor}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="run-xray-btn"
            onClick={handleXRayScan}
            disabled={isXrayScanning || !detoxText}
            className={`
              flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 border transition-all
              ${!detoxText
                ? 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed'
                : 'border-[var(--color-red-xray)] text-[var(--color-red-xray)] hover:bg-[rgba(239,68,68,0.1)] hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] active:scale-95'
              }
            `}
          >
            <Scan className={`w-3 h-3 ${isXrayScanning ? 'animate-spin' : ''}`} />
            {lang.runXray}
          </button>

          {/* Export Dropdown */}
          <ExportDropdown hasContent={!!detoxText} />
        </div>
      </div>

      {/* X-Ray Counter Bar */}
      {hasXrayRan && (
        <div className="px-4 py-2 bg-[var(--color-panel)] border-b border-[var(--color-border)] flex items-center gap-4 shrink-0">
          <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] mr-2">{lang.xrayCounterLabel}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[rgba(239,68,68,0.4)] border border-[#ef4444]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">{lang.clichesLabel}</span>
            <span className={`counter-badge text-sm ${getBadgeClass(xrayCounts.cliches, 2)}`}>{xrayCounts.cliches}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[rgba(59,130,246,0.4)] border border-[#3b82f6]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">{lang.transitionsLabel}</span>
            <span className={`counter-badge text-sm ${getBadgeClass(xrayCounts.transitions, 2)}`}>{xrayCounts.transitions}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[rgba(234,179,8,0.3)] border border-dashed border-[#eab308]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">{lang.structuresLabel}</span>
            <span className={`counter-badge text-sm ${getBadgeClass(xrayCounts.structures, 1)}`}>{xrayCounts.structures}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-text-muted)]">TOTAL</span>
            <span className={`counter-badge text-base ${getBadgeClass(totalCount, XRAY_SAFE_THRESHOLD)}`}>{totalCount}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${isSafe ? 'border-[var(--color-neon-green)] text-[var(--color-neon-green)]' : 'border-[#ef4444] text-[#ef4444]'}`}>
              {isSafe ? '✓ SAFE' : '✗ INFECTED'}
            </span>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        <div
          id="detox-editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="detox-editor min-h-full text-sm font-mono text-[var(--color-text-main)] leading-relaxed"
          data-placeholder={lang.detoxPlaceholder}
          spellCheck={false}
        />
      </div>

      {/* Safe threshold hint */}
      <div className="px-4 py-2 border-t border-[var(--color-border)] shrink-0 flex items-center justify-between">
        <span className="text-[9px] text-[var(--color-text-dim)]">{lang.safeThreshold}</span>
        {hasXrayRan && (
          <span className="text-[9px] text-[var(--color-text-dim)]">
            {language === 'zh' ? '手动删改高亮部分以降低计分' : 'Manually edit highlighted text to reduce score'}
          </span>
        )}
      </div>

      {/* Vector Scope Panel (collapsible, always mounted) */}
      <VectorScopePanel />
    </div>
  );
}

// ─────────────────────────────────────────────
// Combined Detox Panel (exported)
// ─────────────────────────────────────────────
export function DetoxEditor() {
  const { isTemporalModalOpen } = useAppContext();

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)] overflow-hidden">
      <MutationBuffer />
      <DetoxEditorCore />
      {isTemporalModalOpen && <TemporalExportModal />}
    </div>
  );
}
