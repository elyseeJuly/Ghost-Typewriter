import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Copy, Check, Terminal } from 'lucide-react';
import { t } from '../lib/i18n';

export function OutputPanel() {
  const { language, outputText, isProcessing, activeMutations } = useAppContext();
  const [copied, setCopied] = useState(false);
  const lang = t[language];

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-bg p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold tracking-widest uppercase text-neon-green">{lang.theOutput}</h2>
        <button 
          onClick={handleCopy}
          disabled={!outputText || isProcessing}
          className="flex items-center gap-2 text-text-muted hover:text-neon-green disabled:opacity-50 transition-colors text-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? lang.copied : lang.copy}
        </button>
      </div>
      
      <div className="flex-1 w-full bg-panel border border-border p-4 text-sm font-mono overflow-y-auto relative mb-4">
        {outputText ? (
          <div className="whitespace-pre-wrap">{outputText}</div>
        ) : (
          <div className="text-text-muted opacity-50 flex items-center justify-center h-full">
            {lang.awaiting}
          </div>
        )}
        {isProcessing && (
          <span className="inline-block w-2 h-4 bg-neon-green animate-pulse ml-1 align-middle"></span>
        )}
      </div>

      {/* Diagnostic Monitor */}
      <div className="h-48 shrink-0 border border-border bg-black p-3 overflow-y-auto font-mono text-xs">
        <div className="flex items-center gap-2 text-text-muted uppercase mb-2 border-b border-border pb-2">
          <Terminal className="w-4 h-4" />
          <span>Diagnostic Monitor</span>
        </div>
        
        {activeMutations.length > 0 ? (
          <div className="space-y-1">
            <div className="text-neon-green opacity-50 mb-2">&gt; INJECTING MUTATION VECTORS...</div>
            {activeMutations.map((m, i) => {
              const match = m.match(/^\[(.*?)\] (.*)$/);
              if (match) {
                return (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-500 shrink-0">[{match[1]}]</span>
                    <span className="text-slate-300">{match[2]}</span>
                  </div>
                );
              }
              return <div key={i} className="text-slate-300">&gt; {m}</div>;
            })}
            <div className="text-neon-green opacity-50 mt-2">&gt; MUTATION SEQUENCE COMPLETE.</div>
          </div>
        ) : (
          <div className="text-text-muted opacity-50 italic">
            {lang.awaiting}
          </div>
        )}
      </div>
    </div>
  );
}
