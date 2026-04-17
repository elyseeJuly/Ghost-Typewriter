/**
 * vectorScope.ts — 向量示波器引擎
 * 
 * 基于 @xenova/transformers 在客户端运行 all-MiniLM-L6-v2 模型，
 * 计算相邻句子的余弦相似度，输出语义热力图数据。
 * 
 * 对抗目标：拉升向量方差，打破 AI 文本的语义平滑死区
 * (AI text: adjacent sentence cosine similarity variance < 0.15)
 */

export type ModelState = 'idle' | 'loading' | 'ready' | 'error';

export interface HeatmapSegment {
  sentence: string;
  /** Cosine similarity with NEXT sentence (undefined for last) */
  simToNext: number | undefined;
  /** Risk level for this segment */
  risk: 'safe' | 'warm' | 'hot';
  /** Warning message if hot */
  warning?: string;
}

export interface VectorScopeResult {
  segments: HeatmapSegment[];
  /** Average similarity across all adjacent pairs */
  avgSimilarity: number;
  /** Number of "dead zone" pairs (sim > threshold) */
  hotZoneCount: number;
  /** Overall variance of similarities */
  variance: number;
}

export const VECTOR_THRESHOLDS = {
  hot: 0.85,   // > 0.85  → 红色死区，极端危险
  warm: 0.70,  // > 0.70  → 橙色警告区
} as const;

// ──────────────────────────────────────────────────────────
// 单例：全局 pipeline 缓存，避免重复加载模型
// ──────────────────────────────────────────────────────────
let _pipeline: any = null;
let _modelState: ModelState = 'idle';
let _stateListeners: Array<(state: ModelState, progress?: number) => void> = [];

export function subscribeModelState(cb: (state: ModelState, progress?: number) => void) {
  _stateListeners.push(cb);
  cb(_modelState);
  return () => {
    _stateListeners = _stateListeners.filter(l => l !== cb);
  };
}

function notifyState(state: ModelState, progress?: number) {
  _modelState = state;
  _stateListeners.forEach(l => l(state, progress));
}

export function getModelState(): ModelState {
  return _modelState;
}

/**
 * 预热/加载模型（可在后台提前调用）
 */
export async function loadVectorModel(
  onProgress?: (pct: number) => void
): Promise<void> {
  if (_pipeline) return; // already loaded
  if (_modelState === 'loading') return; // already in progress

  notifyState('loading', 0);
  try {
    // Dynamic import to avoid breaking the build if the package isn't installed
    const { pipeline, env } = await import('@xenova/transformers' as any);
    // Use WASM backend, prefer local cache
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    _pipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        progress_callback: (progressInfo: any) => {
          if (progressInfo?.progress !== undefined) {
            const pct = Math.round(progressInfo.progress);
            onProgress?.(pct);
            notifyState('loading', pct);
          }
        },
      }
    );
    notifyState('ready');
  } catch (err) {
    console.error('[VectorScope] Model load failed:', err);
    notifyState('error');
    throw err;
  }
}

// ──────────────────────────────────────────────────────────
// Cosine similarity helper (works on plain Float32Array / number[])
// ──────────────────────────────────────────────────────────
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * 将文本切分为句子（中英文双模式）
 */
function splitSentences(text: string): string[] {
  const raw = text
    .split(/([。！？\n!?\.]{1,3})/g)
    .reduce<string[]>((acc, part, i, arr) => {
      if (i % 2 === 0) {
        const delim = arr[i + 1] ?? '';
        const combined = (part + delim).trim();
        if (combined.length > 4) acc.push(combined);
      }
      return acc;
    }, []);

  // Fallback: if too few sentences, split by comma
  if (raw.length < 3) {
    return text.split(/[，,、；;]/).map(s => s.trim()).filter(s => s.length > 3);
  }
  return raw;
}

/**
 * 核心分析函数
 * 需要模型已加载（call loadVectorModel first）
 */
export async function analyzeSemanticVariance(
  text: string,
  onProgress?: (sentIdx: number, total: number) => void
): Promise<VectorScopeResult> {
  if (!_pipeline) {
    throw new Error('Model not loaded. Call loadVectorModel() first.');
  }

  const sentences = splitSentences(text);
  if (sentences.length < 2) {
    return {
      segments: sentences.map(s => ({ sentence: s, simToNext: undefined, risk: 'safe' as const })),
      avgSimilarity: 0,
      hotZoneCount: 0,
      variance: 1,
    };
  }

  // Extract embeddings
  const embeddings: number[][] = [];
  for (let i = 0; i < sentences.length; i++) {
    onProgress?.(i, sentences.length);
    const output = await _pipeline(sentences[i], { pooling: 'mean', normalize: true });
    // output.data is a Float32Array
    embeddings.push(Array.from(output.data as Float32Array));
  }

  // Calculate adjacent similarities
  const sims: number[] = [];
  for (let i = 0; i < embeddings.length - 1; i++) {
    sims.push(cosineSim(embeddings[i], embeddings[i + 1]));
  }

  const avgSim = sims.reduce((a, b) => a + b, 0) / sims.length;
  const variance = sims.reduce((acc, s) => acc + Math.pow(s - avgSim, 2), 0) / sims.length;

  const segments: HeatmapSegment[] = sentences.map((s, i) => {
    const sim = sims[i]; // undefined for last sentence
    let risk: HeatmapSegment['risk'] = 'safe';
    let warning: string | undefined;

    if (sim !== undefined) {
      if (sim > VECTOR_THRESHOLDS.hot) {
        risk = 'hot';
        warning = `与下一句语义余弦相似度 ${sim.toFixed(3)} > ${VECTOR_THRESHOLDS.hot}，处于语义死区。建议插入【感官记忆碎片】进行撕裂。`;
      } else if (sim > VECTOR_THRESHOLDS.warm) {
        risk = 'warm';
        warning = `与下一句相似度 ${sim.toFixed(3)}，偏高，可考虑适度调整。`;
      }
    }

    return { sentence: s, simToNext: sim, risk, warning };
  });

  return {
    segments,
    avgSimilarity: avgSim,
    hotZoneCount: sims.filter(s => s > VECTOR_THRESHOLDS.hot).length,
    variance,
  };
}

/**
 * 降级模式：纯启发式（无模型，基于词汇重叠率）
 * 当模型加载失败时自动使用
 */
export function analyzeHeuristic(text: string): VectorScopeResult {
  const sentences = splitSentences(text);
  if (sentences.length < 2) {
    return { segments: [{ sentence: text, simToNext: undefined, risk: 'safe' }], avgSimilarity: 0, hotZoneCount: 0, variance: 1 };
  }

  const tokenize = (s: string) => new Set(s.replace(/\s+/g, '').split(''));

  const sims: number[] = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    const a = tokenize(sentences[i]);
    const b = tokenize(sentences[i + 1]);
    const intersection = [...a].filter(x => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    sims.push(union === 0 ? 0 : intersection / union);
  }

  const avgSim = sims.reduce((a, b) => a + b, 0) / sims.length;
  const variance = sims.reduce((acc, s) => acc + Math.pow(s - avgSim, 2), 0) / sims.length;

  const segments: HeatmapSegment[] = sentences.map((s, i) => {
    const sim = sims[i];
    let risk: HeatmapSegment['risk'] = 'safe';
    let warning: string | undefined;
    if (sim !== undefined) {
      if (sim > 0.55) { risk = 'hot'; warning = `启发式重叠率 ${sim.toFixed(2)} 偏高，语义疑似过度平滑。`; }
      else if (sim > 0.35) { risk = 'warm'; }
    }
    return { sentence: s, simToNext: sim, risk, warning };
  });

  return { segments, avgSimilarity: avgSim, hotZoneCount: sims.filter(s => s > 0.55).length, variance };
}
