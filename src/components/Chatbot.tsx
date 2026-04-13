import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Terminal, X, Send, Loader2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { t } from '../lib/i18n';
import { AuthorFingerprint } from '../lib/gemini';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function Chatbot() {
  const { language, inputText, addFingerprint } = useAppContext();
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

    if (!overrideInput) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
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
你只有两个核心任务：
任务一：指纹提取 (Fingerprint Extraction)
当用户向你发送他们过去的旧文章时，你需要像法医一样解剖文本，提炼出用户的写作指纹，并按以下格式输出（务必精准，不要有任何客套话）：
• 高频口癖：[提取3-5个]
• 句法缺陷/习惯：[例如：喜欢滥用长定语、喜欢用破折号等]
• 偏好的意象：[例如：喜欢用机械做比喻、带有清冷的旁观感]
任务二：反侦察扫描 (Anti-AI Pre-scan)
当用户让你扫描当前草稿时，你需要指出这段文本中最容易被 RoBERTa 算法（AI检测器）识别的特征，并给出矩阵配置建议：
• 致命特征：[指出具体的词汇或对称结构]
• 矩阵配置建议：[例如：建议开启【逻辑跳跃】Lv3，【词汇降级】Lv2]`
        : `You are the kernel Profiler of the Ghost Typewriter system. You have no human emotions. Your conversational style is cold, extremely concise, like a precise diagnostic instrument. You do not answer irrelevant questions.
You have only two core tasks:
Task 1: Fingerprint Extraction
When the user sends you their past articles, you need to dissect the text like a forensic scientist, extract the user's writing fingerprint, and output it in the following format (must be precise, no pleasantries):
- Vocabulary: [Extract 3-5 words/phrases]
- Syntax Habits: [e.g., Overuse of long modifiers, preference for em-dashes]
- Preferred Imagery/Tone: [e.g., Mechanical metaphors, cold observer perspective]

Task 2: Anti-AI Pre-scan
When the user asks you to scan the current draft, you need to point out the features in this text that are most easily recognized by the RoBERTa algorithm (AI detector) and provide matrix configuration suggestions:
- Fatal Features: [Point out specific vocabulary or symmetrical structures]
- Matrix Suggestions: [e.g., Recommend enabling Logic Leap, Lexical Degradation]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents as any,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        }
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "" }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: lang.errorGhost }]);
    } finally {
      setIsTyping(false);
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

  const handleApplyFingerprint = (content: string) => {
    const vocabMatch = content.match(/(?:高频口癖|Vocabulary)[:：]\s*(.*)/i);
    const syntaxMatch = content.match(/(?:句法缺陷\/习惯|Syntax Habits)[:：]\s*(.*)/i);
    const toneMatch = content.match(/(?:偏好的意象|Preferred Imagery\/Tone)[:：]\s*(.*)/i);

    const fp: AuthorFingerprint = {
      id: crypto.randomUUID(),
      name: `Profiler Extract ${new Date().toLocaleTimeString()}`,
      vocabulary: vocabMatch ? vocabMatch[1].split(/[,，、]/).map(s => s.trim()) : [],
      sentenceStructure: syntaxMatch ? syntaxMatch[1].trim() : '',
      tone: toneMatch ? toneMatch[1].trim() : '',
      formatting: ''
    };

    addFingerprint(fp);
    alert(language === 'zh' ? '已应用到矩阵！' : 'Applied to Matrix!');
  };

  const isFingerprintResult = (content: string) => {
    return content.includes('高频口癖') || content.includes('Vocabulary');
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
        <div className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-black border border-neon-green flex flex-col shadow-2xl z-50 font-mono text-xs">
          <div className="flex items-center justify-between p-3 border-b border-neon-green bg-black">
            <div className="flex items-center gap-2 text-neon-green">
              <Terminal className="w-4 h-4" />
              <span className="font-bold text-sm tracking-widest uppercase">{lang.profilerTitle}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neon-green hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 p-2 border-b border-neon-green/30 bg-neon-dim">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-neon-green">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col">
                <span className="opacity-50 mb-1">
                  {msg.role === 'user' ? '> USER_INPUT:' : '> PROFILER_OUTPUT:'}
                </span>
                <span className="whitespace-pre-wrap pl-4">{msg.content}</span>
                {msg.role === 'model' && isFingerprintResult(msg.content) && (
                  <button 
                    onClick={() => handleApplyFingerprint(msg.content)} 
                    className="mt-3 ml-4 border border-neon-green px-3 py-1 w-max hover:bg-neon-green hover:text-black transition-colors"
                  >
                    {lang.applyToMatrix}
                  </button>
                )}
              </div>
            ))}
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

          <div className="p-3 border-t border-neon-green bg-black flex gap-2">
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
