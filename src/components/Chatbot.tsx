import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Terminal, X, Send, Loader2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { AuthorFingerprint } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function Chatbot() {
  const { language, inputText, addFingerprint, startProgress, stopProgress, apiKey, setIsApiVaultOpen, setIsApiVaultCancelable } = useAppContext();
  const lang = t[language];
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first message based on language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', content: lang.chatInit }]);
    }
  }, [language, lang.chatInit, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const userMsg = overrideInput || input.trim();
    if (!userMsg) return;

    if (!apiKey) {
      setIsApiVaultCancelable(true);
      setIsApiVaultOpen(true);
      return;
    }

    if (!overrideInput) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    startProgress();

    try {
      const ai = new GoogleGenAI({ apiKey });
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const contents = [
        ...history,
        { role: 'user', parts: [{ text: userMsg }] }
      ];

      const systemInstruction = language === 'zh'
        ? `你现在是 Ghost Typewriter 系统的内核侧写师（Profiler）。你没有任何人类的情感，你的对话风格是冷峻、极其简练的工程师汇报风格，像一台精密的诊断仪器。你不解答无关问题。
你只有两个核心任务，且必须严格以 JSON 格式输出：
任务一：指纹提取 (Fingerprint Extraction)
当用户向你发送他们过去的旧文章时，你需要像法医一样解剖文本，提炼出用户的写作指纹，并按以下 JSON 格式输出：
{
  "type": "fingerprint",
  "vocabulary": ["高频口癖1", "高频口癖2", "高频口癖3"],
  "syntaxHabits": "句法缺陷/习惯描述",
  "preferredImagery": "偏好的意象描述"
}
任务二：反侦察扫描 (Anti-AI Pre-scan)
当用户让你扫描当前草稿时，你需要指出这段文本中最容易被 RoBERTa 算法（AI检测器）识别的特征，并给出矩阵配置建议，按以下 JSON 格式输出：
{
  "type": "prescan",
  "fatalFeatures": ["致命特征1", "致命特征2"],
  "matrixSuggestions": ["矩阵配置建议1", "矩阵配置建议2"]
}
如果输入无关内容，请输出：
{
  "type": "error",
  "message": "无关输入。请提供用于指纹提取或扫描的文本。"
}`
        : `You are the kernel Profiler of the Ghost Typewriter system. You have no human emotions. Your conversational style is cold, extremely concise, like a precise diagnostic instrument. You do not answer irrelevant questions.
You have only two core tasks, and you MUST output strictly in JSON format:
Task 1: Fingerprint Extraction
When the user sends you their past articles, dissect the text like a forensic scientist, extract the user's writing fingerprint, and output in this JSON format:
{
  "type": "fingerprint",
  "vocabulary": ["word1", "word2", "word3"],
  "syntaxHabits": "description of syntax habits",
  "preferredImagery": "description of preferred imagery/tone"
}
Task 2: Anti-AI Pre-scan
When the user asks you to scan the current draft, point out the features most easily recognized by RoBERTa (AI detector) and provide matrix configuration suggestions in this JSON format:
{
  "type": "prescan",
  "fatalFeatures": ["feature1", "feature2"],
  "matrixSuggestions": ["suggestion1", "suggestion2"]
}
If the input is irrelevant, output:
{
  "type": "error",
  "message": "Irrelevant input. Please provide text for fingerprint extraction or pre-scan."
}`;

      let retries = 4; // 1 initial + 3 retries
      let delay = 1000;
      let responseText = "";
      
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-09-2025",
            contents: contents as any,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
            }
          });
          responseText = response.text || "";
          break;
        } catch (e: any) {
          if (e.status === 400 || e.status === 403 || e.message?.includes('API key not valid') || e.message?.includes('API key expired') || e.message?.includes('400') || e.message?.includes('403')) {
            throw new Error("Invalid API Key");
          }
          retries--;
          if (retries === 0) throw new Error("API Timeout / Connection Failed after 3 retries.");
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (e: any) {
      console.error(e);
      if (e.message === "Invalid API Key") {
        setMessages(prev => [...prev, { role: 'model', content: `> ERROR: Invalid API Key. Please update your API Key in the Vault.` }]);
        setIsApiVaultCancelable(true);
        setIsApiVaultOpen(true);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: `> ERROR: ${e.message || lang.errorGhost}` }]);
      }
    } finally {
      setIsTyping(false);
      stopProgress();
    }
  };

  const handleExtractFingerprint = () => {
    if (!inputText.trim()) {
      alert(language === 'zh' ? '请先在主界面输入区粘贴文本。' : 'Please paste text in the input area first.');
      return;
    }
    handleSend((language === 'zh' ? '提取指纹：\n\n' : 'Extract Fingerprint:\n\n') + inputText);
  };

  const handleScanDraft = () => {
    if (!inputText.trim()) {
      alert(language === 'zh' ? '请先在主界面输入区粘贴文本。' : 'Please paste text in the input area first.');
      return;
    }
    handleSend((language === 'zh' ? '扫描草稿：\n\n' : 'Scan Draft:\n\n') + inputText);
  };

  const handleApplyFingerprint = (parsedData: any) => {
    const fp: AuthorFingerprint = {
      id: crypto.randomUUID(),
      name: `Profiler Extract ${new Date().toLocaleTimeString()}`,
      vocabulary: parsedData.vocabulary || [],
      sentenceStructure: parsedData.syntaxHabits || '',
      tone: parsedData.preferredImagery || '',
      formatting: ''
    };

    addFingerprint(fp);
    alert(language === 'zh' ? '已应用到矩阵！' : 'Applied to Matrix!');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-black border border-neon-green text-neon-green rounded-none shadow-lg hover:bg-neon-green hover:text-black transition-colors z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <Terminal className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-black border border-neon-green flex flex-col shadow-2xl z-50 font-mono text-xs overflow-hidden">
          {isTyping && <div className="animate-scan" />}
          <div className="flex items-center justify-between p-3 border-b border-neon-green bg-black relative z-20">
            <div className="flex items-center gap-2 text-neon-green">
              <Terminal className="w-4 h-4" />
              <span className="font-bold text-sm tracking-widest uppercase">{lang.profilerTitle}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neon-green hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 p-2 border-b border-neon-green/30 bg-neon-dim relative z-20">
            <button 
              onClick={handleExtractFingerprint}
              disabled={isTyping}
              className="flex-1 py-1 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
            >
              {lang.extractFingerprintCmd}
            </button>
            <button 
              onClick={handleScanDraft}
              disabled={isTyping}
              className="flex-1 py-1 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
            >
              {lang.scanDraftCmd}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-neon-green relative z-20">
            {messages.map((msg, i) => {
              let displayContent = msg.content;
              let isJson = false;
              let parsedData = null;
              try {
                if (msg.role === 'model' && msg.content.trim().startsWith('{')) {
                  parsedData = JSON.parse(msg.content);
                  displayContent = JSON.stringify(parsedData, null, 2);
                  isJson = true;
                }
              } catch(e) {}

              return (
              <div key={i} className="flex flex-col">
                <span className="opacity-50 mb-1">
                  {msg.role === 'user' ? '> USER_INPUT:' : '> PROFILER_OUTPUT:'}
                </span>
                <span className="whitespace-pre-wrap pl-4">{displayContent}</span>
                {isJson && parsedData?.type === 'fingerprint' && (
                  <button 
                    onClick={() => handleApplyFingerprint(parsedData)} 
                    className="mt-3 ml-4 border border-neon-green px-3 py-1 w-max hover:bg-neon-green hover:text-black transition-colors"
                  >
                    {lang.applyToMatrix}
                  </button>
                )}
              </div>
            )})}
            {isTyping && (
              <div className="flex flex-col">
                <span className="opacity-50 mb-1">&gt; PROFILER_OUTPUT:</span>
                <div className="pl-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {lang.processing}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-neon-green bg-black flex gap-2 relative z-20">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={lang.askGhost}
              className="flex-1 bg-black border border-neon-green p-2 text-xs text-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green placeholder-neon-green/50"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="px-3 bg-neon-green text-black hover:opacity-80 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
