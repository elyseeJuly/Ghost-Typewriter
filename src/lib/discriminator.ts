/**
 * discriminator.ts — 判别器沙盒
 * 
 * 对生成变体进行 AI 率打分，筛选"最像人类"的优胜版本。
 * 
 * 策略：
 * 1. 有 GPTZero API key → 调用真实 GPTZero API
 * 2. 无 key → 本地启发式判别器（X-Ray 特征 + 句子统计）
 * 
 * 优胜样本记录到 localStorage，构建本地 Prompt 策略对抗库。
 */

export interface DiscriminatorResult {
  variantIdx: number;
  promptStyle: string;
  aiScore: number;       // 0~100, 越低越像人类
  verdict: 'human' | 'ai' | 'uncertain';
  method: 'gptzero' | 'heuristic';
  details?: string;
}

export interface WinnerRecord {
  timestamp: number;
  inputHash: string;
  promptStyle: string;
  aiScore: number;
  textSnippet: string;
}

const LS_KEY = 'ghost_winner_records';

// ──────────────────────────────────────────────────────────
// GPTZero API
// ──────────────────────────────────────────────────────────
async function callGPTZero(text: string, apiKey: string): Promise<number> {
  const resp = await fetch('https://api.gptzero.me/v2/predict/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ document: text }),
  });
  if (!resp.ok) throw new Error(`GPTZero API Error: ${resp.status}`);
  const data = await resp.json();
  // completely_generated_prob is 0~1 → multiply to 0~100
  const prob: number = data?.documents?.[0]?.completely_generated_prob ?? 0.5;
  return Math.round(prob * 100);
}

// ──────────────────────────────────────────────────────────
// Local Heuristic Discriminator
// Based on: X-Ray clichés density + avg sentence length + punctuation variance
// ──────────────────────────────────────────────────────────
export function heuristicAIScore(text: string): { score: number; details: string } {
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const totalChars = text.length;

  // 1. Cliché density (import list from xray)
  const CLICHE_WORDS = [
    '总的来说', '综上所述', '不难发现', '值得注意', '不可否认', '毋庸置疑', '众所周知',
    '与此同时', '不仅如此', '除此之外', '在此基础上', '深入探讨', '底层逻辑', '赋能', '闭环',
    '令人深思', '引人深思', 'In conclusion', 'To summarize', 'It is worth noting',
    'Needless to say', 'delve into', 'tapestry', 'synergy', 'paradigm shift', 'leverage',
  ];
  let clicheHits = 0;
  for (const w of CLICHE_WORDS) {
    if (text.toLowerCase().includes(w.toLowerCase())) clicheHits++;
  }
  const clicheScore = Math.min(40, clicheHits * 8); // max 40 pts

  // 2. Sentence length variance (AI tends to have uniform sentence lengths)
  if (sentences.length === 0) return { score: 50, details: '文本过短，无法判断' };
  const lengths = sentences.map(s => s.trim().length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, l) => acc + Math.pow(l - avgLen, 2), 0) / lengths.length;
  const normalizedVariance = Math.min(1, variance / 400);
  const uniformityScore = Math.round((1 - normalizedVariance) * 30); // max 30 pts

  // 3. Transition word density
  const TRANS_WORDS = ['然而', '因此', '首先', '其次', '最后', '此外', '另外', 'however', 'therefore', 'furthermore', 'moreover', 'in addition', 'finally'];
  let transHits = 0;
  for (const w of TRANS_WORDS) {
    const matches = text.toLowerCase().match(new RegExp(w.toLowerCase(), 'g'));
    if (matches) transHits += matches.length;
  }
  const transDensity = totalChars > 0 ? transHits / (totalChars / 100) : 0;
  const transScore = Math.min(30, Math.round(transDensity * 10)); // max 30 pts

  const total = clicheScore + uniformityScore + transScore;
  const clamped = Math.max(5, Math.min(98, total));

  const details = `套话密度 +${clicheScore} | 句长均匀度 +${uniformityScore} | 连词密度 +${transScore}`;

  return { score: clamped, details };
}

// ──────────────────────────────────────────────────────────
// Main entry: evaluate one variant
// ──────────────────────────────────────────────────────────
export async function evaluateVariant(
  text: string,
  variantIdx: number,
  promptStyle: string,
  gptzeroKey?: string
): Promise<DiscriminatorResult> {
  if (gptzeroKey?.trim()) {
    try {
      const score = await callGPTZero(text, gptzeroKey.trim());
      const verdict = score < 30 ? 'human' : score > 65 ? 'ai' : 'uncertain';
      return { variantIdx, promptStyle, aiScore: score, verdict, method: 'gptzero' };
    } catch (err) {
      console.warn('[Discriminator] GPTZero failed, falling back to heuristic:', err);
    }
  }

  const { score, details } = heuristicAIScore(text);
  const verdict = score < 30 ? 'human' : score > 65 ? 'ai' : 'uncertain';
  return { variantIdx, promptStyle, aiScore: score, verdict, method: 'heuristic', details };
}

// ──────────────────────────────────────────────────────────
// Batch: evaluate all variants, pick winner
// ──────────────────────────────────────────────────────────
export async function runDiscriminatorBatch(
  variants: Array<{ text: string; promptStyle: string }>,
  gptzeroKey?: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ results: DiscriminatorResult[]; winnerIdx: number }> {
  const results: DiscriminatorResult[] = [];

  // Run in parallel (max 3 concurrent to avoid rate limits)
  const batchSize = gptzeroKey ? 2 : 5;
  for (let i = 0; i < variants.length; i += batchSize) {
    const batch = variants.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((v, j) => evaluateVariant(v.text, i + j, v.promptStyle, gptzeroKey))
    );
    results.push(...batchResults);
    onProgress?.(Math.min(i + batchSize, variants.length), variants.length);
  }

  const winnerIdx = results.reduce(
    (minIdx, r, i) => (r.aiScore < results[minIdx].aiScore ? i : minIdx),
    0
  );

  return { results, winnerIdx };
}

// ──────────────────────────────────────────────────────────
// Winner Record Persistence
// ──────────────────────────────────────────────────────────
function simpleHash(text: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(text.length, 200); i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function recordWinner(
  inputText: string,
  promptStyle: string,
  aiScore: number,
  winnerText: string
): void {
  const record: WinnerRecord = {
    timestamp: Date.now(),
    inputHash: simpleHash(inputText),
    promptStyle,
    aiScore,
    textSnippet: winnerText.slice(0, 120),
  };
  const existing = getWinnerRecords();
  const updated = [record, ...existing].slice(0, 50); // keep last 50
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

export function getWinnerRecords(): WinnerRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearWinnerRecords(): void {
  localStorage.removeItem(LS_KEY);
}

// ──────────────────────────────────────────────────────────
// Score color helper
// ──────────────────────────────────────────────────────────
export function scoreToColor(score: number): string {
  if (score < 30) return '#00ff41';   // neon green — human
  if (score < 65) return '#eab308';   // yellow — uncertain
  return '#ef4444';                    // red — AI
}
